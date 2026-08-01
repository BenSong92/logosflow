// One-off batch job: translate the Strong's lexicon's English definitions into
// Korean via Gemini. Resumable — re-running skips strongNumbers already present
// in the output checkpoint file.
//
// The free Gemini tier caps this app's model at ~20 requests/day (shared with
// the live AI tab), so this script processes as much as one day's quota allows
// (big batches, no concurrency) and then exits cleanly instead of burning
// retries against an exhausted daily cap. Re-run once a day until it reports
// "remaining: 0".
//
// Usage: node scripts/translate-lexicon.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LEXICON_PATH = path.join(ROOT, "public/bible-data/strongs/lexicon.json");
const OUTPUT_PATH = path.join(ROOT, "public/bible-data/strongs/lexicon.ko.json");
const ENV_PATH = path.join(ROOT, ".env.local");

function loadApiKey() {
  // CI (GitHub Actions) injects this directly as a real env var, from a repo secret.
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();

  // Local dev: read straight from .env.local instead of requiring dotenv as a dependency.
  const envContent = fs.readFileSync(ENV_PATH, "utf8");
  const match = envContent.match(/^GEMINI_API_KEY=(.*)$/m);
  const key = (match ? match[1] : "").trim();
  if (!key) throw new Error("GEMINI_API_KEY not set (checked env var and .env.local)");
  return key;
}

const MODEL = "gemini-3.6-flash";
// The real daily bottleneck is Gemini's free-tier requests-per-day cap, not this
// number — observed so far: exactly 1 request succeeds per day before quota exhausts.
// So a bigger batch means more entries per that one daily request. Raised from 100
// in steps (not maxed out blindly) since an oversized batch risks a truncated/
// malformed response, which burns the day's one request for zero progress.
const BATCH_SIZE = 300;
const MAX_RETRIES = 4;
const DELAY_BETWEEN_BATCHES_MS = 3000;
// Stop translating (and let the caller commit whatever's done) with enough buffer
// before the CI job's own timeout-minutes kills the whole process mid-batch —
// which would silently drop everything translated that run, since the "commit and
// push" step never gets to run after a hard job timeout/cancellation.
const MAX_RUNTIME_MS = 10 * 60 * 1000;

const SYSTEM_INSTRUCTION = `당신은 성경 원어(히브리어/헬라어) 사전 편찬자입니다.
스트롱 사전(Strong's Exhaustive Concordance)의 영어 정의를 한국 성경 독자를 위한
자연스러운 한국어 사전 뜻풀이로 옮깁니다. 규칙:
- 단어 대 단어 직역이 아니라, 한국 신학/성경 독자에게 익숙한 자연스러운 한국어 사전체 문장으로 씁니다.
- 인명·지명의 어원적 의미(예: "father of a multitude")가 있으면 그 뜻도 한국어로 살려서 옮깁니다.
- 정보를 새로 지어내거나 원문에 없는 해석을 덧붙이지 않습니다.
- 간결하게, 1~3문장으로 작성합니다.
- 존댓말이 아닌 사전적 서술체(예: "~을 뜻함", "~하는 것")로 씁니다.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    entries: {
      type: "array",
      items: {
        type: "object",
        properties: {
          strongNumber: { type: "string" },
          definitionKo: { type: "string" },
        },
        required: ["strongNumber", "definitionKo"],
      },
    },
  },
  required: ["entries"],
};

function buildPrompt(batch) {
  const lines = batch.map(
    (e) =>
      `${e.strongNumber} | ${e.language} | 원어: ${e.original} (${e.transliteration}) | 영어 정의: ${e.definition}`
  );
  return `다음은 스트롱 사전 항목들입니다. 각 항목의 "영어 정의"를 한국어로 옮겨 주세요.
반드시 입력에 있는 모든 strongNumber에 대해 하나씩 응답하세요.

${lines.join("\n")}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class DailyQuotaExceeded extends Error {}

function isDailyQuotaError(err) {
  const msg = String(err?.message ?? err);
  return msg.includes("RESOURCE_EXHAUSTED") && msg.includes("PerDay");
}

async function translateBatch(client, batch, attempt = 1) {
  try {
    const res = await client.models.generateContent({
      model: MODEL,
      contents: buildPrompt(batch),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseJsonSchema: RESPONSE_SCHEMA,
      },
    });
    const raw = res.text;
    if (!raw) throw new Error("empty response");
    const parsed = JSON.parse(raw);
    const entries = parsed.entries;
    if (!Array.isArray(entries)) throw new Error("malformed response shape");
    return entries;
  } catch (err) {
    if (isDailyQuotaError(err)) {
      throw new DailyQuotaExceeded(String(err.message ?? err));
    }
    // A bug in this script (bad request shape, SDK/runtime incompatibility, etc.) will fail
    // identically on every retry and every batch — retrying just burns the whole job's time.
    // Only network/API-level errors (ApiError from the SDK, or a plain Error we threw above
    // for a bad response) are worth retrying.
    const retryable = err instanceof Error && err.constructor.name !== "TypeError";
    if (!retryable || attempt >= MAX_RETRIES) throw err;
    const backoff = Math.min(3000 * 2 ** (attempt - 1), 20000);
    console.warn(
      `  batch retry ${attempt}/${MAX_RETRIES} after ${backoff}ms: ${String(err).slice(0, 150)}`
    );
    await sleep(backoff);
    return translateBatch(client, batch, attempt + 1);
  }
}

async function main() {
  const apiKey = loadApiKey();
  const client = new GoogleGenAI({ apiKey });

  const lexicon = JSON.parse(fs.readFileSync(LEXICON_PATH, "utf8"));
  const allKeys = Object.keys(lexicon);

  let done = {};
  if (fs.existsSync(OUTPUT_PATH)) {
    done = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
  }

  const remainingKeys = allKeys.filter((k) => !(k in done));
  console.log(
    `total: ${allKeys.length}, already done: ${allKeys.length - remainingKeys.length}, remaining: ${remainingKeys.length}`
  );

  const batches = [];
  for (let i = 0; i < remainingKeys.length; i += BATCH_SIZE) {
    batches.push(remainingKeys.slice(i, i + BATCH_SIZE).map((k) => lexicon[k]));
  }

  let stoppedOnQuota = false;
  const startedAt = Date.now();

  for (let i = 0; i < batches.length; i++) {
    if (Date.now() - startedAt > MAX_RUNTIME_MS) {
      console.log(`시간 예산(${MAX_RUNTIME_MS / 60000}분)을 다 써서 여기서 멈춰요. 내일 이어서 진행돼요.`);
      break;
    }
    try {
      const entries = await translateBatch(client, batches[i]);
      for (const e of entries) {
        if (e && e.strongNumber && e.definitionKo) {
          done[e.strongNumber] = e.definitionKo;
        }
      }
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(done));
      console.log(`batch ${i + 1}/${batches.length} done — ${Object.keys(done).length} total so far`);
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

  const totalDone = Object.keys(done).length;
  console.log(`translated total: ${totalDone}/${allKeys.length}`);
  if (!stoppedOnQuota && totalDone < allKeys.length) {
    console.log(`remaining: ${allKeys.length - totalDone} — re-run to continue.`);
  } else if (totalDone >= allKeys.length) {
    console.log("all done!");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
