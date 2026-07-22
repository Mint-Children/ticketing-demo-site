import React, { useState } from 'react';

export default function ShowDetail({ show, onBack, onStartBooking }) {
  const [date, setDate] = useState(show.dates[0]);
  const [time, setTime] = useState(show.times[0]);

  const handleBook = () => {
    onStartBooking({ show, date, time });
  };

  return (
    <div className="tk-wrap">
      <button className="tk-back" onClick={onBack}>← 목록으로</button>

      <div className="tk-detail">
        <div
          className="tk-detail-poster"
          style={{
            background: `linear-gradient(180deg, rgba(20,16,40,.05), rgba(20,16,40,.75)), url(${show.poster}) center/cover`,
          }}
        >
          <span className="tk-card-badge">{show.badge}</span>
          <strong>{show.title}</strong>
        </div>

        <div className="tk-detail-info">
          <div className="tk-eyebrow">{show.category}</div>
          <h1>{show.title}</h1>
          <div className="tk-subtitle">{show.subtitle}</div>

          <div className="tk-tags" style={{ marginBottom: 18 }}>
            {show.captchaRequired && <span className="tk-tag captcha">AI CAPTCHA 적용</span>}
            <span className="tk-tag">{show.traffic}</span>
          </div>

          <dl className="tk-info-list">
            <dt>공연기간</dt><dd>{show.period}</dd>
            <dt>장소</dt><dd>{show.venue}</dd>
            <dt>지역</dt><dd>{show.region}</dd>
            <dt>관심</dt><dd>{show.heart.toLocaleString()}</dd>
          </dl>

          <div className="tk-field-label">공연 소개</div>
          <p className="tk-detail-desc">{show.description}</p>
        </div>

        <div className="tk-booking">
          <div className="tk-booking-title">{show.category} 예매</div>
          <div className="tk-booking-sub">{show.title}</div>
          <div className="tk-booking-sub">{show.period}</div>
          <div className="tk-booking-sub" style={{ marginBottom: 4 }}>{show.venue}</div>
          <div className="tk-tags" style={{ margin: '8px 0 12px' }}>
            {show.captchaRequired && <span className="tk-tag captcha">AI CAPTCHA 적용</span>}
            <span className="tk-tag">{show.traffic}</span>
          </div>

          {show.captchaRequired && (
            <div className="tk-booking-warn">
              매크로 및 부정 예매 방지를 위해 보안 인증이 진행됩니다.
            </div>
          )}

          <div className="tk-field-label">관람일 선택</div>
          <div className="tk-pill-row">
            {show.dates.map((d) => (
              <button key={d} className={`tk-pill${date === d ? ' active' : ''}`} onClick={() => setDate(d)}>{d}</button>
            ))}
          </div>

          <div className="tk-field-label">회차 선택</div>
          <div className="tk-pill-row">
            {show.times.map((t) => (
              <button key={t} className={`tk-pill${time === t ? ' active' : ''}`} onClick={() => setTime(t)}>{t}</button>
            ))}
          </div>

          <p className="tk-seat-empty">좌석은 다음 단계(인증 완료 후)에서 배치도를 통해 직접 선택합니다.</p>

          <button className="tk-book-btn" onClick={handleBook}>예매하기</button>
          <button className="tk-ghost-btn" type="button">장바구니 담기</button>
          <button className="tk-ghost-btn" type="button">찜하기</button>
        </div>
      </div>
    </div>
  );
}
