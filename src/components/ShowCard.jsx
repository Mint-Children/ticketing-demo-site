import React from 'react';

export default function ShowCard({ show, onSelect }) {
  return (
    <article className="tk-card" onClick={() => onSelect(show.id)}>
      <div
        className="tk-card-art"
        style={{
          background: `linear-gradient(180deg, rgba(20,16,40,.05), rgba(20,16,40,.75)), url(${show.poster}) center/cover`,
        }}
      >
        <span className="tk-card-badge">{show.badge}</span>
        <strong>{show.title}</strong>
      </div>
      <div className="tk-card-body">
        <div className="tk-card-cat">{show.category}</div>
        <div className="tk-card-title">{show.title}</div>
        <div className="tk-tags">
          {show.captchaRequired && <span className="tk-tag captcha">클린예매 서비스 적용</span>}
          <span className="tk-tag">{show.traffic}</span>
        </div>
        <div className="tk-card-meta">{show.period}</div>
        <div className="tk-card-meta">{show.venue} · {show.region}</div>
        <div className="tk-heart">♥ {show.heart.toLocaleString()}</div>
      </div>
    </article>
  );
}
