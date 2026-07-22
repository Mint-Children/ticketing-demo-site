import React from 'react';
import CaptchaDemo from './CaptchaDemo';

// AI-Captcha팀의 실제 CaptchaDemo 위젯이 들어가는 자리.
// 예전 mock 버전은 아스키 고양이 그림만 있는 정적 화면 + "인증 완료" 버튼이었지만,
// 여기서는 실제 경유 지점 드래그 CAPTCHA를 그대로 풀어야 다음 단계(예매 완료)로 넘어간다.
export default function CaptchaModal({ onCancel, onVerified }) {
  return (
    <div className="tk-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="tk-modal wide">
        <button className="tk-modal-close" onClick={onCancel} aria-label="닫기">×</button>

        <div className="vlur-captcha-scope">
          <CaptchaDemo onVerified={onVerified} />
        </div>

        <div className="tk-modal-actions">
          <button className="tk-ghost-btn" style={{ flex: 1 }} onClick={onCancel}>취소</button>
        </div>
      </div>
    </div>
  );
}
