# 티켓온 TICKETON Demo

티켓온은 AI CAPTCHA 적용 예시를 보여주기 위한 fictional Korean ticketing demo website입니다. 실제 티켓 예매, 결제, 로그인 서버, 외부 API 호출은 포함하지 않습니다.

## 목적

- JSK-AI-Captcha 서비스를 실제 고객 사이트에 적용했을 때의 흐름을 보여주는 프론트엔드 전용 데모
- 티켓 예매 과정에서 AI CAPTCHA 인증 모달이 노출되고, 인증 완료 후 예매 내역이 생성되는 UX 시연
- Interpark Ticket, YES24 Ticket, Melon Ticket, Time Ticket 같은 국내 티켓팅 서비스 느낌을 참고하되 실제 로고, 문구, 이미지, 브랜드 자산은 사용하지 않음

## 주요 기능

- Home / ticketing platform main page
- Event detail / selected-event booking page
- Search results page
- Category pages: 콘서트, 뮤지컬, 연극, 전시, 스포츠
- Ranking page
- Benefits page
- Region filter page
- Quick date reservation page
- Login page
- Signup page
- My Page
- Reservation confirmation page
- Cart page
- Mock AI CAPTCHA verification modal
- Reservation complete modal
- LocalStorage 기반 mock 회원, 장바구니, 예매 내역 저장
- 고위험 예매에만 적용되는 선택적 AI CAPTCHA 정책
- 예매 대기열/트래픽 혼잡 mock
- 봇 의심 사용자 데모 시나리오

## 데모 동작

- 홈 화면은 단일 공연 상세가 아니라 여러 공연을 탐색하는 티켓팅 플랫폼형 화면으로 구성되어 있습니다.
- 공연 카드, 랭킹 항목, 검색 결과, 카테고리 결과, 날짜별 빠른 예매 항목을 클릭하면 선택한 공연의 상세/예매 화면으로 이동합니다.
- 예매 패널은 선택한 공연의 날짜, 회차, 좌석 등급, 가격을 사용합니다.
- 고위험 공연은 `예매하기`를 누르면 대기열 mock 이후 AI CAPTCHA 인증 모달이 열립니다.
- 일반/저위험 공연은 CAPTCHA 없이 바로 예매 신청 완료 모달로 이동합니다.
- CAPTCHA 인증 완료 또는 일반 예매 완료 후 mock 예매 내역이 생성되고 `예매확인`과 `My Page`에 반영됩니다.
- `장바구니 담기`로 선택한 공연을 장바구니에 저장하고, 장바구니에서도 CAPTCHA 인증 후 예매 내역을 생성할 수 있습니다.
- 장바구니에 AI CAPTCHA 보호 대상 공연이 포함되면 결제 진행 시 같은 보안 정책이 적용됩니다.
- 상단 검색창은 공연명, 카테고리, 장소, 지역, 설명 기준으로 mock 데이터를 검색합니다.
- 3줄 메뉴 버튼은 카테고리, 랭킹, 이벤트·혜택, 지역별, 고객센터, 예매 가이드 항목을 가진 드로어를 엽니다.

## 선택적 AI CAPTCHA 정책

- `김우진 단독 콘서트 오늘, 우리`, `더 넥스트 챕터`, `FC 서울 vs 전북 현대`는 인기 콘서트/스포츠 경기 또는 티켓 오픈 rush 상황을 가정해 AI CAPTCHA 보호 대상입니다.
- `빛의 바다, 제주`, `셰익스피어 인 러브`, `고흐 미디어 아트전` 같은 일반/저위험 공연은 CAPTCHA 없이 빠르게 예매됩니다.
- 상세 페이지의 `데모 시나리오`에서 `봇 의심 사용자`를 선택하면 저위험 공연도 추가 AI CAPTCHA 인증을 거칩니다.
- 성공 모달과 예매 내역에는 `AI CAPTCHA 인증 완료`, `일반 예매`, `추가 인증 완료` 같은 보안 처리 결과가 표시됩니다.

## Mock Login Account

- ID: `demo`
- Password: `demo1234`
- Name: `김준수`
- Email: `demo@ticketon.kr`

## 실행 방법

```bash
cd /Users/apple/ticketing-demo-site
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 구현 메모

- React + Vite 기반 SPA입니다.
- 라우팅 라이브러리 없이 React state로 화면을 전환합니다.
- Plain CSS만 사용했습니다.
- Tailwind, 외부 UI 라이브러리, 백엔드, 데이터베이스, 외부 API, `.env`, secret은 사용하지 않습니다.
- 포스터와 배너는 CSS gradients, typography, fake poster card로만 구성했습니다.
- AI CAPTCHA는 데모용 mock UI입니다. 실제 보안 검증은 수행하지 않습니다.
- 대기열, 위험도, 봇 의심 패턴 감지도 발표용 mock UI이며 실제 트래픽 제어나 사용자 판정을 수행하지 않습니다.
- 추후 JSK-AI-Captcha API와 연결할 때는 CAPTCHA modal의 인증 완료 동작을 실제 서버 검증 호출로 교체하면 됩니다.
