import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

// GitHub Pages 주소: https://real-sesame.github.io/-/
const BASE = '/-/';
const SITE = 'https://real-sesame.github.io' + BASE;
const NAME = '띵조 AUTO TEAM MAKER';

const EL = { 1: '응결', 2: '용융', 3: '전도', 4: '기류', 5: '회절', 6: '인멸' };
const EL_KEY = { glacio: 1, fusion: 2, electro: 3, aero: 4, spectro: 5, havoc: 6 };
const WT = { 1: '대검', 2: '직검', 3: '권총', 4: '권갑', 5: '증폭기' };
const TOOLS = {
  'tower-build': '역경의 탑 편성', field: '필드 파티', presets: '추천 조합', timeline: '딜 사이클', grow: '육성 계산',
  'tower-info': '역경의 탑 정보', roster: '보유 캐릭터', db: '도감', settings: '설정 · 계산식', help: '사용 설명', patch: '패치 노트'
};

// src/app.js의 공명자 목록에서 아이디 · 이름 · 속성 · 무기를 읽음(앱과 같은 규칙)
function characters() {
  const src = readFileSync(resolve('src/app.js'), 'utf8');
  const roles = JSON.parse(readFileSync(resolve('src/data/raw-roles.json'), 'utf8'));
  const fix = {}; const m = src.match(/const NAME_FIX = \{([^}]*)\}/);
  if (m) for (const x of m[1].matchAll(/'([a-z0-9_]+)':\s*'([^']+)'/g)) fix[x[1]] = x[2];
  const out = [];
  for (const line of src.split('\n')) {
    const a = line.match(/^\s*\{ id: '([a-z0-9_]+)', rid: (\d+)/); if (!a) continue;
    const r = roles[a[2]] || {};
    const name = (line.match(/name: '([^']+)'/) || [])[1] || fix[a[1]] || r.n || a[1];
    const el = EL[EL_KEY[(line.match(/\bel: '([a-z]+)'/) || [])[1]]] || EL[r.el] || '';
    const wt = WT[+(line.match(/\bwt: (\d)/) || [])[1] || r.wt] || '';
    out.push({ id: a[1], rid: +a[2], name, el, wt });
  }
  return out;
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// <head>의 제목 · 설명 · 미리보기(OG) 태그를 페이지마다 바꿔 끼움
function withMeta(html, { path, title, desc, image }) {
  const full = title ? `${title} · ${NAME}` : NAME;
  const url = SITE + path;
  const img = SITE + (image || 'assets/og/site.jpg');
  const meta = [
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(NAME)}">`,
    `<meta property="og:title" content="${esc(full)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(img)}">`,
    `<meta property="og:image:width" content="800">`,
    `<meta property="og:image:height" content="420">`,
    `<meta name="twitter:card" content="summary_large_image">`
  ].join('\n');
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(full)}</title>`)
    .replace(/\n?<meta name="description"[^>]*>/g, '')
    .replace(/\n?<link rel="canonical"[^>]*>/g, '')
    .replace(/\n?<meta (property="og:|name="twitter:)[^>]*>/g, '')
    .replace('</head>', meta + '\n</head>');
}

export default defineConfig({
  base: BASE,
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // 게임 데이터(src/data, 패치 노트 제외)는 따로 묶어 둠: 사이트 코드만 바뀐 업데이트에서는 브라우저에 저장된 데이터 파일을 그대로 씀
        manualChunks(id) { if (/[\\/]src[\\/]data[\\/]/.test(id) && !id.endsWith('patch-notes.json') && !id.endsWith('app-version.json')) return 'data'; }
      }
    }
  },
  plugins: [{
    // 주소마다 실제 페이지 파일을 만들어 둠: 바로 들어와도 정상(200) 응답 + 링크 미리보기(제목 · 설명 · 그림)
    // 목록에 없는 주소는 404.html이 앱을 띄워 처리
    name: 'pages',
    closeBundle() {
      const dist = resolve('dist');
      const html = readFileSync(resolve(dist, 'index.html'), 'utf8');
      const write = (file, meta) => { const f = resolve(dist, file); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, withMeta(html, meta)); };
      const HOME = { path: '', title: '', desc: '명조: 워더링 웨이브 공명자 가이드 · 역경의 탑 자동 편성 · 예상 딜 계산 · 에코 계산기 · 튜닝 시뮬레이터' };
      write('index.html', HOME); write('404.html', HOME);
      const pages = [
        ['intro', '소개', '띵조 AUTO TEAM MAKER가 할 수 있는 일과 데이터가 갱신되는 방식을 소개합니다.'],
        ['characters', '공명자 가이드', '공명자별 기본 스탯 · 스킬 · 공명 체인 · 추천 무기 · 에코 세트 · 추천 조합 · 육성 재료'],
        ['season', '시즌 콘텐츠', '역경의 탑 · 죽음의 노래와 바닷속 폐허의 이번 시즌 적 · 버프 · 증표와 초기화까지 남은 시간'],
        ['echo', '에코 계산기', '에코 5개의 주옵션 · 부옵션으로 속성 화면 스탯과 크리티컬 점수를 계산합니다.'],
        ['sim', '튜닝 시뮬레이터', '캐릭터 · 무기 이벤트 튜닝을 공개된 확률 규칙으로 미리 돌려 봅니다.'],
        ['links', '자료실', '명조 공식 공지 · 커뮤니티 · 지도 · 데이터베이스 · 공략 사이트 모음'],
        ['notice', '공지사항', '사이트 안내와 업데이트 내역'],
        ['app', '앱 설치', '띵조 ATM 안드로이드 앱(APK) 내려받기 · 홈 화면에 추가하는 방법'],
        ['tools', '파티 편성', '보유 캐릭터로 역경의 탑 · 필드 파티를 자동 편성하고 1사이클 예상 피해를 계산합니다.']
      ];
      for (const [p, t, d] of pages) write(`${p}.html`, { path: p, title: t, desc: d });
      write('tools/index.html', { path: 'tools', title: '파티 편성', desc: pages.find(x => x[0] === 'tools')[2] }); // /-/tools/ (끝에 / 붙은 주소)
      for (const [k, t] of Object.entries(TOOLS)) write(`tools/${k}.html`, { path: `tools/${k}`, title: `${t} · 파티 편성`, desc: pages.find(x => x[0] === 'tools')[2] });
      let n = 0;
      for (const c of characters()) {
        const og = existsSync(resolve('public/assets/og', `${c.rid}.jpg`)) ? `assets/og/${c.rid}.jpg` : '';
        write(`character/${c.id}.html`, { path: `character/${c.id}`, title: `${c.name} 가이드`, desc: `${c.name} · ${c.el} · ${c.wt} — 기본 스탯, 스킬 · 공명 체인, 추천 무기와 에코 세트, 추천 조합, 육성 재료`, image: og });
        n++;
      }
      // 배포 확인용: 지금 배포된 앱 코드 파일 이름(내용이 바뀌면 이름의 해시도 바뀜)과 사이트 버전
      const entry = (html.match(/static\/(index-[\w-]+\.js)/) || [])[1] || '';
      const pv = JSON.parse(readFileSync(resolve('src/data/patch-notes.json'), 'utf8'))[0].v;
      writeFileSync(resolve(dist, 'version.json'), JSON.stringify({ v: pv, build: entry }));
      console.log(`페이지 파일 ${pages.length + Object.keys(TOOLS).length + n + 2}개 만듦 (공명자 ${n}명)`);
    }
  }]
});
