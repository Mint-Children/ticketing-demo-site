import React, { useState } from 'react';

export default function SuccessModal({ booking, onClose, onGoToConfirm }) {
  const [bookingNo] = useState(() => `TON-${Math.floor(10000000 + Math.random() * 89999999)}`);
  const { show, date, time, totalQty, totalPrice, selectedSeats } = booking;
  const seatLabel = (selectedSeats || [])
    .slice()
    .sort((a, b) => (a.row === b.row ? a.num - b.num : a.row.localeCompare(b.row)))
    .map((s) => `${s.row}${s.num}`)
    .join(', ');

  return (
    <div className="tk-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tk-modal">
        <button className="tk-modal-close" onClick={onClose} aria-label="닫기">×</button>

        <div className="tk-success-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="tk-success-title">예매 신청 완료</div>
        <p className="tk-success-desc">
          {show.captchaRequired
            ? 'AI CAPTCHA 인증이 완료되어 예매 신청이 접수되었습니다.'
            : '예매 신청이 정상적으로 접수되었습니다.'}
        </p>

        <div className="tk-receipt">
          <dl>
            <dt>예매번호</dt><dd>{bookingNo}</dd>
            <dt>공연명</dt><dd>{show.title}</dd>
            <dt>날짜</dt><dd>{date}</dd>
            <dt>회차</dt><dd>{time}</dd>
            <dt>좌석</dt><dd>{seatLabel || '-'}</dd>
            <dt>선택 좌석 수량</dt><dd>{totalQty}매</dd>
            <dt>총 결제 예정 금액</dt><dd>{totalPrice.toLocaleString()}원</dd>
          </dl>
        </div>

        <div className="tk-modal-actions">
          <button className="tk-ghost-btn" style={{ flex: 1 }} onClick={onGoToConfirm}>예매확인으로 이동</button>
          <button className="tk-book-btn" style={{ flex: 1 }} onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
}
