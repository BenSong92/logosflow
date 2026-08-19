export const metadata = {
  title: "개인정보처리방침 — LogosFlow",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-ink">
      <h1 className="text-2xl font-semibold">LogosFlow 개인정보처리방침</h1>
      <p className="mt-2 text-sm text-ink-muted">최종 업데이트: 2026년 8월 19일</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-ink">1. 수집하는 정보</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">
            <li>
              <span className="text-ink">계정 정보:</span> 로그인 시 이메일 주소와 비밀번호를
              수집합니다. 비밀번호는 저희 서버가 아닌 인증 제공업체(Supabase)가 암호화하여
              저장하며, LogosFlow는 평문 비밀번호에 접근하지 않습니다.
            </li>
            <li>
              <span className="text-ink">사용자 생성 콘텐츠:</span> 로그인한 사용자가 특정
              구절에 작성한 노트(메모)와 태그를 계정에 연결하여 저장합니다.
            </li>
            <li>
              <span className="text-ink">AI 기능 입력값:</span> AI 배경 해설, 설교 스케치,
              주제 검색, 관주 설명 기능을 사용하면 해당 구절 본문과 입력하신 검색어가 AI
              응답 생성을 위해 Google Gemini API로 전송됩니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">2. 수집하지 않는 정보</h2>
          <p className="mt-2 text-ink-muted">
            LogosFlow는 광고를 게재하지 않으며, 별도의 방문 분석(애널리틱스)이나 추적 도구를
            사용하지 않습니다. 위치 정보, 연락처, 기기 식별자 등을 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">3. 정보 이용 목적</h2>
          <p className="mt-2 text-ink-muted">
            수집된 정보는 오직 로그인 유지, 사용자가 작성한 노트 저장·동기화, AI 기능 응답
            생성을 위해서만 사용됩니다. 마케팅 목적으로 이용하거나 제3자에게 판매하지
            않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">4. 제3자 서비스</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">
            <li>
              <span className="text-ink">Supabase</span> — 계정 인증 및 노트 데이터베이스
              호스팅
            </li>
            <li>
              <span className="text-ink">Google Gemini API</span> — AI 해설·검색 기능의 응답
              생성 (전송되는 정보는 위 1항의 &ldquo;AI 기능 입력값&rdquo; 참고)
            </li>
            <li>
              <span className="text-ink">Vercel</span> — 웹사이트 호스팅
            </li>
          </ul>
          <p className="mt-2 text-ink-muted">
            각 서비스는 자체 개인정보처리방침에 따라 데이터를 처리합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">5. 데이터 보관 및 삭제</h2>
          <p className="mt-2 text-ink-muted">
            계정 정보와 노트는 계정이 유지되는 동안 보관됩니다. 계정 삭제 또는 저장된 노트
            삭제를 원하시면 아래 연락처로 요청해 주세요. 요청 확인 후 합리적인 기간 내에
            처리합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">6. 아동 개인정보</h2>
          <p className="mt-2 text-ink-muted">
            LogosFlow는 만 14세 미만 아동을 대상으로 서비스를 제공하지 않으며, 아동으로부터
            의도적으로 개인정보를 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">7. 문의</h2>
          <p className="mt-2 text-ink-muted">
            개인정보처리방침에 대한 문의나 데이터 삭제 요청은 아래 이메일로 연락해 주세요.
          </p>
          <p className="mt-2 text-ink">skkcbk@gmail.com</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink">8. 정책 변경</h2>
          <p className="mt-2 text-ink-muted">
            본 방침은 서비스 변경에 따라 갱신될 수 있으며, 변경 시 이 페이지에 최신 버전을
            게시합니다.
          </p>
        </section>
      </div>
    </main>
  );
}
