import React, { useState } from 'react';

const METHODS = [
  { key: 'kakao', label: '카카오페이', desc: '카카오톡으로 간편결제' },
  { key: 'toss', label: '토스페이먼츠', desc: '토스 앱으로 간편결제' },
  { key: 'card', label: '신용/체크카드', desc: '일반 카드 결제' },
];

export default function PaymentModal({ booking, onCancel, onPay }) {
  const [method, setMethod] = useState('kakao');
  const { show, date, time, selectedSeats, totalPrice } = booking;

  const seatLabel = (selectedSeats || [])
    .slice()
    .sort((a, b) => (a.row === b.row ? a.num - b.num : a.row.localeCompare(b.row)))
    .map((s) => `${s.row}${s.num}`)
    .join(', ');

  return (
    <div className="tk-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="tk-modal">
        <button className="tk-modal-close" onClick={onCancel} aria-label="닫기">×</button>
        <div className="tk-modal-eyebrow">PAYMENT</div>
        <h2>결제하기</h2>
        <p className="tk-modal-desc">결제 수단을 선택하고 결제를 완료해 주세요. (데모 화면으로 실제 결제는 발생하지 않습니다)</p>

        <div className="tk-receipt">
          <dl>
            <dt>공연명</dt><dd>{show.title}</dd>
            <dt>날짜</dt><dd>{date} {time}</dd>
            <dt>좌석</dt><dd>{seatLabel || '-'}</dd>
          </dl>
        </div>

        <div className="tk-field-label">결제 수단</div>
        <div className="tk-payment-methods">
          {METHODS.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`tk-payment-method${method === m.key ? ' active' : ''}`}
              onClick={() => setMethod(m.key)}
            >
              <span className="tk-payment-method-name">{m.label}</span>
              <span className="tk-payment-method-desc">{m.desc}</span>
            </button>
          ))}
        </div>

        <div className="tk-captcha-price">
          <span>총 결제 금액</span>
          <b>{totalPrice.toLocaleString()}원</b>
        </div>

        <div className="tk-modal-actions">
          <button className="tk-ghost-btn" style={{ flex: 1 }} onClick={onCancel}>취소</button>
          <button className="tk-book-btn" style={{ flex: 2 }} onClick={onPay}>결제하기</button>
        </div>
      </div>
    </div>
  );
}
