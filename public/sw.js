/* 띵조 AUTO TEAM MAKER 서비스 워커 — 홈 화면에 추가(설치)한 앱이 잘 열리게 하는 최소한의 캐시
   - 페이지 · 데이터(JSON)는 항상 인터넷에서 먼저 받고, 안 될 때만 저장해 둔 것을 씀(늘 최신)
   - 파일 이름에 버전이 붙은 코드(/-/static/) · 그림은 한 번 받으면 저장해 둔 것을 씀(빠르게) */
const VER = 'atm-v1';
const OFFLINE = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>연결 안 됨</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#141413;color:#f1efe8;font-family:system-ui,sans-serif;text-align:center;padding:24px">
<div><div style="font-size:44px;color:#e6c15a">✦</div><h1 style="font-size:20px">인터넷에 연결되지 않았어요</h1><p style="color:#a9a59a">연결된 뒤 다시 시도해 주세요.</p>
<button onclick="location.reload()" style="background:#e6c15a;color:#1a1608;border:0;border-radius:12px;padding:12px 24px;font-weight:700">다시 시도</button></div>`;
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith('/-/')) return; // 다른 사이트(로그인 서버 · 글꼴 등)는 건드리지 않음
  const immutable = /^\/-\/(static|img|assets|icons)\//.test(url.pathname);
  if (immutable) {
    e.respondWith(caches.open(VER).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }))));
    return;
  }
  e.respondWith(fetch(req).then(r => {
    if (r.ok && (req.mode === 'navigate' || url.pathname.endsWith('.json'))) { const cp = r.clone(); caches.open(VER).then(c => c.put(req, cp)); }
    return r;
  }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate'
    ? caches.match('/-/').then(h => h || new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }))
    : Response.error()))));
});
