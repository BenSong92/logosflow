import type { Translation } from "@/types/bible";

/**
 * Translation licensing status (checked 2026-07 against 대한성서공회's own
 * copyright FAQ, https://www.bskorea.or.kr/bbs/board.php?bo_table=copyright_faq):
 *
 * - 개역한글 (KRV, 1961): property-rights term (50 years) has expired, so
 *   대한성서공회 states it may be used without royalty payment. Moral
 *   rights still apply — must attribute (성명표시권) and must not alter
 *   the text (동일성유지권). This is our real default Korean translation.
 * - 개역개정 (NKRV, 1998) and 현대인의 성경 (KLB, 생명의말씀사) are still
 *   under active copyright. No text is shipped for these yet — the reader
 *   shows them as selectable-but-locked so the UI/data shape is ready the
 *   moment a license is signed. See the app's Bible-text-licensing note
 *   for how to pursue that.
 * - 바른성경 (BRB, 한국성경공회): a secondhand source (not 한국성경공회's own
 *   copyright page, which was unreachable 2026-08-06 — broken TLS cert on
 *   ksbible.or.kr) claims their policy is no royalty for online/app use,
 *   unlike NKRV/KLB above. Unconfirmed — still locked until 한국성경공회
 *   confirms directly and provides the actual text data (a free royalty
 *   doesn't mean the text can just be scraped without permission).
 */
export const TRANSLATIONS: Translation[] = [
  {
    code: "KRV",
    nameKo: "개역한글",
    nameEn: "Korean Revised Version (1961)",
    language: "ko",
    licenseStatus: "free-attribution",
    attribution: "ⓒ 대한성서공회",
    licenseNote:
      "대한성서공회 — 저작재산권 보호기간(50년) 만료로 저작권료 없이 사용 가능. 성명표시권·동일성유지권 준수.",
  },
  {
    code: "NKRV",
    nameKo: "개역개정",
    nameEn: "New Korean Revised Version (1998)",
    language: "ko",
    licenseStatus: "pending-license",
    licenseNote:
      "대한성서공회 소유 — 아직 사용허가를 받지 못했어요. 대한성서공회 안내상 앱은 기본저작권료 100만원+다운로드 수 기준, 웹서비스는 판매정가의 3~7%(비영리/개인 할인 명시 없음, 2026-08-06 확인). 라이선스 확보 후 본문이 채워집니다.",
  },
  {
    code: "KLB",
    nameKo: "현대인의 성경",
    nameEn: "Korean Living Bible",
    language: "ko",
    licenseStatus: "pending-license",
    licenseNote: "생명의말씀사 소유 — 아직 사용허가를 받지 못했어요. 라이선스 확보 후 본문이 채워집니다.",
  },
  {
    code: "BRB",
    nameKo: "바른성경",
    nameEn: "Bareun Bible (1998)",
    language: "ko",
    licenseStatus: "pending-license",
    licenseNote:
      "한국성경공회 소유 — 앱/온라인 무료 사용 정책이라는 얘기가 있으나 공식 확인 전. 확인 및 본문 데이터 확보 후 채워집니다.",
  },
  {
    code: "WEB",
    nameKo: "World English Bible",
    nameEn: "World English Bible",
    language: "en",
    licenseStatus: "public-domain",
    licenseNote: "퍼블릭 도메인 — 제약 없이 자유롭게 사용 가능.",
  },
  {
    code: "KJV",
    nameKo: "킹제임스 흠정역",
    nameEn: "King James Version",
    language: "en",
    licenseStatus: "public-domain",
    licenseNote: "퍼블릭 도메인 — 제약 없이 자유롭게 사용 가능.",
  },
];

export const TRANSLATIONS_BY_CODE: Record<string, Translation> = Object.fromEntries(
  TRANSLATIONS.map((t) => [t.code, t])
);

export const DEFAULT_ACTIVE_TRANSLATIONS: Translation["code"][] = ["KRV", "WEB"];
