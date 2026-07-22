// CaptchaDemo.jsx
// VLUR CAPTCHA 데모 위젯 — 문제 데이터·정답 판정·봇 의심 점수 계산을 전부
// AI-Captcha 백엔드의 공개 API(challenge/verify, Site Key 인증)에서 가져온다.
// 이 컴포넌트는 정답을 알지 못하며, 드래그 궤적만 서버로 보내 결과를 받는다.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fetchChallenge, verifyChallenge, resolveAssetUrl } from '../api/vlurCaptcha';

const DEFAULT_THEME = {
  accent: '#F0691E',
  soft: '#FBEBDD',
  foreground: '#FFFFFF',
};

function normalizeHex(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value || '') ? value.toUpperCase() : fallback;
}

function mixHexColors(color, target = '#FFFFFF', targetRatio = 0.5) {
  const source = normalizeHex(color, DEFAULT_THEME.accent);
  const destination = normalizeHex(target, '#FFFFFF');
  const ratio = Math.min(1, Math.max(0, targetRatio));
  const channel = (start) => Math.round(
    parseInt(source.slice(start, start + 2), 16) * (1 - ratio)
      + parseInt(destination.slice(start, start + 2), 16) * ratio
  );
  return `#${[1, 3, 5].map((start) => channel(start).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

function buildThemeStyle(theme) {
  const accent = normalizeHex(theme?.accent, DEFAULT_THEME.accent);
  const soft = normalizeHex(theme?.soft, mixHexColors(accent, '#FFFFFF', 0.88));
  return {
    '--orange': accent,
    '--orange-2': mixHexColors(accent, '#000000', 0.18),
    '--gold': mixHexColors(accent, '#FFFFFF', 0.25),
    '--peach': soft,
    '--peach-deep': mixHexColors(accent, '#FFFFFF', 0.78),
    '--line': mixHexColors(accent, '#FFFFFF', 0.72),
    '--line-soft': mixHexColors(accent, '#FFFFFF', 0.84),
    '--captcha-on-accent': normalizeHex(theme?.foreground, DEFAULT_THEME.foreground),
  };
}

/* ══════════════════════════════════════
   공통 결과 화면
══════════════════════════════════════ */
function SuccessScreen({ onReset }) {
  return (
    <div className="demo-body demo-success-body">
      <div className="demo-check-circle">
        <svg viewBox="0 0 34 34" fill="none" width={36} height={36}>
          <path d="M7 17.5 13.5 24 27 10" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="demo-success-msg">
        <strong>검증 성공!</strong>
        <span>사람으로 확인되었습니다</span>
      </div>
      <button className="demo-retry-btn" onClick={onReset}>다시 체험하기</button>
    </div>
  );
}

function FailScreen({ onReset, title = '검증 실패', desc = '정답이 아닙니다. 다시 시도해 보세요.' }) {
  return (
    <div className="demo-body demo-success-body">
      <div className="demo-fail-circle">
        <svg viewBox="0 0 34 34" fill="none" width={36} height={36}>
          <path d="M10 10 24 24M24 10 10 24" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="demo-success-msg">
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
      <button className="demo-retry-btn" onClick={onReset}>다시 시도하기</button>
    </div>
  );
}

function StatusScreen({ text }) {
  return (
    <div className="demo-body demo-success-body">
      <span>{text}</span>
    </div>
  );
}

/* ══════════════════════════════════════
   경유 지점 드래그 공통 로직 (유형1·유형2 공용)
   타일을 드롭존까지 끌고 가는 동안 경유 지점(WAYPOINTS)을 모두 지나야만
   제출이 인정된다 — 드래그 궤적 검증을 시각적으로 보여줌.
   문제 발급(challenge)·정답 판정·봇 의심 점수 계산은 전부 서버 API가 담당한다.
══════════════════════════════════════ */

// 타일과 드롭존 사이 여백(px) — 이 값을 키우면 드래그 거리가 길어짐
const DRAG_GAP_PX = 180;

// 드래그 경로가 지나야 하는 경유 지점 (gap 영역 기준 좌: %, 상: px)
const WAYPOINTS = [
  { left: '28%', top: 50 },
  { left: '72%', top: 128 },
];
const WAYPOINT_RADIUS_PX = 30; // 이 반경 안으로 포인터가 들어오면 통과로 인정
const DROP_ZONE_ID = 'captcha-drop-drag';

function useApiCaptcha(captchaType, onVerified, { onEscalate, onTheme } = {}) {
  const [challenge, setChallenge] = useState(null); // { challengeToken, questionImageUrl, options }
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [selected, setSelected] = useState(null); // option_id
  const [solved, setSolved] = useState(false);
  const [dropState, setDropState] = useState('idle');
  const [ghost, setGhost] = useState(null);
  const [screen, setScreen] = useState(null); // null | 'success' | 'fail' | 'bot-blocked' | 'ambiguous' | 'network-error'
  const [visited, setVisited] = useState(() => WAYPOINTS.map(() => false));
  const [missedHint, setMissedHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedRef = useRef(null);
  const solvedRef = useRef(false);
  const submittingRef = useRef(false);
  const visitedRef = useRef(visited);
  const waypointRefs = useRef([]);
  const samplesRef = useRef([]);
  const challengeRef = useRef(null);
  const mountedRef = useRef(true);
  selectedRef.current = selected;
  solvedRef.current = solved;
  submittingRef.current = submitting;
  visitedRef.current = visited;
  challengeRef.current = challenge;

  // StrictMode(dev)는 마운트 시 effect를 mount→cleanup→mount로 두 번 실행하므로,
  // cleanup에서만 false로 두면 두 번째 마운트 후에도 계속 false로 남는다. 매 마운트마다 true로 되돌린다.
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadChallenge = useCallback(() => {
    setLoadState('loading');
    setChallenge(null);
    setSelected(null);
    setSolved(false);
    setDropState('idle');
    setScreen(null);
    setVisited(WAYPOINTS.map(() => false));
    setMissedHint(false);
    fetchChallenge(captchaType)
      .then((data) => {
        if (!mountedRef.current) return;
        setChallenge(data);
        onTheme?.(data.theme);
        setLoadState('ready');
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setLoadState('error');
      });
  }, [captchaType, onTheme]);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge]);

  const submit = useCallback((optionId, dropPosition) => {
    const current = challengeRef.current;
    if (!current || submittingRef.current) return;
    setSubmitting(true);
    const samples = samplesRef.current;
    const responseTimeMs = samples.length >= 2
      ? Math.round(samples[samples.length - 1].t - samples[0].t)
      : null;

    verifyChallenge({
      challengeToken: current.challengeToken,
      selectedOptionId: optionId,
      dropPosition,
      dragTrace: samples,
      responseTimeMs,
    })
      .then((result) => {
        if (!mountedRef.current) return;
        if (result.verified) {
          setSolved(true);
          solvedRef.current = true;
          setDropState('done');
          setScreen('success');
          onVerified?.();
          return;
        }
        if (result.blocked) {
          setScreen('bot-blocked');
          return;
        }
        if (result.ambiguous) {
          if (onEscalate) {
            onEscalate();
          } else {
            setScreen('ambiguous');
          }
          return;
        }
        // 오답도 유형1에서는 곧바로 재시도시키지 않고 유형2로 넘겨 한 번 더 검증한다.
        if (onEscalate) {
          onEscalate();
        } else {
          setScreen('fail');
        }
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setScreen('network-error');
      })
      .finally(() => {
        if (mountedRef.current) setSubmitting(false);
      });
  }, [onVerified, onEscalate]);

  // 드래그(포인터 다운→이동→드롭)로만 제출 가능. 클릭만으로는 제출되지 않음.
  const onPointerDown = useCallback((e, optionId) => {
    if (solvedRef.current || submittingRef.current || !challengeRef.current) return;
    const opt = challengeRef.current.options.find((o) => o.option_id === optionId);
    setSelected(optionId);
    setGhost({ imageUrl: opt?.image_url, x: e.clientX, y: e.clientY });
    setMissedHint(false);
    const freshVisited = WAYPOINTS.map(() => false);
    visitedRef.current = freshVisited;
    setVisited(freshVisited);
    samplesRef.current = [{ x: e.clientX, y: e.clientY, t: performance.now() }];

    const onMove = (ev) => {
      setGhost({ imageUrl: opt?.image_url, x: ev.clientX, y: ev.clientY });
      samplesRef.current.push({ x: ev.clientX, y: ev.clientY, t: performance.now() });

      let changed = false;
      const nextVisited = visitedRef.current.map((wasVisited, i) => {
        if (wasVisited) return true;
        const el = waypointRefs.current[i];
        if (!el) return wasVisited;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(ev.clientX - cx, ev.clientY - cy);
        if (dist <= WAYPOINT_RADIUS_PX) { changed = true; return true; }
        return wasVisited;
      });
      if (changed) {
        visitedRef.current = nextVisited;
        setVisited(nextVisited);
      }

      const drop = document.getElementById(DROP_ZONE_ID);
      if (drop) {
        const r = drop.getBoundingClientRect();
        const isOver = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
        const allVisited = visitedRef.current.every(Boolean);
        setDropState(isOver ? (allVisited ? 'hot' : 'blocked') : 'idle');
      }
    };
    const onUp = (ev) => {
      window.removeEventListener('pointermove', onMove);
      setGhost(null);
      const drop = document.getElementById(DROP_ZONE_ID);
      if (drop) {
        const r = drop.getBoundingClientRect();
        const isOver = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
        const allVisited = visitedRef.current.every(Boolean);
        if (isOver && allVisited && selectedRef.current) {
          submit(selectedRef.current, { x: ev.clientX, y: ev.clientY });
        } else if (isOver && !allVisited) {
          setMissedHint(true);
        }
      }
      setDropState(d => (d === 'hot' || d === 'blocked') ? 'idle' : d);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    e.preventDefault();
  }, [submit]);

  return {
    challenge, loadState, selected, ghost, dropState, visited, missedHint,
    screen, submitting, waypointRefs, reset: loadChallenge, onPointerDown,
  };
}

function WaypointTrack({ waypointRefs, visited }) {
  return (
    <div style={{ position: 'relative', height: DRAG_GAP_PX }}>
      {WAYPOINTS.map((wp, i) => (
        <div
          key={i}
          ref={el => { waypointRefs.current[i] = el; }}
          className={`drag-waypoint${visited[i] ? ' visited' : ''}`}
          style={{ left: wp.left, top: wp.top }}
        >
          {visited[i] ? '✓' : i + 1}
        </div>
      ))}
    </div>
  );
}

function DropZone({ dropState, missedHint, submitting }) {
  const dropClass = `drop${dropState === 'hot' ? ' hot' : ''}${dropState === 'blocked' ? ' blocked' : ''}${dropState === 'done' ? ' done' : ''}`;
  return (
    <div className={dropClass} id={DROP_ZONE_ID}>
      <div className="cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>
          <path d="M2.5 3h2l2.2 12.4a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.2L21.5 7H6"/>
        </svg>
      </div>
      <div className="dtxt">
        {submitting
          ? <><b>확인 중…</b><span>서버에 드래그 결과를 전송하고 있어요</span></>
          : dropState === 'done'
          ? <><b style={{ color: 'var(--ok)' }}>사람 확인 완료 ✓</b><span>드래그 궤적 정상 · 토큰 발급됨</span></>
          : dropState === 'blocked'
          ? <><b style={{ color: 'var(--bad, #d8492f)' }}>경유 지점을 먼저 지나주세요</b><span>1·2번 지점을 통과한 뒤 놓아주세요</span></>
          : missedHint
          ? <><b style={{ color: 'var(--bad, #d8492f)' }}>경유 지점을 놓쳤어요</b><span>다시 시도해 주세요</span></>
          : <><b>여기로 드롭</b><span>경유 지점 1·2를 지나 끌어주세요</span></>}
      </div>
    </div>
  );
}

function GhostTile({ ghost, themeStyle }) {
  if (!ghost) return null;
  return createPortal(
    <div className="vlur-captcha-scope" style={themeStyle}>
      <div className="ghost" style={{ left: ghost.x, top: ghost.y, position: 'fixed' }}>
        {ghost.imageUrl && <img src={resolveAssetUrl(ghost.imageUrl)} alt="" className="tile-photo" />}
      </div>
    </div>,
    document.body
  );
}

/* ══════════════════════════════════════
   4지선다 보기 중 정답을 경유 지점을 지나 드롭존까지 드래그 (유형 2)
══════════════════════════════════════ */
function MatchDragCaptcha({ onVerified, escalationNotice, onTheme, themeStyle }) {
  const { challenge, loadState, selected, ghost, dropState, visited, missedHint, screen, submitting, waypointRefs, reset, onPointerDown } =
    useApiCaptcha('type2_identify', onVerified, { onTheme });

  if (screen === 'success') return <SuccessScreen onReset={reset} />;
  if (screen === 'fail')    return <FailScreen onReset={reset} />;
  if (screen === 'bot-blocked') {
    return <FailScreen onReset={reset} title="인증이 제한되었습니다" desc="자동화된 시도로 판단되어 인증을 완료할 수 없습니다. 잠시 후 다시 시도해 주세요." />;
  }
  if (screen === 'ambiguous') {
    return <FailScreen onReset={reset} title="추가 확인이 필요합니다" desc="본인 확인을 위해 다시 한번 시도해 주세요." />;
  }
  if (screen === 'network-error') {
    return <FailScreen onReset={reset} title="네트워크 오류" desc="서버와 통신하지 못했습니다. 다시 시도해 주세요." />;
  }
  if (loadState === 'loading' || !challenge) return <StatusScreen text="문제를 불러오는 중입니다…" />;
  if (loadState === 'error') return <FailScreen onReset={reset} title="문제를 불러오지 못했습니다" desc="네트워크 상태를 확인하고 다시 시도해 주세요." />;

  return (
    <div className="demo-body">
      {escalationNotice && (
        <div className="demo-escalation-notice">
          <b>추가 확인이 필요합니다</b>
          <span>아래 문제를 이어서 진행해 주세요.</span>
        </div>
      )}
      <div className="demo-q">
        <span>아래 <b style={{ color: 'var(--orange)' }}>이미지</b>에 해당하는 보기를 경유 지점을 지나 끌어다 놓아주세요</span>
      </div>

      <div className="captcha-reference">
        <img src={resolveAssetUrl(challenge.questionImageUrl)} alt="문제 이미지" />
      </div>

      <div className="tiles choice-tiles">
        {challenge.options.map(opt => (
          <button
            key={opt.option_id}
            className={`tile${selected === opt.option_id ? ' sel' : ''}`}
            type="button"
            aria-label={opt.label + ' 선택'}
            onPointerDown={e => onPointerDown(e, opt.option_id)}
          >
            <img src={resolveAssetUrl(opt.image_url)} alt="" className="tile-photo" />
          </button>
        ))}
      </div>

      <WaypointTrack waypointRefs={waypointRefs} visited={visited} />
      <DropZone dropState={dropState} missedHint={missedHint} submitting={submitting} />

      <div className="demo-foot" style={{ justifyContent: 'flex-end' }}>
        <button className="reset" onClick={reset}>새로운 문제</button>
      </div>

      <GhostTile ghost={ghost} themeStyle={themeStyle} />
    </div>
  );
}

/* ══════════════════════════════════════
   드래그-투-타깃 CAPTCHA (유형 1)
══════════════════════════════════════ */
function DragCaptcha({ onVerified, onEscalate, onTheme, themeStyle }) {
  const { challenge, loadState, selected, ghost, dropState, visited, missedHint, screen, submitting, waypointRefs, reset, onPointerDown } =
    useApiCaptcha('type1_drag', onVerified, { onEscalate, onTheme });

  if (screen === 'success') return <SuccessScreen onReset={reset} />;
  if (screen === 'fail')    return <FailScreen onReset={reset} />;
  if (screen === 'bot-blocked') {
    return <FailScreen onReset={reset} title="인증이 제한되었습니다" desc="자동화된 시도로 판단되어 인증을 완료할 수 없습니다. 잠시 후 다시 시도해 주세요." />;
  }
  if (screen === 'network-error') {
    return <FailScreen onReset={reset} title="네트워크 오류" desc="서버와 통신하지 못했습니다. 다시 시도해 주세요." />;
  }
  if (loadState === 'loading' || !challenge) return <StatusScreen text="문제를 불러오는 중입니다…" />;
  if (loadState === 'error') return <FailScreen onReset={reset} title="문제를 불러오지 못했습니다" desc="네트워크 상태를 확인하고 다시 시도해 주세요." />;

  return (
    <div className="demo-body">
      <div className="demo-q">
        <img
          className="question-image"
          src={resolveAssetUrl(challenge.questionImageUrl)}
          alt="문제 이미지"
        />
      </div>

      <div className="tiles">
        {challenge.options.map(opt => (
          <button
            key={opt.option_id}
            className={`tile${selected === opt.option_id ? ' sel' : ''}`}
            type="button"
            aria-label={opt.label + ' 선택'}
            onPointerDown={e => onPointerDown(e, opt.option_id)}
          >
            <img src={resolveAssetUrl(opt.image_url)} alt="" className="tile-photo" />
          </button>
        ))}
      </div>

      <WaypointTrack waypointRefs={waypointRefs} visited={visited} />
      <DropZone dropState={dropState} missedHint={missedHint} submitting={submitting} />

      <div className="demo-foot" style={{ justifyContent: 'flex-end' }}>
        <button className="reset" onClick={reset}>새로운 문제</button>
      </div>

      <GhostTile ghost={ghost} themeStyle={themeStyle} />
    </div>
  );
}

/* ══════════════════════════════════════
   메인 래퍼 — 유형 탭 토글
   onVerified: 검증 성공 시 호스트 사이트로 알려주는 콜백 (선택)
══════════════════════════════════════ */
export default function CaptchaDemo({ onClick, onVerified }) {
  // 유형은 사용자가 직접 고르지 않는다 — 처음엔 항상 유형1이고, 실패(오답·애매한 봇 의심 점수)
  // 시에만 시스템이 자동으로 유형2로 넘긴다. 실제 CAPTCHA는 봇이 검증 방식을 스스로 고르게 두지 않는다.
  const [type, setType] = useState(1);
  const [escalated, setEscalated] = useState(false); // 유형1에서 애매하게 감지되어 자동으로 유형2로 이동한 경우
  const [theme, setTheme] = useState(null);
  const themeStyle = buildThemeStyle(theme);

  const handleEscalate = () => {
    setEscalated(true);
    setType(2);
  };

  return (
    <div className="demo" id="demo" onClick={onClick} style={themeStyle}>
      <div className="demo-top">
        <div className="dots">
          <i style={{ background: type === 1 ? 'var(--orange)' : 'var(--line)' }}/>
          <i style={{ background: type === 2 ? 'var(--orange)' : 'var(--line)' }}/>
        </div>
      </div>

      {type === 1
        ? <DragCaptcha onVerified={onVerified} onEscalate={handleEscalate} onTheme={setTheme} themeStyle={themeStyle} />
        : <MatchDragCaptcha onVerified={onVerified} escalationNotice={escalated} onTheme={setTheme} themeStyle={themeStyle} />}
    </div>
  );
}
