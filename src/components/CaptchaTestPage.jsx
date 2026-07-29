import React, { useState } from 'react';
import CaptchaModal from './CaptchaModal';

export default function CaptchaTestPage() {
  const [verified, setVerified] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const reset = () => {
    setVerified(false);
    setAttempt((current) => current + 1);
  };

  return (
    <main className="tk-captcha-test">
      <section className="tk-captcha-test-panel" aria-labelledby="captcha-test-title">
        <div className="tk-captcha-test-heading">
          <span>DEVELOPMENT ONLY</span>
          <h1 id="captcha-test-title">CAPTCHA 평가</h1>
          <p>실제 CAPTCHA API를 사용하는 독립 테스트 화면입니다.</p>
        </div>

        {!verified ? (
          <div className="vlur-captcha-scope">
            <CaptchaModal
              key={attempt}
              onVerified={() => setVerified(true)}
              onCancel={() => {}}
            />
          </div>
        ) : (
          <div className="tk-captcha-test-result" aria-live="polite">
            <div className="tk-success-icon" aria-hidden="true">✓</div>
            <div className="tk-success-title">CAPTCHA 검증 완료</div>
            <p className="tk-success-desc">평가기가 확인할 성공 상태가 표시되었습니다.</p>

            <dl className="tk-queue-info" data-testid="captcha-success">
              <dt>검증 상태</dt>
              <dd>성공</dd>
              <dt>다음 단계</dt>
              <dd>대기열 입장 가능</dd>
            </dl>

            <button className="tk-ghost-btn" type="button" onClick={reset}>
              새 CAPTCHA 테스트
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
