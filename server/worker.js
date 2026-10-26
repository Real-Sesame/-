/*
 * 띵조 AUTO TEAM MAKER — 로그인 · 설정 동기화 서버 (Cloudflare Workers + D1)
 *
 * 아이디 · 비밀번호로 가입하고, 보유 캐릭터 · 파티 · 캐릭터 설정 등 사이트 설정(JSON)을 계정에 저장합니다.
 * 비밀번호는 브라우저에서 먼저 PBKDF2(15만 회)로 늘린 값(key)만 보내고, 서버는 그 값에 무작위 소금을 붙여
 * 한 번 더 PBKDF2로 저장합니다. 서버에는 비밀번호 원문이 오지도, 남지도 않습니다.
 *
 * API (모두 JSON, 로그인 후에는 Authorization: Bearer <token>)
 *   POST /signup   {id, key}            → {token, id, updated}
 *   POST /login    {id, key}            → {token, id, updated}
 *   GET  /data                          → {data, updated}
 *   PUT  /data     {data, base, force}  → {updated}   (다른 기기가 먼저 바꿨으면 409 {updated})
 *   POST /logout
 *   POST /password {key, newKey}        → {token}      (다른 기기의 로그인은 모두 풀림)
 *   POST /delete   {key}                → 계정과 저장된 설정 삭제
 */
const ORIGINS = ['https://real-sesame.github.io', 'http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:8770'];
const MAX_DATA = 256 * 1024;           // 계정당 설정 최대 256KB
const SESSION_DAYS = 180;
const ID_RE = /^[a-z0-9_]{3,20}$/;

const enc = new TextEncoder();
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const rand = n => b64(crypto.getRandomValues(new Uint8Array(n)));
async function sha256(s) { return b64(await crypto.subtle.digest('SHA-256', enc.encode(s))); }
async function slowHash(key, salt) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 1000 }, k, 256));
}
function same(a, b) { // 길이가 같은 문자열을 시간 차이 없이 비교
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0;
}

function cors(req) {
  const o = req.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': ORIGINS.includes(o) ? o : ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', 'Vary': 'Origin'
  };
}
const json = (req, body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors(req) } });
const fail = (req, status, msg, extra) => json(req, { error: msg, ...(extra || {}) }, status);

// 같은 아이디 · 같은 IP의 시도 횟수 제한 (window 초 안에 max번)
async function limited(env, k, max, window) {
  const now = Math.floor(Date.now() / 1000);
  const r = await env.DB.prepare('SELECT n, reset FROM limits WHERE k = ?').bind(k).first();
  if (r && r.reset > now) {
    if (r.n >= max) return r.reset - now;
    await env.DB.prepare('UPDATE limits SET n = n + 1 WHERE k = ?').bind(k).run();
  } else {
    await env.DB.prepare('INSERT INTO limits (k, n, reset) VALUES (?, 1, ?) ON CONFLICT(k) DO UPDATE SET n = 1, reset = excluded.reset').bind(k, now + window).run();
  }
  return 0;
}
async function newSession(env, uid, req) {
  const token = rand(32); const now = Date.now();
  await env.DB.prepare('INSERT INTO sessions (th, uid, created, expires, ua) VALUES (?, ?, ?, ?, ?)')
    .bind(await sha256(token), uid, now, now + SESSION_DAYS * 864e5, (req.headers.get('User-Agent') || '').slice(0, 120)).run();
  return token;
}
async function auth(env, req) {
  const m = (req.headers.get('Authorization') || '').match(/^Bearer (.+)$/); if (!m) return null;
  const s = await env.DB.prepare('SELECT uid, expires FROM sessions WHERE th = ?').bind(await sha256(m[1])).first();
  if (!s || s.expires < Date.now()) return null;
  return s.uid;
}
async function checkPw(env, id, key) {
  const u = await env.DB.prepare('SELECT id, salt, hash, updated FROM users WHERE id = ?').bind(id).first();
  if (!u) { await slowHash(String(key), 'x'); return null; } // 없는 아이디도 걸리는 시간이 비슷하게
  return same(await slowHash(String(key), u.salt), u.hash) ? u : null;
}
async function body(req) { try { return await req.json(); } catch (e) { return {}; } }

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
    const url = new URL(req.url); const p = url.pathname.replace(/\/+$/, '') || '/';
    const ip = req.headers.get('CF-Connecting-IP') || 'x';
    try {
      if (p === '/' && req.method === 'GET') return json(req, { ok: true, service: 'ddingjo-sync' });

      if (p === '/signup' && req.method === 'POST') {
        const { id, key } = await body(req);
        if (!ID_RE.test(id || '')) return fail(req, 400, '아이디는 영어 소문자 · 숫자 · 밑줄(_) 3~20자로 정해 주세요.');
        if (typeof key !== 'string' || key.length < 40 || key.length > 100) return fail(req, 400, '잘못된 요청입니다.');
        const wait = await limited(env, 'signup:' + ip, 5, 3600); if (wait) return fail(req, 429, `가입 시도가 많습니다. ${Math.ceil(wait / 60)}분 뒤 다시 시도해 주세요.`);
        if (await env.DB.prepare('SELECT 1 FROM users WHERE id = ?').bind(id).first()) return fail(req, 409, '이미 쓰고 있는 아이디입니다.');
        const salt = rand(16);
        await env.DB.prepare('INSERT INTO users (id, salt, hash, created, data, updated) VALUES (?, ?, ?, ?, NULL, 0)').bind(id, salt, await slowHash(key, salt), Date.now()).run();
        return json(req, { token: await newSession(env, id, req), id, updated: 0 });
      }

      if (p === '/login' && req.method === 'POST') {
        const { id, key } = await body(req);
        if (!ID_RE.test(id || '') || typeof key !== 'string') return fail(req, 401, '아이디 또는 비밀번호가 맞지 않습니다.');
        const w1 = await limited(env, 'login:' + id, 10, 900); const w2 = await limited(env, 'loginip:' + ip, 30, 900);
        if (w1 || w2) return fail(req, 429, `로그인 시도가 많습니다. ${Math.ceil(Math.max(w1, w2) / 60)}분 뒤 다시 시도해 주세요.`);
        const u = await checkPw(env, id, key); if (!u) return fail(req, 401, '아이디 또는 비밀번호가 맞지 않습니다.');
        await env.DB.prepare('DELETE FROM limits WHERE k = ?').bind('login:' + id).run();
        return json(req, { token: await newSession(env, id, req), id, updated: u.updated || 0 });
      }

      const uid = await auth(env, req);
      if (!uid) return fail(req, 401, '로그인이 필요합니다.', { relogin: true });

      if (p === '/data' && req.method === 'GET') {
        const u = await env.DB.prepare('SELECT data, updated FROM users WHERE id = ?').bind(uid).first();
        return json(req, { id: uid, data: u && u.data ? JSON.parse(u.data) : null, updated: (u && u.updated) || 0 });
      }
      if (p === '/data' && req.method === 'PUT') {
        const raw = await req.text(); if (raw.length > MAX_DATA + 1024) return fail(req, 413, '저장할 설정이 너무 큽니다.');
        let b; try { b = JSON.parse(raw); } catch (e) { return fail(req, 400, '잘못된 요청입니다.'); }
        const data = JSON.stringify(b.data ?? null); if (data.length > MAX_DATA) return fail(req, 413, '저장할 설정이 너무 큽니다.');
        const cur = await env.DB.prepare('SELECT updated FROM users WHERE id = ?').bind(uid).first();
        if (!b.force && cur && cur.updated && cur.updated !== b.base) return fail(req, 409, '다른 기기에서 먼저 바뀐 설정이 있습니다.', { updated: cur.updated });
        const now = Math.max(Date.now(), ((cur && cur.updated) || 0) + 1);
        await env.DB.prepare('UPDATE users SET data = ?, updated = ? WHERE id = ?').bind(data, now, uid).run();
        return json(req, { updated: now });
      }
      if (p === '/logout' && req.method === 'POST') {
        const m = (req.headers.get('Authorization') || '').match(/^Bearer (.+)$/);
        await env.DB.prepare('DELETE FROM sessions WHERE th = ?').bind(await sha256(m[1])).run();
        return json(req, { ok: true });
      }
      if (p === '/password' && req.method === 'POST') {
        const { key, newKey } = await body(req);
        if (typeof newKey !== 'string' || newKey.length < 40 || newKey.length > 100) return fail(req, 400, '잘못된 요청입니다.');
        if (await limited(env, 'login:' + uid, 10, 900)) return fail(req, 429, '시도가 많습니다. 잠시 뒤 다시 시도해 주세요.');
        if (!await checkPw(env, uid, key)) return fail(req, 403, '지금 비밀번호가 맞지 않습니다.');
        const salt = rand(16);
        await env.DB.batch([
          env.DB.prepare('UPDATE users SET salt = ?, hash = ? WHERE id = ?').bind(salt, await slowHash(newKey, salt), uid),
          env.DB.prepare('DELETE FROM sessions WHERE uid = ?').bind(uid)]);
        return json(req, { token: await newSession(env, uid, req) });
      }
      if (p === '/delete' && req.method === 'POST') {
        const { key } = await body(req);
        if (await limited(env, 'login:' + uid, 10, 900)) return fail(req, 429, '시도가 많습니다. 잠시 뒤 다시 시도해 주세요.');
        if (!await checkPw(env, uid, key)) return fail(req, 403, '비밀번호가 맞지 않습니다.');
        await env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE uid = ?').bind(uid), env.DB.prepare('DELETE FROM users WHERE id = ?').bind(uid)]);
        return json(req, { ok: true });
      }
      return fail(req, 404, '없는 주소입니다.');
    } catch (e) {
      return fail(req, 500, '서버 오류가 났습니다. 잠시 뒤 다시 시도해 주세요.');
    }
  },
  // 하루 한 번: 만료된 로그인 · 시도 기록 정리
  async scheduled(event, env) {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM sessions WHERE expires < ?').bind(Date.now()),
      env.DB.prepare('DELETE FROM limits WHERE reset < ?').bind(Math.floor(Date.now() / 1000))]);
  }
};
