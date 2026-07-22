import React, { useEffect, useState } from 'react';

const START_AHEAD_MIN = 5;
const START_AHEAD_MAX = 9;
const TICK_MS = 650;

export default function QueueModal({ booking, onCancel, onEnter }) {
  const [queueNo] = useState(() => 1000 + Math.floor(Math.random() * 9000));
  const [aheadCount, setAheadCount] = useState(
    () => START_AHEAD_MIN + Math.floor(Math.random() * (START_AHEAD_MAX - START_AHEAD_MIN + 1))
  );
  const { show } = booking;

  useEffect(() => {
    if (aheadCount <= 0) {
      onEnter();
      return;
    }
    const timer = setTimeout(() => setAheadCount((n) => n - 1), TICK_MS);
    return () => clearTimeout(timer);
  }, [aheadCount, onEnter]);

  return (
    <div className="tk-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="tk-modal">
        <button className="tk-modal-close" onClick={onCancel} aria-label="닫기">×</button>
        <div className="tk-modal-eyebrow">TRAFFIC QUEUE</div>
        <h2>예매 대기열 입장</h2>
        <p className="tk-modal-desc">
          보안 확인이 완료되었습니다.<br/>
          현재 접속자가 많아 예매 대기열을 거쳐 순차적으로 입장 중입니다.
        </p>

        <div className="tk-queue-icon">⏳</div>

        <dl className="tk-queue-info">
          <dt>대상 공연</dt><dd>{show.title}</dd>
          <dt>대기번호</dt><dd>{queueNo.toLocaleString()}번</dd>
          <dt>내 앞 대기 인원</dt><dd>{aheadCount}명</dd>
          <dt>트래픽</dt><dd>{show.traffic}{show.captchaRequired ? ' · AI CAPTCHA 적용' : ''}</dd>
        </dl>

        <p className="tk-queue-auto-msg">대기 인원이 모두 빠지면 자동으로 입장합니다…</p>

        <div className="tk-modal-actions">
          <button className="tk-ghost-btn" onClick={onCancel}>취소</button>
        </div>
      </div>
    </div>
  );
}
