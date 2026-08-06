// Resumable batch job: build word/phrase-level Strong's-number links for the
// 개역한글(KRV) translation, using the existing KJV word-links as a scaffold.
// Gemini's only job per verse is to say *which* already-known KJV/Strong's tag
// corresponds to *which* substring of the Korean text — it never invents a
// Strong's number itself, which keeps hallucination risk low.
//
// Output: public/bible-data/strongs/krv-links-{BOOK}.json, one file per book,
// same WordLinkSpan[][][] shape as the existing kjv-links-{BOOK}.json files
// (chapter index -> verse index -> [term, strongNumbers[]][]).
//
// Resumable at the verse level: a verse slot holding `null` (or a hole, which
// JSON round-trips to `null`) means "not yet processed"; an explicit `[]` means
// "processed, no confident Korean match found". Chapters where KJV and KRV have
// a different verse count (versification mismatch) are marked fully done with
// empty arrays up front, without spending an API call, since index-based
// pairing isn't safe for them.
//
// Usage: node scripts/translate-krv-links.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "public/bible-data");
const ENV_PATH = path.join(ROOT, ".env.local");

function loadApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  const envContent = fs.readFileSync(ENV_PATH, "utf8");
  const match = envContent.match(/^GEMINI_API_KEY=(.*)$/m);
  const key = (match ? match[1] : "").trim();
  if (!key) throw new Error("GEMINI_API_KEY not set (checked env var and .env.local)");
  return key;
}

// Canonical 66-book order (Genesis -> Revelation), matching the existing
// public/bible-data/KJV/*.json file set.
const BOOKS = [
  "GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA",
  "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO",
  "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO",
  "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL", "MAT",
  "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP",
  "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE",
  "2PE", "1JN", "2JN", "3JN", "JUD", "REV",
];

const MODEL = "gemini-3.6-flash";
// Verses per request, not entries — start conservative like the lexicon job
// did (100 -> 300 after real-world testing); tune this after watching a few
// real automated runs.
const BATCH_SIZE = 40;
const MAX_RETRIES = 4;
const DELAY_BETWEEN_BATCHES_MS = 3000;
const MAX_RUNTIME_MS = 10 * 60 * 1000;

const SYSTEM_INSTRUCTION = `당신은 성경 원어(히브리어/헬라어) 대조 전문가입니다.
각 구절마다 개역한글 한국어 본문과, 그 구절 영어 KJV 단어에 붙어있는 원어 Strong's
번호 태그 목록(인덱스 포함)을 드립니다. 각 태그 인덱스가 개역한글 문장의 어느
부분 문자열에 해당하는지 찾아주세요. 규칙:
- term은 반드시 주어진 개역한글 원문에 실제로 등장하는 부분 문자열이어야 합니다.
  글자를 바꾸거나 새로 만들어내면 안 됩니다 (복사해서 붙여넣듯이 정확히).
- 대응되는 한국어 표현이 뚜렷하지 않으면 그 인덱스는 그냥 생략하세요. 억지로 끼워
  맞추지 마세요.
- 같은 인덱스를 두 번 쓰지 마세요. 하나의 한국어 단어가 여러 원어 단어를 아울러
  번역한 경우, 그 중 가장 핵심적인 태그 하나에만 연결하세요.
- 결과 순서는 신경 쓰지 않아도 됩니다.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    verses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          verseKey: { type: "string" },
          mappings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                idx: { type: "integer" },
                term: { type: "string" },
              },
              required: ["idx", "term"],
            },
          },
        },
        required: ["verseKey", "mappings"],
      },
    },
  },
  required: ["verses"],
};

function buildPrompt(items) {
  const blocks = items.map((it) => {
    const tagLines = it.kjvSpans
      .map((span, i) => `[${i}] ${span[0]} (${span[1].join(",")})`)
      .join(", ");
    return `${it.verseKey}\n개역한글: "${it.krText}"\n원어 태그: ${tagLines}`;
  });
  return `다음 구절들에 대해 원어 태그와 개역한글 단어를 매칭해 주세요. 모든 구절에
대해 하나씩(매칭이 하나도 없으면 mappings: [] 로) 응답하세요.

${blocks.join("\n\n")}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class DailyQuotaExceeded extends Error {}

function isDailyQuotaError(err) {
  const msg = String(err?.message ?? err);
  return msg.includes("RESOURCE_EXHAUSTED") && msg.includes("PerDay");
}

async function translateBatch(client, items, attempt = 1) {
  try {
    const res = await client.models.generateContent({
      model: MODEL,
      contents: buildPrompt(items),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseJsonSchema: RESPONSE_SCHEMA,
      },
    });
    const raw = res.text;
    if (!raw) throw new Error("empty response");
    const parsed = JSON.parse(raw);
    const verses = parsed.verses;
    if (!Array.isArray(verses)) throw new Error("malformed response shape");
    return verses;
  } catch (err) {
    if (isDailyQuotaError(err)) {
      throw new DailyQuotaExceeded(String(err.message ?? err));
    }
    const retryable = err instanceof Error && err.constructor.name !== "TypeError";
    if (!retryable || attempt >= MAX_RETRIES) throw err;
    const backoff = Math.min(3000 * 2 ** (attempt - 1), 20000);
    console.warn(
      `  batch retry ${attempt}/${MAX_RETRIES} after ${backoff}ms: ${String(err).slice(0, 150)}`
    );
    await sleep(backoff);
    return translateBatch(client, items, attempt + 1);
  }
}

// Reproduces the same left-to-right, non-overlapping substring scan that
// components/reader/strong-linked-text.tsx uses at render time, so anything
// we save here is guaranteed renderable.
function buildValidatedSpans(krText, mappings, kjvSpans) {
  const seenIdx = new Set();
  const withPos = [];
  for (const m of mappings ?? []) {
    if (!m || typeof m.idx !== "number" || typeof m.term !== "string" || !m.term) continue;
    if (m.idx < 0 || m.idx >= kjvSpans.length) continue;
    if (seenIdx.has(m.idx)) continue;
    const pos = krText.indexOf(m.term);
    if (pos === -1) continue;
    seenIdx.add(m.idx);
    withPos.push({ idx: m.idx, term: m.term, pos });
  }
  withPos.sort((a, b) => a.pos - b.pos);

  const result = [];
  let cursor = 0;
  for (const { idx, term } of withPos) {
    const at = krText.indexOf(term, cursor);
    if (at === -1) continue;
    result.push([term, kjvSpans[idx][1]]);
    cursor = at + term.length;
  }
  return result;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

// Manual spot-check helper: `TEST_BOOK=JHN TEST_CHAPTER=1 node scripts/translate-krv-links.mjs`
// restricts the run to one book (and optionally one chapter within it), so you
// can validate output quality without burning quota on the full queue.
const TEST_BOOK = process.env.TEST_BOOK || null;
const TEST_CHAPTER = process.env.TEST_CHAPTER ? Number(process.env.TEST_CHAPTER) : null;

async function main() {
  const apiKey = loadApiKey();
  const client = new GoogleGenAI({ apiKey });

  const booksToProcess = TEST_BOOK ? BOOKS.filter((b) => b === TEST_BOOK) : BOOKS;
  if (TEST_BOOK) console.log(`[테스트 모드] ${TEST_BOOK}${TEST_CHAPTER ? ` ${TEST_CHAPTER}장` : ""}만 처리`);

  // Phase 1: scan every book, auto-complete anything that needs no API call
  // (versification-mismatched chapters, verses with zero KJV tags), and build
  // the work queue for everything else.
  const bookState = new Map();
  const queue = [];
  let autoCompleted = 0;

  for (const bookId of booksToProcess) {
    const kjv = readJson(path.join(DATA_DIR, `KJV/${bookId}.json`));
    const krv = readJson(path.join(DATA_DIR, `KRV/${bookId}.json`));
    const kjvLinksPath = path.join(DATA_DIR, `strongs/kjv-links-${bookId}.json`);
    const kjvLinks = fs.existsSync(kjvLinksPath) ? readJson(kjvLinksPath) : [];
    const outPath = path.join(DATA_DIR, `strongs/krv-links-${bookId}.json`);
    const out = fs.existsSync(outPath) ? readJson(outPath) : [];

    let dirty = false;
    for (let c = 0; c < krv.length; c++) {
      if (TEST_CHAPTER && c !== TEST_CHAPTER - 1) continue;
      if (!out[c]) out[c] = [];
      const krChapter = krv[c];
      const kjvChapter = kjv[c] ?? [];
      const kjvLinksChapter = kjvLinks[c] ?? [];
      const mismatched = kjvChapter.length !== krChapter.length;

      for (let v = 0; v < krChapter.length; v++) {
        if (out[c][v] != null) continue; // already processed (null-check catches holes too)

        if (mismatched) {
          out[c][v] = [];
          dirty = true;
          autoCompleted++;
          continue;
        }
        const spans = kjvLinksChapter[v] ?? [];
        if (spans.length === 0) {
          out[c][v] = [];
          dirty = true;
          autoCompleted++;
          continue;
        }
        queue.push({
          bookId,
          c,
          v,
          verseKey: `${bookId}:${c + 1}:${v + 1}`,
          krText: krChapter[v],
          kjvSpans: spans,
        });
      }
    }

    bookState.set(bookId, { out, outPath });
    if (dirty) fs.writeFileSync(outPath, JSON.stringify(out));
  }

  console.log(`자동 완료(원어 태그 없음/절 수 불일치): ${autoCompleted}개, 큐에 남은 절: ${queue.length}개`);

  // Phase 2: work the queue in batches, same rhythm as the lexicon job.
  const batches = [];
  for (let i = 0; i < queue.length; i += BATCH_SIZE) {
    batches.push(queue.slice(i, i + BATCH_SIZE));
  }

  let stoppedOnQuota = false;
  const startedAt = Date.now();
  let totalTagged = 0;

  for (let i = 0; i < batches.length; i++) {
    if (Date.now() - startedAt > MAX_RUNTIME_MS) {
      console.log(`시간 예산(${MAX_RUNTIME_MS / 60000}분)을 다 써서 여기서 멈춰요. 내일 이어서 진행돼요.`);
      break;
    }
    const batch = batches[i];
    try {
      const verses = await translateBatch(client, batch);
      const byKey = new Map(verses.map((v) => [v.verseKey, v.mappings ?? []]));
      const touchedBooks = new Set();

      for (const item of batch) {
        const mappings = byKey.get(item.verseKey);
        if (!mappings) continue; // model dropped this verse; stays unprocessed, retried later
        const state = bookState.get(item.bookId);
        state.out[item.c][item.v] = buildValidatedSpans(item.krText, mappings, item.kjvSpans);
        totalTagged++;
        touchedBooks.add(item.bookId);
      }
      for (const bookId of touchedBooks) {
        const state = bookState.get(bookId);
        fs.writeFileSync(state.outPath, JSON.stringify(state.out));
      }
      console.log(`batch ${i + 1}/${batches.length} done — 이번 실행 누적 ${totalTagged}개 절 태깅`);
    } catch (err) {
      if (err instanceof DailyQuotaExceeded) {
        console.log("오늘의 무료 사용량을 다 썼어요. 내일 다시 실행하면 이어서 진행돼요.");
        stoppedOnQuota = true;
        break;
      }
      console.error(`  batch ${i} failed permanently: ${String(err).slice(0, 200)}`);
    }
    await sleep(DELAY_BETWEEN_BATCHES_MS);
  }

  console.log(`이번 실행 요약 — 자동 완료: ${autoCompleted}, AI로 태깅: ${totalTagged}, 남은 큐: ${queue.length - totalTagged}`);
  if (!stoppedOnQuota && queue.length - totalTagged === 0 && autoCompleted + totalTagged > 0) {
    console.log("이번 실행에서 큐를 모두 처리했어요.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
