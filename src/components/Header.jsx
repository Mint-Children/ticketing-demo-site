import React from 'react';

export default function Header({ onHome }) {
  return (
    <header className="tk-header">
      <div className="tk-header-row">
        <div className="tk-logo" onClick={onHome}>
          <b>티켓온</b>
          <span>TICKETON</span>
        </div>
        <div className="tk-search">⌕ 공연, 아티스트, 장소를 검색해 보세요</div>
        <nav className="tk-header-links">
          <a href="#login">로그인</a>
          <a href="#signup">회원가입</a>
          <a href="#mypage">마이페이지</a>
          <a href="#confirm">예매확인</a>
          <a href="#cart">장바구니<span className="tk-cart-badge">0</span></a>
        </nav>
      </div>
      <nav className="tk-subnav">
        <a href="#concert">콘서트</a>
        <a href="#musical">뮤지컬</a>
        <a href="#play">연극</a>
        <a href="#exhibit">전시</a>
        <a href="#sports">스포츠</a>
        <a href="#ranking">랭킹</a>
        <a href="#event">이벤트·혜택</a>
        <a href="#region">지역별</a>
      </nav>
    </header>
  );
}
