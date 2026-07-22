// vlurCaptcha.js
// VLUR(AI-Captcha) 공개 CAPTCHA API 클라이언트. Site Key(공개용)로 인증하며,
// 정답 판정·봇 의심 점수 계산은 전부 서버에서 이루어진다 — 여기서는 절대
// 정답을 알거나 판정하지 않는다.

const API_BASE = import.meta.env.VITE_VLUR_API_BASE;
const SITE_KEY = import.meta.env.VITE_VLUR_SITE_KEY;

async function post(path, body) {
  if (!API_BASE || !SITE_KEY) {
    throw new Error('VITE_VLUR_API_BASE / VITE_VLUR_SITE_KEY가 설정되어 있지 않습니다.');
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Site-Key': SITE_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.detail ? String(data.detail) : `VLUR API 오류 (${res.status})`);
  }
  return data;
}

export async function fetchChallenge(captchaType) {
  const data = await post('/api/v1/captcha/challenge', { captcha_type: captchaType });
  // 서버는 snake_case로 응답한다 — 최상위 필드만 camelCase로 정리해서 돌려준다.
  return {
    challengeToken: data.challenge_token,
    captchaType: data.captcha_type,
    expiresIn: data.expires_in,
    questionImageUrl: data.question_image_url,
    options: data.options,
  };
}

export function verifyChallenge({ challengeToken, selectedOptionId, dropPosition, dragTrace, responseTimeMs }) {
  return post('/api/v1/captcha/verify', {
    challenge_token: challengeToken,
    selected_option_id: selectedOptionId,
    drop_position: dropPosition ?? null,
    drag_trace: dragTrace ?? [],
    response_time_ms: responseTimeMs ?? null,
  });
}

// 서버가 내려주는 이미지 경로(/static/captcha/...)는 백엔드 오리진 기준 상대경로라
// 프론트 자체 오리진과 다르면 그대로 <img src>에 쓸 수 없다. API_BASE를 붙여 절대 URL로 만든다.
export function resolveAssetUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE}${path}`;
}
