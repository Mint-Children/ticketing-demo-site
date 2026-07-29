import React, { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_VLUR_SITE_KEY;
const CALLBACK_NAME = '__vlurCaptchaOnVerified';

// AI-Captcha팀이 배포하는 VLUR CAPTCHA 임베드 위젯이 들어가는 자리.
// 컴포넌트를 직접 렌더링하지 않고, index.html이 불러온 vlur-captcha.js가 이 data-sitekey
// div를 찾아 스스로 마운트한다 — 위젯 UI/디자인은 전적으로 vlur.site 쪽 배포에 달려 있다.
export default function CaptchaModal({ onCancel, onVerified }) {
  const hostRef = useRef(null);

  useEffect(() => {
    window[CALLBACK_NAME] = () => onVerified?.();
    return () => { delete window[CALLBACK_NAME]; };
  }, [onVerified]);

  useEffect(() => {
    // 위젯 스크립트가 main.jsx보다 늦게 로드될 수도 있으므로, 이미 로드돼 있으면 즉시,
    // 아니라면 MutationObserver가 알아서 감지하므로 별도 재시도는 필요 없다.
    if (hostRef.current) window.VlurCaptcha?.render(hostRef.current);
  }, []);

  return (
    <div className="tk-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div
        ref={hostRef}
        className="vlur-captcha"
        data-sitekey={SITE_KEY}
        data-callback={CALLBACK_NAME}
      />
    </div>
  );
}
