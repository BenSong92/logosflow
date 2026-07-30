# LogosFlow

성경을 읽고 연구하는 웹앱입니다. 여러 번역본을 나란히 보고, 원어(히브리어/헬라어) 스트롱 사전을 찾아보고, 관주(교차 참조)를 따라가고, AI로 배경 설명이나 청소년 설교 스케치를 생성하고, 계정별로 노트를 남길 수 있어요.

## 기능

- **다중 번역본**: 개역한글(KRV), WEB, KJV 나란히 보기
- **원어 연구**: KJV 구절마다 스트롱 번호로 태깅된 원어 단어, 히브리어/헬라어 사전(일부 한글 번역 포함)
- **관주**: 구절 간 교차 참조
- **AI 탭**: Gemini로 맥락/배경 해설, 청소년 설교 스케치 생성 (미설정 시 데모 응답으로 대체)
- **노트**: 로그인한 계정별로 저장, 기기 간 동기화 (Supabase)

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속.

### 환경변수

`.env.local.example`을 복사해 `.env.local`을 만들고 값을 채워주세요:

```bash
cp .env.local.example .env.local
```

- `GEMINI_API_KEY` — [Google AI Studio](https://aistudio.google.com/apikey)에서 무료 발급. 없으면 AI 탭이 데모 응답으로 동작해요.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — [Supabase](https://supabase.com) 무료 프로젝트의 Project Settings에서 확인. 없으면 로그인/노트 기능이 "설정이 필요해요" 안내로 대체돼요.

Supabase를 쓰려면 프로젝트의 SQL Editor에서 `supabase/schema.sql`을 한 번 실행해 노트 테이블을 만들어야 해요.

## 기술 스택

Next.js (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · Zustand · TanStack Query · Radix UI · Google Gemini (`@google/genai`) · Supabase (Auth + Postgres)

## 라이선스 / 성경 본문 출처

- 개역한글(KRV): 대한성서공회 저작재산권 만료, 무료 사용 가능 (성명표시권 유지)
- WEB, KJV: 퍼블릭 도메인
- 관주 데이터: [openbible.info](https://openbible.info) Cross References (CC-BY), Treasury of Scripture Knowledge 기반
- 스트롱 사전: 1890 Strong's Exhaustive Concordance, 퍼블릭 도메인
