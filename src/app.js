/* 띵조 AUTO TEAM MAKER — 앱 코드 (Vite가 묶어서 배포) */
import './styles/app.css';
import D_RAW_WEAPONS from './data/raw-weapons.json';
import D_RAW_SETS from './data/raw-sets.json';
import D_RAW_TOWER from './data/raw-tower.json';
import D_RAW_ROLES from './data/raw-roles.json';
import D_RAW_OUTRO from './data/raw-outro.json';
import D_KO_TOWER_TXT from './data/ko-tower-txt.json';
import D_RAW_CHAIN from './data/raw-chain.json';
import D_RAW_SKILLN from './data/raw-skilln.json';
import D_W_REFINE from './data/w-refine.json';
import D_RAW_SKLV from './data/raw-sklv.json';
import D_RAW_GROW from './data/raw-grow.json';
import D_RAW_NODE from './data/raw-node.json';
import D_RAW_BASE from './data/raw-base.json';
import D_ECHO_MAIN from './data/echo-main.json';
import IMG_KEYS from './data/img-index.json';
import D_PATCH_NOTES from './data/patch-notes.json';
const BASE = import.meta.env.BASE_URL;
const DEBUG = /[?&]debug\b/.test(location.search); // 주소를 정리하기 전에 읽어 둠(점검용)
const imgIndex = kind => Object.fromEntries(Object.entries(IMG_KEYS[kind] || {}).map(([k, ext]) => [k, `${BASE}img/${kind}/${encodeURIComponent(k)}.${ext}`]));
const RAW_WEAPONS = D_RAW_WEAPONS;
const RAW_SETS = D_RAW_SETS;
const RAW_TOWER = D_RAW_TOWER;
const RAW_ROLES = D_RAW_ROLES;
const RAW_OUTRO = D_RAW_OUTRO;

const IMG_CHAR = imgIndex('char');
const IMG_WEAPON = imgIndex('weapon');
const IMG_SET = imgIndex('set');
const KO_TOWER_TXT = D_KO_TOWER_TXT;

const RAW_CHAIN = D_RAW_CHAIN;
const RAW_SKILLN = D_RAW_SKILLN;
const W_REFINE = D_W_REFINE;

const RAW_SKLV = D_RAW_SKLV;

const RAW_GROW = D_RAW_GROW;
const IMG_ITEM = imgIndex('item');

const RAW_NODE = D_RAW_NODE;
const RAW_BASE = D_RAW_BASE;
const ECHO_MAIN = D_ECHO_MAIN;

/* =====================================================================
   MODEL DATA — 명조 3.7 (게임 데이터 + 커뮤니티 빌드 가이드 기반)
   버프 표기
     s  : atk(공격력%) | flat(고정 공격력) | bonus(피해 보너스%) | amp(피해 심화/부스트%)
          cr(크리티컬%) | cd(크리티컬 피해%) | defign(방어 무시%) | res(저항 감소%) | final(최종 피해%)
     to : self(기본) | team(자신 포함 전원) | others(자신 제외) | next(다음 등장 캐릭터)
     el : 속성 제한   dt : 피해 유형 제한(n 일반, h 강공격, s 스킬, l 해방, e 에코, st 이상효과, c 협동, o 반주, i 변주)
     req: 받는 캐릭터가 해당 능력을 가져야 적용   treq: 파티 안에 해당 능력자가 있어야 적용
     up : 가동률(0~1, 기본 1)
   ===================================================================== */

const EL = {
  glacio:  { n: '응결', id: 1, c: 'var(--el-glacio)' },
  fusion:  { n: '용융', id: 2, c: 'var(--el-fusion)' },
  electro: { n: '전도', id: 3, c: 'var(--el-electro)' },
  aero:    { n: '기류', id: 4, c: 'var(--el-aero)' },
  spectro: { n: '회절', id: 5, c: 'var(--el-spectro)' },
  havoc:   { n: '인멸', id: 6, c: 'var(--el-havoc)' }
};
const EL_BY_ID = { 1: 'glacio', 2: 'fusion', 3: 'electro', 4: 'aero', 5: 'spectro', 6: 'havoc' };
const WT = { 1: '대검', 2: '직검', 3: '권총', 4: '권갑', 5: '증폭기' };
const DT = { n: '일반 공격', h: '강공격', s: '공명 스킬', l: '공명 해방', e: '에코 어빌리티', st: '이상 효과', c: '협동 공격', o: '반주 스킬', i: '변주 스킬' };
const CAP_N = { chafe: '서리 효과', flare: '전자 효과', bane: '암흑 효과', erosion: '풍식 효과', frazzle: '광학 효과', fusionBurst: '불꽃 효과', tuneRupture: '조화 파동', tuneStrain: '조화 밀집', hack: '해킹', unison: '합일', shield: '실드', heal: '치유', coord: '협동 공격', echo: '에코 활용' };
const STATUS_CAPS = ['chafe', 'flare', 'bane', 'erosion', 'frazzle', 'fusionBurst'];
const ROLE_N = { main: '메인 딜러', sub: '서브 딜러·버퍼', sup: '서포터' };

/* ---------- 무기 패시브 모델 (1재련 기준, 상시 기대값으로 환산) ---------- */
const WMOD = {
  21010015: [{ s: 'bonus', v: 21, dt: 'l' }],
  21010016: [{ s: 'bonus', v: 12 }, { s: 'bonus', v: 48, dt: 'h' }],
  21010026: [{ s: 'bonus', v: 12 }, { s: 'bonus', v: 48, dt: 's' }],
  21010036: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 24, dt: 'l' }, { s: 'bonus', v: 24, el: 'fusion', to: 'team', src: '불길' }],
  21010045: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 24, dt: 'l', up: .7, treq: 'tuneStrain' }],
  21010046: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 20, dt: 'h' }, { s: 'defign', v: 36, dt: 'h', up: .7, req: 'shield' }],
  21010056: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 24, dt: 'l' }, { s: 'bonus', v: 24, to: 'others', req: STATUS_CAPS, src: '쿠모키리' }],
  21010066: [{ s: 'cd', v: 20, to: 'team', src: '별하늘 연산 측정기' }],
  21010076: [{ s: 'bonus', v: 12 }, { s: 'cd', v: 24, req: 'shield' }, { s: 'cr', v: 12, dt: 'h', req: 'shield' }, { s: 'amp', v: 20, dt: 'h', up: .7 }],
  21020015: [{ s: 'atk', v: 12 }],
  21020016: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 56, dt: 's' }],
  21020026: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 56, dt: 'n' }],
  21020036: [{ s: 'cr', v: 8 }, { s: 'bonus', v: 48, dt: 'n' }],
  21020045: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 24, dt: 's', up: .7, treq: 'tuneStrain' }],
  21020046: [{ s: 'bonus', v: 10, dt: 's' }, { s: 'amp', v: 10, el: 'aero', to: 'team', wielder: 'rover_aero', src: '혈맹의 약속' }],
  21020056: [{ s: 'hp', v: 12 }, { s: 'defign', v: 8 }, { s: 'amp', v: 20, treq: 'erosion' }],
  21020066: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 60, dt: 'h', up: .8 }, { s: 'bonus', v: 20, dt: 'e', to: 'team', src: '푸른 의지' }],
  21020076: [{ s: 'bonus', v: 12 }, { s: 'defign', v: 32, dt: 'l', req: ['tuneRupture', 'fusionBurst'] }, { s: 'res', v: 10, dt: 'l', el: 'fusion', req: ['tuneRupture', 'fusionBurst'] }],
  21020086: [{ s: 'atk', v: 12 }, { s: 'amp', v: 28, el: 'glacio', req: 'chafe' }, { s: 'defign', v: 10, dt: 'l' }, { s: 'amp', v: 20, dt: 'st', el: 'glacio', to: 'team', src: '서린 불꽃' }],
  21020096: [{ s: 'bonus', v: 12 }, { s: 'amp', v: 36, dt: 'h', req: 'bane' }, { s: 'defign', v: 12, dt: 'h', req: 'bane' }],
  21020106: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 56, el: 'aero', req: 'tuneStrain', up: .85 }, { s: 'defign', v: 10, el: 'aero', req: 'tuneStrain' }],
  21020107: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 30, el: 'electro', req: 'unison', src: '적막한 어둠: 합일 획득 시 전도 피해 30%' },
    { s: 'bonus', v: 24, el: 'electro', to: 'others', up: .7, wreq: 'unison', mode: 'unison', src: '적막한 어둠(못다 한 그리움): 파티 전도 피해 보너스 24%(협주 에너지를 쓰면 종료)' },
    { s: 'bonus', v: 40, el: 'electro', up: .85, mode: 'carry', src: '적막한 어둠(애틋한 그리움): 협주 에너지 소모 시 자신 전도 피해 40%, 14초' }],
  21030015: [{ s: 'atk', v: 10, to: 'next', src: '부동의 안개' }],
  21030016: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 48, dt: 's' }],
  21030026: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 24, el: 'aero', req: 'erosion' }, { s: 'res', v: 10, el: 'aero', to: 'team', treq: 'erosion', src: '숲속의 아리아' }],
  21030036: [{ s: 'atk', v: 12 }, { s: 'amp', v: 24, dt: 'h' }, { s: 'amp', v: 24, dt: 'e' }, { s: 'defign', v: 8 }],
  21030045: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 20, up: .8 }],
  21030046: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 36, dt: 'n' }, { s: 'bonus', v: 24, to: 'team', treq: ['tuneRupture', 'tuneStrain'], src: '스펙트럼 블래스터' }],
  21030056: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 40, el: 'spectro' }, { s: 'amp', v: 30, dt: 'h', req: 'hack' }, { s: 'defign', v: 10, dt: 'h', req: 'hack' }],
  21030066: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 36, dt: 'n' }, { s: 'atk', v: 24, to: 'team', treq: 'hack', src: '스컬 스래셔' }],
  21040015: [{ s: 'bonus', v: 10, dt: 'n' }, { s: 'bonus', v: 10, dt: 's' }],
  21040016: [{ s: 'bonus', v: 12 }, { s: 'bonus', v: 48, dt: 'l' }],
  21040026: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 48, dt: 'h' }],
  21040036: [{ s: 'atk', v: 12 }, { s: 'defign', v: 8 }, { s: 'amp', v: 50, dt: 'st', el: 'spectro' }],
  21040045: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 24, dt: 'n', up: .7, treq: 'tuneStrain' }],
  21040046: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 20, dt: 'l' }, { s: 'defign', v: 36, dt: 'l', up: .6 }],
  21040056: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 20, el: 'spectro' }, { s: 'amp', v: 20, dt: 'n', req: 'tuneStrain' }, { s: 'defign', v: 10, dt: 'n', req: 'tuneStrain' }],
  21040066: [{ s: 'atk', v: 12 }, { s: 'amp', v: 32, dt: 'e' }, { s: 'defign', v: 10, el: 'aero' }],
  21050015: [{ s: 'bonus', v: 16, dt: 'n' }],
  21050016: [{ s: 'bonus', v: 12 }, { s: 'atk', v: 30 }],
  21050026: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 45, dt: 'n' }],
  21050036: [{ s: 'atk', v: 14, to: 'team', src: '뭇별의 교향곡' }],
  21050045: [{ s: 'atk', v: 24, up: .9 }, { s: 'bonus', v: 12, dt: 'n' }],
  21050046: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 42, dt: 'n' }, { s: 'bonus', v: 42, dt: 'h' }, { s: 'amp', v: 30, dt: 'st', el: 'spectro', to: 'team', src: '광휘의 찬송가' }],
  21050056: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 40, dt: 'n' }, { s: 'res', v: 12, el: 'havoc' }],
  21050066: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 32, dt: 's' }, { s: 'amp', v: 32, dt: 'e' }, { s: 'defign', v: 8 }],
  21050076: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 36, dt: 'l' }, { s: 'atk', v: 24, to: 'team', req: ['fusionBurst', 'tuneStrain'], src: '위조된 작은별' }],
  21050086: [{ s: 'atk', v: 12 }, { s: 'bonus', v: 30, el: 'glacio', req: 'chafe' }, { s: 'atk', v: 24, to: 'team', src: '프리즈 프레임' }],
  21050096: [{ s: 'atk', v: 20, to: 'team', src: '노을에 깃든 이슬' }],
  21050116: [{ s: 'bonus', v: 12 }, { s: 'amp', v: 36, dt: 's', req: ['flare', 'unison'] }, { s: 'res', v: 10, dt: 's', el: 'electro' }, { s: 'amp', v: 30, dt: 'st', el: 'electro', to: 'team', src: '옥궐에 피는 꽃' }],
  // 4성
  21010074: [{ s: 'atk', v: 20 }], 21010104: [{ s: 'atk', v: 7.2 }, { s: 'bonus', v: 10.8, dt: 'h' }],
  21010094: [{ s: 'atk', v: 16, treq: STATUS_CAPS }], 21010084: [{ s: 'atk', v: 10 }], 21010064: [{ s: 'atk', v: 12 }],
  21010034: [{ s: 'atk', v: 12 }], 21010044: [{ s: 'atk', v: 8 }],
  21020017: [{ s: 'atk', v: 20 }, { s: 'cr', v: 6 }], 21020044: [{ s: 'atk', v: 15 }], 21020064: [{ s: 'atk', v: 8 }],
  21020074: [{ s: 'bonus', v: 20, dt: 'n' }, { s: 'bonus', v: 20, dt: 'h' }], 21020104: [{ s: 'atk', v: 7.2 }, { s: 'bonus', v: 10.8, dt: 'l' }],
  21020094: [{ s: 'atk', v: 16, treq: STATUS_CAPS }], 21020084: [{ s: 'atk', v: 10 }],
  21030074: [{ s: 'bonus', v: 21, dt: 's' }], 21030044: [{ s: 'bonus', v: 20, dt: 's' }], 21030104: [{ s: 'atk', v: 8.8 }, { s: 'bonus', v: 8.8, dt: 'h' }],
  21030094: [{ s: 'atk', v: 16, treq: STATUS_CAPS }], 21030084: [{ s: 'atk', v: 10 }], 21030064: [{ s: 'atk', v: 12 }], 21030034: [{ s: 'atk', v: 12 }],
  21040074: [{ s: 'bonus', v: 18, dt: 'l' }], 21040044: [{ s: 'bonus', v: 20, dt: 'l' }], 21040104: [{ s: 'atk', v: 7.2 }, { s: 'bonus', v: 10.8, dt: 'l' }],
  21040094: [{ s: 'atk', v: 16, treq: STATUS_CAPS }], 21040084: [{ s: 'atk', v: 10 }], 21040064: [{ s: 'atk', v: 9 }], 21040034: [{ s: 'atk', v: 8 }],
  21050074: [{ s: 'atk', v: 15 }], 21050104: [{ s: 'atk', v: 9 }, { s: 'bonus', v: 9, dt: 'n' }], 21050084: [{ s: 'atk', v: 10 }],
  21050094: [{ s: 'atk', v: 16, treq: STATUS_CAPS }], 21050044: [{ s: 'atk', v: 8 }], 21050027: [{ s: 'bonus', v: 24, el: 'spectro', req: 'frazzle' }],
  21050034: [{ s: 'atk', v: 12 }]
};

/* ---------- 소나타(화음) 세트 모델 — 착용자 기준 ---------- */
const SMOD = {
  1: { el: 'glacio', b: [{ s: 'bonus', v: 40, el: 'glacio' }] },
  2: { el: 'fusion', b: [{ s: 'bonus', v: 40, el: 'fusion' }] },
  3: { el: 'electro', b: [{ s: 'bonus', v: 40, el: 'electro' }] },
  4: { el: 'aero', b: [{ s: 'bonus', v: 40, el: 'aero' }] },
  5: { el: 'spectro', b: [{ s: 'bonus', v: 40, el: 'spectro' }] },
  6: { el: 'havoc', b: [{ s: 'bonus', v: 40, el: 'havoc' }] },
  7: { sup: 1, b: [{ s: 'atk', v: 15, to: 'team', wreq: 'heal', src: '찬란한 광휘' }] },
  8: { sup: 1, b: [{ s: 'atk', v: 22.5, to: 'next', src: '떠오르는 구름' }] },
  9: { b: [{ s: 'atk', v: 30 }, { s: 'bonus', v: 60, dt: 'o' }] },
  10: { el: 'glacio', b: [{ s: 'bonus', v: 48, dt: 's' }, { s: 'bonus', v: 22.5, el: 'glacio' }] },
  11: { el: 'spectro', b: [{ s: 'bonus', v: 25, el: 'spectro' }, { s: 'cr', v: 20, treq: 'frazzle' }] },
  12: { el: 'havoc', b: [{ s: 'bonus', v: 10, el: 'havoc' }, { s: 'bonus', v: 15, el: 'havoc', to: 'next', src: '어둠의 장막' }] },
  13: { sup: 1, b: [{ s: 'bonus', v: 80, dt: 'c' }, { s: 'atk', v: 10, to: 'team', wreq: 'coord', src: '하늘의 합주곡' }] },
  14: { b: [{ s: 'atk', v: 15 }, { s: 'bonus', v: 30 }] },
  16: { el: 'aero', b: [{ s: 'bonus', v: 25, el: 'aero', req: 'erosion' }, { s: 'bonus', v: 15, el: 'aero', to: 'others', wreq: 'erosion', src: '끝없는 하늘' }] },
  17: { el: 'aero', b: [{ s: 'bonus', v: 40, el: 'aero' }, { s: 'cr', v: 10, treq: 'erosion' }] },
  18: { el: 'fusion', b: [{ s: 'bonus', v: 10, el: 'fusion' }, { s: 'bonus', v: 20, dt: 'l' }, { s: 'bonus', v: 15, el: 'fusion', to: 'team', src: '울부짖는 늑대의 불꽃' }] },
  19: { three: 1, b: [{ s: 'cr', v: 20 }, { s: 'bonus', v: 35, dt: 'e' }] },
  20: { three: 1, b: [{ s: 'atk', v: 30, req: 'shield' }, { s: 'cd', v: 20, req: 'shield' }] },
  21: { three: 1, b: [{ s: 'bonus', v: 30, dt: 'h' }, { s: 'bonus', v: 16, dt: 'e', to: 'team', src: '만물의 숨결에 비롯된 울림' }] },
  22: { three: 1, b: [{ s: 'cr', v: 20, dt: 'h' }, { s: 'cr', v: 20, dt: 'e' }, { s: 'bonus', v: 16, el: 'fusion' }] },
  23: { three: 1, b: [{ s: 'atk', v: 20, req: 'bane' }, { s: 'bonus', v: 30, dt: 'l', req: 'bane' }] },
  24: { el: 'spectro', sup: 1, b: [{ s: 'bonus', v: 10, el: 'spectro' }, { s: 'atk', v: 25, to: 'next', src: '역광 속 눈부신 서약' }] },
  25: { sup: 1, b: [{ s: 'atk', v: 25, to: 'team', wreq: 'heal', src: '빛을 쫓는 별의 고리' }] },
  26: { el: 'spectro', b: [{ s: 'bonus', v: 40, el: 'spectro' }, { s: 'bonus', v: 40, dt: 'n' }] },
  27: { el: 'fusion', b: [{ s: 'bonus', v: 30, el: 'fusion' }, { s: 'cr', v: 20, req: ['fusionBurst', 'tuneRupture'] }] },
  28: { el: 'fusion', sup: 1, b: [{ s: 'bonus', v: 20, el: 'fusion' }, { s: 'bonus', v: 25, el: 'fusion', to: 'next', wreq: 'fusionBurst', src: '오색찬란한 거품' }] },
  29: { el: 'aero', b: [{ s: 'bonus', v: 25, el: 'aero' }, { s: 'cr', v: 20, dt: 'e' }] },
  30: { el: 'glacio', b: [{ s: 'bonus', v: 20, el: 'glacio', req: 'chafe' }, { s: 'cr', v: 25, dt: 'l', role: 'main' }, { s: 'bonus', v: 25, el: 'glacio', to: 'next', role: 'notmain', src: '소리 없이 내려앉은 기도의 눈' }] },
  31: { b: [{ s: 'atk', v: 10 }, { s: 'amp', v: 5, to: 'team', treq: ['tuneRupture', 'tuneStrain'], src: '마음을 엮은 꿈의 그림자' }] },
  32: { one: 1, b: [{ s: 'bonus', v: 35, dt: 'n', req: 'hack' }, { s: 'bonus', v: 35, dt: 'h', req: 'hack' }, { s: 'cr', v: 15, src: '메인 에코(아담 스매셔)' }] },
  33: { sup: 1, b: [{ s: 'cr', v: 20, req: 'bane' }, { s: 'bonus', v: 35, dt: 'h', req: 'bane' }, { s: 'atk', v: 25, to: 'team', wreq: 'chafe', src: '내려앉은 깃털의 노래' }] },
  34: { el: 'aero', b: [{ s: 'bonus', v: 40, el: 'aero' }, { s: 'cd', v: 20, req: 'tuneStrain' }] },
  35: { el: 'fusion', b: [{ s: 'cr', v: 20, req: 'shield' }, { s: 'bonus', v: 15, el: 'fusion', req: 'shield' }] },
  36: { el: 'electro', b: [{ s: 'bonus', v: 32.5, el: 'electro' }, { s: 'cr', v: 15, req: ['flare', 'unison'] }] },
  37: { el: 'electro', sup: 1, b: [{ s: 'bonus', v: 20, el: 'electro', req: 'flare' }, { s: 'bonus', v: 25, el: 'electro', to: 'next', wreq: 'flare', src: '거울 그림자에 번개가 스치는 찰나' }] },
  38: { sup: 1, b: [{ s: 'atk', v: 10, to: 'team', wreq: 'heal', src: '추억에 붉게 물든 꽃' }, { s: 'atk', v: 15, to: 'team', wreq: 'heal', treq: 'unison', src: '추억에 붉게 물든 꽃(합일)' }] }
};

/* ---------- 공명자 모델 ----------
   pw  : 25초 사이클 동안 본인이 내는 딜 규모(메인 딜러 100 기준, 추정치)
   p   : 피해 유형 비중(%)   ap : 부여/보유 능력   f : 필드 편의 태그
   w   : 기본 무기(전용)  w4 : 4성 대체 무기   set: 기본 소나타
   b   : 파티에 주는 버프(반주·변주·고유 스킬 등)  modes: 공명 모드별 차이 */
const CHARS = [
  // ===== 3.7 / 신규 =====
  { id: 'hsin', rid: 1311, role: 'main', pw: 104, ap: ['flare'], f: ['aoe'], w: 21050116, w4: 21050074, set: 36,
    modes: {
      flare: { n: '전자', p: { n: 20, h: 20, l: 35, st: 15, s: 10 }, ap: ['flare'],
        b: [{ s: 'amp', v: 20, el: 'electro', to: 'others', src: '여우의 별자리 반주(전자): 다른 파티원 전도 피해 부스트, 20초' },
            { s: 'bonus', v: 50, el: 'electro', to: 'self', treqOther: 'flare', src: '흥망성쇠의 순환: 파티원이 전자 효과를 걸 때마다 25%, 최대 2스택' },
            { s: 'bonus', v: 20, el: 'electro', to: 'self', withChar: 'rover_electro', src: '흥망성쇠의 순환: 방랑자·전도 변주 후 30초' }] },
      unison: { n: '합일', p: { s: 60, l: 30, n: 10 }, ap: ['unison'], needOther: 'unison',
        b: [{ s: 'amp', v: 20, to: 'others', req: 'unison', src: '여우의 별자리 반주(합일): 합일을 얻은 다른 파티원 전체 피해 부스트, 30초' },
            { s: 'atk', v: 50, to: 'self', up: .6, src: '흥망성쇠의 순환: 합일 변주 후 공격력 50%, 8초' },
            { s: 'final', v: 9, to: 'team', req: 'unison', uniq: 'unisonBuff', src: '합일 버프 3스택: 스택당 최종 피해 3%(여우의 별자리 합일 모드로 최대 3스택)' }] }
    },
    note: '전자 모드는 방랑자·전도/복링 등 전자 효과 부여자와, 합일 모드는 쇄명·금희 등 합일 캐릭터와 짝을 이룹니다.' },
  { id: 'suoming', rid: 1312, role: 'sub', pw: 52, p: { n: 45, i: 15, l: 15, c: 25 }, ap: ['unison'], f: ['aoe'], w: 21020107, w4: 21020017, set: 36,
    modes: {
      unison: { n: '합일 서브', role: 'sub', p: { n: 45, i: 15, l: 15, c: 25 }, ap: ['unison', 'coord'],
        b: [{ s: 'amp', v: 20, el: 'electro', to: 'next', src: '쇄명 반주(우산 장치의 울림): 다음 캐릭터 전도 피해 부스트 20%, 8초' },
            { s: 'amp', v: 25, dt: 's', to: 'next', req: 'unison', src: '쇄명 반주: 받는 캐릭터가 합일 버프를 가지면 공명 스킬 피해 부스트 25%' },
            { s: 'bonus', v: 30, el: 'electro', to: 'next', src: '약속의 족쇄(함께한 약속): 합일을 가진 채 반주 시 다음 캐릭터 전도 피해 보너스 30%, 8초' },
            { s: 'bonus', v: 40, el: 'electro', to: 'next', treqOther: 'unison', src: '약속의 족쇄: 합일 버프 1스택당 +20%, 최대 +40%' },
            { s: 'final', v: 6, to: 'team', req: 'unison', treqOther: 'unison', uniq: 'unisonBuff', src: '합일 버프 2스택: 스택당 최종 피해 3%' },
            { s: 'bonus', v: 50, el: 'electro', to: 'self', up: .6, src: '비에 젖은 옛 약속: 변주 후 전도 피해 보너스 50%(교체하면 종료)' }] },
      carry: { n: '금쇄계주 메인', role: 'main', pwMul: 1.7, p: { n: 75, i: 10, l: 10, s: 5 }, ap: ['unison'],
        b: [{ s: 'amp', v: 20, el: 'electro', to: 'next', src: '쇄명 반주(우산 장치의 울림): 다음 캐릭터 전도 피해 부스트 20%, 8초' },
            { s: 'amp', v: 25, dt: 's', to: 'next', req: 'unison', src: '쇄명 반주: 받는 캐릭터가 합일 버프를 가지면 공명 스킬 피해 부스트 25%' },
            { s: 'final', v: 6, to: 'team', req: 'unison', treqOther: 'unison', uniq: 'unisonBuff', src: '합일 버프 2스택: 스택당 최종 피해 3%' },
            { s: 'bonus', v: 50, el: 'electro', to: 'self', up: .9, src: '비에 젖은 옛 약속: 변주 후 전도 피해 보너스 50%, 15초' },
            { s: 'cd', v: 100, to: 'self', up: .85, src: '금쇄계주: 해방 후 E로 합일을 소모하면 크리티컬 피해 100%, 펼친 우산 평타 배율 +100%(12초)' }] }
    },
    note: '3.7 2페이즈(10/22) 출시. 해방 후 바로 교체하면 "합일 서브"(다음 캐릭터 전도 피해 보너스 30~70% · 벼락의 흔적 협동 공격), 해방 후 E를 쓰면 "금쇄계주 메인"(본인 평타 강화)입니다. 둘은 동시에 쓸 수 없어 파티마다 높은 쪽으로 계산합니다.' },
  { id: 'lily', rid: 0, release: Date.UTC(2026, 10, 11, 2), releaseTxt: '3.8 예정', name: '릴리', q: 5, el: 'spectro', wt: 3, icon: '', role: 'sup', pw: 16, p: { n: 40, s: 30, l: 30 }, ap: ['heal', 'unison'], f: ['heal'], w: 21030015, w4: 21030064, set: 38,
    b: [{ s: 'amp', v: 20, to: 'team', src: '릴리 반주(추정)' }, { s: 'atk', v: 20, to: 'team', src: '릴리 공명 해방(추정)' }, { s: 'cd', v: 25, to: 'team', src: '릴리 고유 스킬(추정)' }],
    note: '3.8 출시 예정 · 수치는 공개 전 추정값입니다. 합일 대응이 가능한 힐러로 알려져 파수인 자리를 대체합니다.' },
  { id: 'jingran', rid: 1212, role: 'main', pw: 104, p: { h: 80, o: 15, i: 5 }, ap: ['shield'], f: ['aoe'], w: 21010076, w4: 21010104, set: 35, b: [] },
  { id: 'qingxiao', rid: 1413, role: 'main', pw: 102, p: { h: 50, l: 30, o: 20 }, ap: ['tuneStrain'], f: ['move'], w: 21020106, w4: 21020017, set: 34, b: [] },
  { id: 'suisui', rid: 1110, role: 'sup', pw: 18, p: { s: 50, l: 30, st: 20 }, ap: ['chafe', 'heal'], f: ['heal', 'group'], w: 21050096, w4: 21050024, set: 33,
    b: [{ s: 'amp', v: 25, to: 'team', src: '수수 반주: 파티 전원 전체 피해 부스트, 30초' },
        { s: 'bonus', v: 12, to: 'team', up: .8, src: '푸른 하늘을 노닐며: 공명 효율 200% 초과분 1%당 피해 0.2%, 최대 12%' },
        { s: 'atk', v: 50, to: 'next', req: STATUS_CAPS, up: .6, src: '산안개: 다음 캐릭터가 이상 효과를 소모하면 공격력 최대 50%(공효 260% 필요)' },
        { s: 'final', v: 30, dt: 'st', to: 'team', treq: STATUS_CAPS, up: .85, uniq: 'stCap', src: '천리강산: 이상 효과 최대 스택 10 → 13(스택 수에 비례해 피해가 커지므로 별도 곱연산 ×1.3, 유지율 85%)' }] },
  { id: 'xuanling', rid: 1610, role: 'main', pw: 106, p: { h: 80, l: 10, o: 10 }, ap: ['bane'], f: ['aoe', 'move'], w: 21020096, w4: 21020074, set: 33,
    b: [{ s: 'amp', v: 20, el: 'havoc', to: 'others', req: 'bane', src: '양양·현령 반주' }] },
  { id: 'rover_electro', rid: 1309, role: 'sub', pw: 46, p: { s: 60, n: 40 }, ap: ['flare'], f: ['aoe'], w: 21020016, w4: 21020017, set: 37,
    b: [{ s: 'amp', v: 25, to: 'next', req: STATUS_CAPS, src: '방랑자·전도 반주(번개의 정수)' },
        { s: 'atk', v: 10, to: 'team', src: '과부하(파티 공격력 10%)' },
        { s: 'bonus', v: 12, el: 'electro', to: 'next', src: '메인 에코 효과: 다음 캐릭터 전도 피해 보너스 12%' }] },
  { id: 'hiyuki', rid: 1108, role: 'main', pw: 106, p: { st: 55, l: 35, i: 5, n: 5 }, ap: ['chafe'], f: ['aoe'], w: 21020086, w4: 21020104, set: 30,
    b: [{ s: 'amp', v: 20, el: 'glacio', to: 'others', treq: 'chafe', src: '히유키 반주: 서리 효과가 있는 적에게 다른 파티원 응결 피해 부스트, 20초' },
        { s: 'cd', v: 40, to: 'self', treqOther: ['chafe', 'bane'], src: '속삭이는 눈(눈의 침식 1스택): 자신 크리티컬 피해 40%' },
        { s: 'amp', v: 60, el: 'glacio', dt: 'st', to: 'self', treqOther: ['chafe', 'bane'], up: .8, src: '속삭이는 눈(1·3스택): 히유키가 필드에 있을 때 적이 받는 냉해 효과 피해 30%+30% 부스트' }] },
  { id: 'lucilla', rid: 1109, role: 'sub', pw: 44, ap: ['chafe'], f: ['aoe'], w: 21050086, w4: 21050104, set: 30,
    modes: {
      chafe: { n: '서리', p: { n: 60, st: 30, s: 10 }, ap: ['chafe'],
        b: [{ s: 'amp', v: 60, el: 'glacio', dt: 'st', to: 'team', src: '루실라 반주(서리): 목표가 받는 서리 효과 피해 부스트, 30초' },
            { s: 'res', v: 8, el: 'glacio', to: 'team', src: '슬로우 모션: 근처 적 응결 저항 8% 감소' }] },
      echo: { n: '에코', p: { e: 80, n: 20 }, ap: ['echo'],
        b: [{ s: 'amp', v: 50, dt: 'e', to: 'next', src: '루실라 반주(에코): 다음 캐릭터 에코 어빌리티 피해 부스트, 14초' },
            { s: 'bonus', v: 25, dt: 'e', to: 'team', src: '슬로우 모션: 파티 전원 에코 어빌리티 피해 보너스 25%, 30초' },
            { s: 'cd', v: 40, dt: 'e', to: 'team', up: .75, src: '줌: 스택당 에코 어빌리티 크리티컬 피해 10%, 최대 4스택' }] }
    } },
  { id: 'sigrika', rid: 1412, role: 'main', pw: 106, p: { e: 75, o: 15, n: 10 }, ap: ['echo'], f: ['aoe'], w: 21040066, w4: 21040104, set: 29,
    b: [{ s: 'bonus', v: 18, el: 'aero', to: 'team', treq: 'echo', src: '함의의 축복 6스택' }, { s: 'bonus', v: 18, dt: 'e', to: 'team', src: '함의의 축복 6스택' }] },
  { id: 'denia', rid: 1211, role: 'sub', pw: 42, ap: ['fusionBurst'], f: [], w: 21050076, w4: 21050084,
    modes: {
      fusionBurst: { n: '불꽃', set: 28, p: { st: 50, l: 30, n: 20 }, ap: ['fusionBurst'],
        b: [{ s: 'amp', v: 60, el: 'fusion', dt: 'st', to: 'team', src: '데니아 반주(불꽃 효과 피해)' },
            { s: 'bonus', v: 30, el: 'fusion', to: 'team', src: '새겨진 찬란한 빛깔(용융 30%)' }] },
      tuneStrain: { n: '조화 밀집', set: 31, p: { l: 40, n: 40, s: 20 }, ap: ['tuneStrain'],
        b: [{ s: 'amp', v: 40, to: 'next', req: 'tuneStrain', src: '데니아 반주(조화 밀집)' },
            { s: 'amp', v: 15, to: 'next', reqNot: 'tuneStrain', src: '데니아 반주' }] }
    } },
  { id: 'rebecca', rid: 1308, role: 'sub', pw: 46, p: { n: 70, h: 20, l: 10 }, ap: ['hack'], f: ['aoe'], w: 21030066, w4: 21030064, set: 32, set2: [3, 9],
    b: [{ s: 'amp', v: 15, to: 'next', src: '레베카 반주' }, { s: 'amp', v: 35, dt: 'h', to: 'next', src: '오버리미트(강공격 최대 35%)' },
        { s: 'atk', v: 20, to: 'team', src: '파티 타임!(공격력 20%)' }] },
  { id: 'lucy', rid: 1511, role: 'main', pw: 100, p: { h: 60, n: 25, s: 15 }, ap: ['hack'], f: [], w: 21030056, w4: 21030104, set: 32, set2: [26, 9],
    b: [{ s: 'amp', v: 25, dt: 'n', to: 'next', src: '루시 반주: 다음 캐릭터 일반 공격 피해 부스트, 14초' }, { s: 'amp', v: 20, to: 'others', req: 'hack', src: '카운터 프로그램: 해킹 이탈을 건 다른 파티원 전체 피해 부스트' },
        { s: 'amp', v: 5, to: 'team', src: '넷러너: 표기된 적이 받는 피해 5% 증가, 30초' }] },
  { id: 'aemeath', rid: 1210, role: 'main', pw: 106, ap: ['fusionBurst'], f: ['aoe'], w: 21020076, w4: 21020104, set: 27,
    modes: {
      fusionBurst: { n: '불꽃', p: { st: 45, l: 35, s: 20 }, ap: ['fusionBurst'],
        b: [{ s: 'amp', v: 20, to: 'others', req: 'fusionBurst', src: '에이메스 반주' }, { s: 'amp', v: 10, to: 'others', reqNot: 'fusionBurst', src: '에이메스 반주' }] },
      tuneRupture: { n: '조화 파동', p: { l: 45, s: 35, n: 20 }, ap: ['tuneRupture'],
        b: [{ s: 'amp', v: 20, to: 'others', req: 'tuneRupture', src: '에이메스 반주' }, { s: 'amp', v: 10, to: 'others', reqNot: 'tuneRupture', src: '에이메스 반주' }] }
    } },
  { id: 'luuk', rid: 1510, role: 'main', pw: 100, p: { n: 70, o: 15, s: 15 }, ap: ['tuneStrain'], f: [], w: 21040056, w4: 21040104, set: 26, b: [] },
  { id: 'mornye', rid: 1209, role: 'sup', pw: 14, p: { l: 60, h: 40 }, ap: ['heal', 'shield'], f: ['heal'], w: 21010066, w4: 21010024, set: 25,
    b: [{ s: 'amp', v: 25, to: 'team', src: '모니에 반주: 파티 전원 전체 피해 부스트, 30초' }, { s: 'bonus', v: 40, to: 'team', treq: ['tuneRupture', 'tuneStrain'], up: .75, src: '간섭 표기: 조화 간섭 상태의 적에게 주는 피해 증가(공효 100% 초과 1%당 0.25%, 최대 40%)' }] },
  { id: 'lynae', rid: 1509, role: 'sub', pw: 40, p: { n: 50, l: 30, s: 20 }, ap: ['tuneRupture', 'tuneStrain'], f: ['move'], w: 21030046, w4: 21030064, set: 24,
    b: [{ s: 'amp', v: 15, to: 'next', src: '린네 반주' }, { s: 'amp', v: 25, dt: 'l', to: 'next', src: '린네 반주(해방)' },
        { s: 'bonus', v: 24, to: 'team', src: '컬러 스프레이 폭발(피해 24%)' }] },
  { id: 'qiuyuan', rid: 1411, role: 'sub', pw: 44, p: { e: 60, h: 40 }, ap: ['echo'], f: [], w: 21020066, w4: 21020017, set: 21, set2: [4],
    b: [{ s: 'amp', v: 50, dt: 'e', to: 'next', src: '구원 반주' }, { s: 'bonus', v: 30, dt: 'e', to: 'team', src: '대나무 빛(에코 30%)' },
        { s: 'cd', v: 30, to: 'team', src: '진중한 한 수(치피 최대 30%)' }] },
  { id: 'chisa', rid: 1508, role: 'sup', pw: 22, p: { l: 60, n: 40 }, ap: ['bane', 'heal', 'shield'], f: ['heal'], w: 21010056, w4: 21010094, set: 23, set2: [6],
    b: [{ s: 'final', v: 30, dt: 'st', to: 'team', treq: STATUS_CAPS, up: .85, uniq: 'stCap', src: '치사 반주(종말의 현 연주): 이상 효과 최대 스택 10 → 13(스택 수에 비례해 피해가 커지므로 별도 곱연산 ×1.3, 유지율 85%)' },
        { s: 'defign', v: 18, to: 'team', req: STATUS_CAPS, src: '파멸의 선: 이상 효과를 건 캐릭터가 공허히 얽힌 흔적 대상에게 방어력 18% 무시' }] },
  { id: 'galbrena', rid: 1208, role: 'main', pw: 104, p: { n: 60, h: 20, e: 20 }, ap: ['echo'], f: ['aoe'], w: 21030036, w4: 21030104, set: 22, set2: [2], b: [] },
  { id: 'augusta', rid: 1306, role: 'main', pw: 96, p: { h: 85, o: 5, s: 10 }, ap: ['shield'], f: [], w: 21010046, w4: 21010104, set: 20, set2: [3],
    b: [{ s: 'amp', v: 15, to: 'next', src: '아우구스타 반주' }] },
  { id: 'iuno', rid: 1410, role: 'sub', pw: 46, p: { l: 60, h: 40 }, ap: ['heal', 'shield'], f: ['heal'], w: 21040046, w4: 21040104, set: 8,
    b: [{ s: 'amp', v: 50, dt: 'h', to: 'next', src: '유노 반주: 다음 캐릭터 강공격 피해 부스트, 14초' },
        { s: 'amp', v: 40, to: 'next', treq: 'shield', up: .75, src: '창백한 달빛의 축복: 보름달 영역에서 실드를 받을 때마다 전체 피해 4%, 최대 10스택' }] },
  { id: 'phrolova', rid: 1608, role: 'main', pw: 102, p: { e: 50, h: 40, s: 10 }, ap: ['echo'], f: ['aoe'], w: 21050066, w4: 21050084, set: 19, set2: [12],
    b: [{ s: 'amp', v: 20, el: 'havoc', to: 'next', src: '플로로 반주' }, { s: 'amp', v: 25, dt: 'h', to: 'next', src: '플로로 반주(강공격)' }] },
  { id: 'cartethyia', rid: 1409, role: 'main', pw: 100, p: { l: 50, n: 30, st: 20 }, ap: ['erosion'], f: ['heal'], w: 21020056, w4: 21020104, set: 17,
    b: [{ s: 'amp', v: 17.5, el: 'aero', to: 'others', treq: STATUS_CAPS, src: '카르티시아 반주' }] },
  { id: 'lupa', rid: 1207, role: 'sub', pw: 40, p: { l: 50, i: 30, n: 20 }, ap: [], f: [], w: 21010036, w4: 21010084, set: 18,
    b: [{ s: 'amp', v: 20, el: 'fusion', to: 'next', src: '루파 반주' }, { s: 'amp', v: 25, dt: 'n', to: 'next', src: '루파 반주(일반 공격)' },
        { s: 'atk', v: 18, to: 'team', up: .85, src: '추적 사냥: 공격력 6%, 변주마다 +6%(최대 18%)' }, { s: 'bonus', v: 10, el: 'fusion', to: 'team', src: '추적 사냥: 노도·해일급(보스) 대상 용융 피해 보너스 10%' },
        { s: 'res', v: 9, el: 'fusion', to: 'team', src: '승리의 박수갈채: 용융 저항 3% 무시 + 다른 용융 캐릭터당 3%(용융 3명이면 15%)' }] },
  { id: 'ciaccona', rid: 1407, role: 'sub', pw: 44, p: { st: 50, l: 30, n: 20 }, ap: ['erosion'], f: ['aoe'], w: 21030026, w4: 21030064, set: 16,
    b: [{ s: 'amp', v: 100, el: 'aero', dt: 'st', to: 'team', src: '샤콘 반주: 목표가 받는 풍식 효과 피해 부스트, 30초' }, { s: 'bonus', v: 24, el: 'aero', to: 'team', src: '음률의 독주: 근처 파티 전원 기류 피해 보너스 24%' }] },
  { id: 'zani', rid: 1507, role: 'main', pw: 98, p: { h: 60, st: 30, n: 10 }, ap: ['frazzle'], f: [], w: 21040036, w4: 21040104, set: 11,
    b: [{ s: 'amp', v: 20, el: 'spectro', to: 'others', treq: 'frazzle', src: '젠니 반주' }, { s: 'bonus', v: 12, el: 'spectro', to: 'self', src: '변주 회절 12%' }] },
  { id: 'cantarella', rid: 1607, role: 'sub', pw: 42, p: { n: 40, c: 40, s: 20 }, ap: ['heal', 'coord', 'echo'], f: ['heal'], w: 21050056, w4: 21050104, set: 12,
    b: [{ s: 'amp', v: 20, el: 'havoc', to: 'next', src: '칸타렐라 반주' }, { s: 'amp', v: 25, dt: 's', to: 'next', src: '칸타렐라 반주(스킬)' }] },
  { id: 'phoebe', rid: 1506, role: 'main', pw: 92, ap: ['frazzle'], f: [], w: 21050046, w4: 21050027,
    modes: {
      absolution: { n: '사죄(딜러)', set: 11, role: 'main', p: { h: 70, l: 15, o: 15 }, ap: ['frazzle'], b: [{ s: 'bonus', v: 12, el: 'spectro', to: 'self', src: '계시' }] },
      confession: { n: '고해(버퍼)', set: 8, role: 'sub', pwMul: .45, p: { h: 60, o: 20, l: 20 }, ap: ['frazzle'],
        b: [{ s: 'amp', v: 100, el: 'spectro', dt: 'st', to: 'team', src: '페비 반주(고해)' }, { s: 'res', v: 10, el: 'spectro', to: 'team', src: '묵념(회절 저항 -10%)' }] }
    } },
  { id: 'brant', rid: 1206, role: 'sub', pw: 48, p: { n: 60, s: 20, l: 20 }, ap: ['heal', 'shield'], f: ['heal'], w: 21020036, w4: 21020044, set: 14,
    b: [{ s: 'amp', v: 20, el: 'fusion', to: 'next', src: '브렌트 반주' }, { s: 'amp', v: 25, dt: 's', to: 'next', src: '브렌트 반주(스킬)' }] },
  { id: 'roccia', rid: 1606, role: 'sub', pw: 42, p: { h: 70, s: 20, l: 10 }, ap: [], f: ['group'], w: 21040026, w4: 21040074, set: 12,
    b: [{ s: 'amp', v: 20, el: 'havoc', to: 'next', src: '로코코 반주' }, { s: 'amp', v: 25, dt: 'n', to: 'next', src: '로코코 반주(일반 공격)' },
        { s: 'flat', v: 200, to: 'team', src: '즉흥 공연(공격력 +200)' }] },
  { id: 'carlotta', rid: 1107, role: 'main', pw: 96, p: { s: 70, l: 20, o: 10 }, ap: [], f: [], w: 21030016, w4: 21030044, set: 10, b: [] },
  { id: 'shorekeeper', rid: 1505, role: 'sup', pw: 12, p: { s: 60, l: 40 }, ap: ['heal'], f: ['heal'], w: 21050036, w4: 21050024, set: 7,
    b: [{ s: 'amp', v: 15, to: 'team', src: '파수인 반주' }, { s: 'cr', v: 12.5, to: 'team', src: '별의 영역·심층(크리 12.5%)' },
        { s: 'cd', v: 25, to: 'team', src: '별의 영역·해금(치피 25%)' }, { s: 'atk', v: 10, to: 'team', src: '귀환 불가의 사도(메인 에코): 에코 사용 시 파티 전원 공격력 10%, 20초' }],
    note: '합일 대응은 할 수 없어 여우의 별자리 합일 파티에서는 릴리 출시 후 교체를 권장합니다.' },
  { id: 'verina', rid: 1503, role: 'sup', pw: 12, p: { l: 50, h: 30, c: 20 }, ap: ['heal', 'coord'], f: ['heal'], w: 21050036, w4: 21050024, set: 7,
    b: [{ s: 'amp', v: 15, to: 'team', src: '벨리나 반주' }, { s: 'atk', v: 20, to: 'team', src: '자연의 선물(공격력 20%)' }, { s: 'atk', v: 10, to: 'team', src: '귀환 불가의 사도(메인 에코): 에코 사용 시 파티 전원 공격력 10%, 20초' }] },
  { id: 'buling', rid: 1307, role: 'sup', pw: 16, p: { s: 50, l: 50 }, ap: ['flare', 'heal'], f: ['heal'], w: 21050016, w4: 21050094, set: 7,
    b: [{ s: 'amp', v: 15, to: 'team', src: '복링 반주' }, { s: 'bonus', v: 25, dt: 's', to: 'team', src: '오뢰 퇴마진(스킬 피해)' }, { s: 'atk', v: 10, to: 'team', src: '귀환 불가의 사도(메인 에코): 에코 사용 시 파티 전원 공격력 10%, 20초' }] },
  { id: 'rover_aero', rid: 1406, role: 'sup', pw: 20, p: { s: 60, l: 40 }, ap: ['erosion', 'heal'], f: ['heal'], w: 21020046, w4: 21020044, set: 7,
    b: [{ s: 'atk', v: 20, to: 'self', up: .6, src: '허공의 먼지: 변주 후 자신 공격력 20%, 10초' }, { s: 'final', v: 30, el: 'aero', dt: 'st', to: 'team', up: .85, uniq: 'stCap', src: '방랑자·기류 반주(침식의 경계): 풍식 효과 최대 스택 10 → 13(별도 곱연산 ×1.3, 유지율 85%)' }] },
  { id: 'rover_spectro', rid: 1501, role: 'sub', pw: 40, p: { s: 50, l: 30, st: 20 }, ap: ['frazzle'], f: [], w: 21020015, w4: 21020044, set: 5, b: [] },
  { id: 'rover_havoc', rid: 1604, role: 'main', pw: 78, p: { n: 35, h: 25, l: 30, s: 10 }, ap: [], f: [], w: 21020015, w4: 21020044, set: 6, b: [] },
  // ===== 1.x ~ 2.x =====
  { id: 'camellya', rid: 1603, role: 'main', pw: 96, p: { n: 70, l: 15, e: 10, o: 5 }, ap: [], f: [], w: 21020026, w4: 21020017, set: 6, b: [] },
  { id: 'jinhsi', rid: 1304, role: 'main', pw: 96, p: { s: 80, l: 15, i: 5 }, ap: ['unison'], f: [], w: 21010026, w4: 21010074, set: 5,
    b: [], note: '3.7부터 합일을 획득해 여우의 별자리 합일 모드와 연계됩니다.' },
  { id: 'changli', rid: 1205, role: 'sub', pw: 52, p: { s: 75, l: 25 }, ap: [], f: [], w: 21020016, w4: 21020044, set: 2,
    b: [{ s: 'amp', v: 20, el: 'fusion', to: 'next', src: '장리 반주' }, { s: 'amp', v: 25, dt: 'l', to: 'next', src: '장리 반주(해방)' }] },
  { id: 'jiyan', rid: 1404, role: 'main', pw: 90, p: { h: 85, s: 10, o: 5 }, ap: [], f: [], w: 21010016, w4: 21010074, set: 4, b: [] },
  { id: 'xiangli_yao', rid: 1305, role: 'main', pw: 88, p: { l: 75, s: 15, n: 10 }, ap: [], f: [], w: 21040016, w4: 21040074, set: 3, b: [] },
  { id: 'calcharo', rid: 1301, role: 'main', pw: 82, p: { l: 55, h: 25, s: 20 }, ap: [], f: [], w: 21010015, w4: 21010074, set: 3, b: [] },
  { id: 'encore', rid: 1203, role: 'main', pw: 84, p: { n: 60, l: 20, s: 10, h: 10 }, ap: [], f: [], w: 21050015, w4: 21050074, set: 2, b: [] },
  { id: 'lingyang', rid: 1104, role: 'main', pw: 76, p: { n: 60, s: 20, l: 20 }, ap: [], f: [], w: 21040015, w4: 21040074, set: 1, b: [] },
  { id: 'yinlin', rid: 1302, role: 'sub', pw: 44, p: { s: 40, c: 40, l: 20 }, ap: ['coord'], f: [], w: 21050016, w4: 21050104, set: 3,
    b: [{ s: 'amp', v: 20, el: 'electro', to: 'next', src: '음림 반주' }, { s: 'amp', v: 25, dt: 'l', to: 'next', src: '음림 반주(해방)' }] },
  { id: 'zhezhi', rid: 1105, role: 'sub', pw: 44, p: { n: 70, s: 20, l: 10 }, ap: ['coord'], f: [], w: 21050026, w4: 21050104, set: 1,
    b: [{ s: 'amp', v: 20, el: 'glacio', to: 'next', src: '절지 반주' }, { s: 'amp', v: 25, dt: 's', to: 'next', src: '절지 반주(스킬)' }] },
  { id: 'jianxin', rid: 1405, role: 'sup', pw: 18, p: { l: 60, h: 40 }, ap: ['shield', 'heal'], f: ['group', 'heal'], w: 21040015, w4: 21040044, set: 8,
    b: [{ s: 'amp', v: 38, dt: 'l', to: 'next', src: '감심 반주(해방 38%)' }] },
  { id: 'sanhua', rid: 1102, role: 'sub', pw: 32, p: { s: 50, l: 30, n: 20 }, ap: [], f: [], w: 21020044, w4: 21020044, set: 8,
    b: [{ s: 'amp', v: 38, dt: 'n', to: 'next', src: '산화 반주(일반 38%)' }] },
  { id: 'mortefi', rid: 1204, role: 'sub', pw: 32, p: { c: 60, s: 20, l: 20 }, ap: ['coord'], f: [], w: 21030044, w4: 21030044, set: 8,
    b: [{ s: 'amp', v: 38, dt: 'h', to: 'next', src: '모르테피 반주(강공격 38%)' }] },
  { id: 'taoqi', rid: 1601, role: 'sup', pw: 14, p: { s: 60, l: 40 }, ap: ['shield'], f: [], w: 21010024, w4: 21010024, set: 8,
    b: [{ s: 'amp', v: 38, dt: 's', to: 'next', src: '도기 반주(스킬 38%)' }] },
  { id: 'lumi', rid: 1504, role: 'sub', pw: 30, p: { s: 60, n: 40 }, ap: [], f: ['move'], w: 21010074, w4: 21010074, set: 8,
    b: [{ s: 'amp', v: 38, dt: 's', to: 'next', src: '루미 반주(스킬 38%)' }] },
  { id: 'danjin', rid: 1602, role: 'sub', pw: 36, p: { s: 50, h: 40, l: 10 }, ap: [], f: [], w: 21020017, w4: 21020017, set: 6,
    b: [{ s: 'amp', v: 23, el: 'havoc', to: 'next', src: '단근 반주(인멸 23%)' }] },
  { id: 'aalto', rid: 1403, role: 'sub', pw: 30, p: { n: 50, s: 30, l: 20 }, ap: [], f: ['move'], w: 21030064, w4: 21030064, set: 8,
    b: [{ s: 'amp', v: 23, el: 'aero', to: 'next', src: '알토 반주(기류 23%)' }] },
  { id: 'youhu', rid: 1106, role: 'sup', pw: 12, p: { s: 60, l: 40 }, ap: ['heal'], f: ['heal'], w: 21040074, w4: 21040074, set: 7,
    b: [{ s: 'amp', v: 100, dt: 'c', to: 'next', src: '유호 반주(협동 100%)' }] },
  { id: 'baizhi', rid: 1103, role: 'sup', pw: 10, p: { l: 50, c: 50 }, ap: ['heal', 'coord'], f: ['heal'], w: 21050024, w4: 21050024, set: 7,
    b: [{ s: 'amp', v: 15, to: 'next', src: '설지 반주' }] },
  { id: 'yuanwu', rid: 1303, role: 'sup', pw: 16, p: { c: 60, s: 40 }, ap: ['coord'], f: [], w: 21040034, w4: 21040034, set: 8, b: [] },
  { id: 'yangyang', rid: 1402, role: 'sup', pw: 14, p: { s: 40, l: 40, n: 20 }, ap: [], f: ['group'], w: 21020024, w4: 21020024, set: 8, b: [] },
  { id: 'chixia', rid: 1202, role: 'main', pw: 70, p: { s: 60, n: 20, l: 20 }, ap: [], f: [], w: 21030074, w4: 21030074, set: 2, b: [] }
];

const ZONES = {  // 구역(탑) 정의: area = 게임 데이터의 AreaNum
  L: { n: '잔향의 탑', sub: '좌측 · 1~4층', area: 1, floors: [1, 2, 3, 4] },
  C12: { n: '심연의 탑 1~2층', sub: '중앙 하층', area: 2, floors: [1, 2] },
  C34: { n: '심연의 탑 3~4층', sub: '중앙 보스층', area: 2, floors: [3, 4] },
  R: { n: '울림의 탑', sub: '우측 · 1~4층', area: 3, floors: [1, 2, 3, 4] }
};

/* 추천 조합 (커뮤니티 정설 + 빌드 가이드) */
const PRESETS = [
  // v: 대체 조합. k = mid(캐릭풀이 적을 때) / f2p(입문·무과금). 출처: 사용자 제보, Prydwen 캐릭터 가이드 팀 추천
  { id: 'hiyuki', t: '히유키 서리 파티', tag: '역경의 탑', m: ['hiyuki', 'lucilla', 'suisui'],
    d: '서리 효과 파티. 루실라 반주가 서리 피해를 60% 부스트하고, 수수가 전체 피해 25% 부스트와 이상 효과 스택 상한을 올립니다.',
    v: [{ k: 'mid', m: ['hiyuki', 'lucilla', 'chisa'], n: '수수 대신 치사' },
        { k: 'mid', m: ['hiyuki', 'sanhua', 'suisui'], n: '루실라 대신 산화: 협주를 빨리 채워 히유키가 더 자주 나옵니다' },
        { k: 'mid', m: ['hiyuki', 'lynae', 'suisui'], n: '루실라 대신 린네' },
        { k: 'f2p', m: ['hiyuki', 'sanhua', 'baizhi'], n: '배포 캐릭터만으로 짜는 입문 조합' },
        { k: 'f2p', m: ['hiyuki', 'sanhua', 'verina'], n: '설지 대신 벨리나' }] },
  { id: 'hsin_flare', t: '여우의 별자리 · 전자', tag: '역경의 탑', m: ['hsin', 'rover_electro', 'suisui'],
    d: '방랑자·전도가 전자 효과를 계속 쌓고, 수수가 전자 효과 스택 상한과 전체 피해를 올립니다.',
    v: [{ k: 'mid', m: ['hsin', 'rover_electro', 'chisa'], n: '수수 대신 치사(퀵스왑에 능숙하면 유연함)' },
        { k: 'f2p', m: ['hsin', 'rover_electro', 'buling'], n: '방랑자는 무료, 복링은 4성이라 진입 장벽이 가장 낮습니다(여전복)' }] },
  { id: 'hsin_unison', t: '여우의 별자리 · 합일 (쇄명 출시 후 최고점)', tag: '역경의 탑', m: ['hsin', 'suoming', 'shorekeeper'],
    d: '쇄명이 합일을 얻고 퇴장하면 반주와 여우의 별자리 변주가 동시에 터집니다.',
    v: [{ k: 'mid', m: ['hsin', 'suoming', 'lily'], n: '릴리(3.8) 출시 후 합일 대응 힐러로 교체' },
        { k: 'mid', m: ['hsin', 'jinhsi', 'shorekeeper'], n: '쇄명 대신 금희 합일' },
        { k: 'f2p', m: ['hsin', 'suoming', 'verina'], n: '파수인 대신 벨리나' }] },
  { id: 'xuanling', t: '양양·현령 암흑 파티', tag: '역경의 탑', m: ['xuanling', 'chisa', 'suisui'],
    d: '현령 반주가 암흑 효과를 거는 캐릭터의 인멸 피해를 부스트합니다. 치사·수수 모두 이상 효과 지원 서포터입니다.',
    v: [{ k: 'mid', m: ['xuanling', 'rebecca', 'suisui'], n: '치사 대신 레베카(무료, 치사+수수에 가까운 성능)' },
        { k: 'mid', m: ['xuanling', 'lynae', 'mornye'], n: '모니에는 린네와 함께일 때만' },
        { k: 'f2p', m: ['xuanling', 'mortefi', 'verina'], n: '모르테피 강공격 반주 + 벨리나' }] },
  { id: 'aemeath', t: '에이메스 불꽃 파티', tag: '역경의 탑', m: ['aemeath', 'denia', 'chisa'],
    d: '데니아 불꽃 모드 반주가 불꽃 효과 피해를 60% 부스트합니다.',
    v: [{ k: 'mid', m: ['aemeath', 'denia', 'suisui'], n: '치사 대신 수수' },
        { k: 'mid', m: ['aemeath', 'denia', 'lupa'], n: '치사 대신 루파' },
        { k: 'mid', m: ['aemeath', 'lynae', 'mornye'], n: '조화 파동 모드 파티' },
        { k: 'f2p', m: ['aemeath', 'lupa', 'verina'], n: '모노 용융 계열, 힐러는 벨리나' }] },
  { id: 'sigrika', t: '시그리카 에코 파티', tag: '역경의 탑', m: ['sigrika', 'qiuyuan', 'ciaccona'],
    d: '구원 반주가 에코 피해 50% 부스트, 시그리카가 파티 기류·에코 피해를 올려 줍니다.',
    v: [{ k: 'mid', m: ['sigrika', 'qiuyuan', 'lucilla'], n: '샤콘 대신 루실라(에코 모드)' },
        { k: 'mid', m: ['sigrika', 'qiuyuan', 'shorekeeper'], n: '샤콘 대신 파수인' },
        { k: 'mid', m: ['sigrika', 'lynae', 'mornye'], n: '구원이 없을 때' },
        { k: 'f2p', m: ['sigrika', 'qiuyuan', 'verina'], n: '힐러를 벨리나로' }] },
  { id: 'phrolova', t: '플로로 인멸 파티', tag: '역경의 탑', m: ['phrolova', 'cantarella', 'lucilla'],
    d: '칸타렐라 반주(인멸·스킬)와 루실라 에코 모드로 에코 피해를 극대화합니다.',
    v: [{ k: 'mid', m: ['phrolova', 'lucilla', 'qiuyuan'], n: '루실라는 구원과 함께일 때 가장 강함' },
        { k: 'mid', m: ['phrolova', 'cantarella', 'roccia'], n: '루실라 대신 로코코' },
        { k: 'mid', m: ['phrolova', 'cantarella', 'shorekeeper'], n: '서포터를 파수인으로' },
        { k: 'f2p', m: ['phrolova', 'danjin', 'shorekeeper'], n: '단근 인멸 반주' },
        { k: 'f2p', m: ['phrolova', 'danjin', 'verina'], n: '파수인 대신 벨리나' }] },
  { id: 'cartethyia', t: '카르티시아 풍식 파티', tag: '역경의 탑', m: ['cartethyia', 'ciaccona', 'rover_aero'],
    d: '샤콘 반주가 풍식 피해 100% 부스트. 방랑자·기류는 힐과 풍식 스택 상한을 담당합니다.',
    v: [{ k: 'mid', m: ['cartethyia', 'ciaccona', 'chisa'], n: '방랑자·기류 대신 치사(전용 무기가 있을 때 더 강함)' },
        { k: 'mid', m: ['cartethyia', 'ciaccona', 'shorekeeper'], n: '광역 다수 웨이브에서는 파수인' },
        { k: 'f2p', m: ['cartethyia', 'sanhua', 'rover_aero'], n: '샤콘이 없을 때 가장 좋은 무과금 조합' }] },
  { id: 'qingxiao', t: '청초 조화 밀집 파티', tag: '역경의 탑', m: ['qingxiao', 'denia', 'mornye'],
    d: '데니아 조화 밀집 반주(최대 40%)와 모니에 반주 25%가 겹치는 구성입니다. 데니아는 모니에 없이 쓰면 손실이 큽니다.',
    v: [{ k: 'mid', m: ['qingxiao', 'lynae', 'mornye'], n: '데니아 대신 린네' },
        { k: 'mid', m: ['qingxiao', 'lynae', 'shorekeeper'], n: '모니에 대신 파수인(손실 적음)' },
        { k: 'mid', m: ['qingxiao', 'lynae', 'ciaccona'], n: '모니에 대신 샤콘' }] },
  { id: 'lucy', t: '루시 엣지러너', tag: '역경의 탑', m: ['lucy', 'rebecca', 'mornye'],
    d: '레베카 반주(강공격 최대 35%)와 해킹 연계 파티입니다. 루시·레베카는 고정이고 세 번째 칸만 바뀝니다.',
    v: [{ k: 'mid', m: ['lucy', 'rebecca', 'shorekeeper'], n: '모니에에 아주 가까운 2순위' },
        { k: 'f2p', m: ['lucy', 'rebecca', 'verina'], n: '세 번째 칸을 벨리나로' }] },
  { id: 'jingran', t: '경연 강공격 파티', tag: '역경의 탑', m: ['jingran', 'iuno', 'shorekeeper'],
    d: '유노 반주 강공격 50% 부스트와 실드 연계.',
    v: [{ k: 'mid', m: ['jingran', 'iuno', 'verina'], n: '파수인 대신 벨리나' },
        { k: 'mid', m: ['jingran', 'lupa', 'mornye'], n: '모노 용융(루파는 유노와 같이 쓰지 않기)' },
        { k: 'f2p', m: ['jingran', 'mortefi', 'verina'], n: '모르테피 강공격 반주' },
        { k: 'f2p', m: ['jingran', 'rebecca', 'verina'], n: '레베카 강공격 반주' }] },
  { id: 'galbrena', t: '갈브레나 용융 파티', tag: '역경의 탑', m: ['galbrena', 'lupa', 'mornye'],
    d: '루파 반주와 추적 사냥 버프를 받는 모노 용융 구성.',
    v: [{ k: 'mid', m: ['galbrena', 'lupa', 'mortefi'], n: '모니에 대신 모르테피' },
        { k: 'mid', m: ['galbrena', 'phrolova', 'shorekeeper'], n: '플로로 듀얼 딜' },
        { k: 'f2p', m: ['galbrena', 'mortefi', 'verina'], n: '무과금 조합' }] },
  { id: 'zani', t: '젠니 광학 파티', tag: '역경의 탑', m: ['zani', 'phoebe', 'rover_spectro'],
    d: '페비 고해 모드가 광학 효과 피해 100% 부스트. 페비가 젠니 딜을 약 2배로 올립니다.',
    v: [{ k: 'mid', m: ['zani', 'phoebe', 'shorekeeper'], n: '퀵스왑 없이 쓸 때' },
        { k: 'f2p', m: ['zani', 'mortefi', 'rover_spectro'], n: '모르테피 강공격 반주' }] },
  { id: 'jinhsi', t: '금희 파티', tag: '역경의 탑', m: ['jinhsi', 'zhezhi', 'shorekeeper'],
    d: '절지가 협동 공격과 해방 심화를 맡는 금희 정석 조합입니다.',
    v: [{ k: 'mid', m: ['jinhsi', 'hsin', 'shorekeeper'], n: '여우의 별자리 합일 모드와 짝' },
        { k: 'mid', m: ['jinhsi', 'yinlin', 'shorekeeper'], n: '절지 대신 음림(퀵스왑에 유리)' },
        { k: 'f2p', m: ['jinhsi', 'yuanwu', 'verina'], n: '무과금: 연무 + 벨리나' },
        { k: 'f2p', m: ['jinhsi', 'mortefi', 'verina'], n: '모르테피는 투자가 많을 때만' }] },
  { id: 'camellya', t: '카멜리아 파티', tag: '역경의 탑', m: ['camellya', 'lynae', 'mornye'],
    d: '린네·모니에가 정석. 카멜리아는 사이클이 길어 반주 버프가 끝까지 유지되지 않는 편입니다.',
    v: [{ k: 'mid', m: ['camellya', 'roccia', 'shorekeeper'], n: '로코코 인멸 반주' },
        { k: 'mid', m: ['camellya', 'sanhua', 'shorekeeper'], n: '로코코 대신 산화(무과금에 강함)' },
        { k: 'f2p', m: ['camellya', 'sanhua', 'verina'], n: '배포 캐릭터 조합' },
        { k: 'f2p', m: ['camellya', 'danjin', 'verina'], n: '산화 대신 단근' }] },
  { id: 'carlotta', t: '카를로타 파티', tag: '역경의 탑', m: ['carlotta', 'lynae', 'mornye'],
    d: '린네·모니에가 정석. 린네가 없으면 출시 당시 조합인 절지·파수인을 씁니다.',
    v: [{ k: 'mid', m: ['carlotta', 'zhezhi', 'shorekeeper'], n: '가장 흔한 조합' },
        { k: 'mid', m: ['carlotta', 'zhezhi', 'verina'], n: '파수인 대신 벨리나' },
        { k: 'f2p', m: ['carlotta', 'yangyang', 'verina'], n: '양양 반주로 공명 에너지 보충' },
        { k: 'f2p', m: ['carlotta', 'taoqi', 'buling'], n: '도기 스킬 반주 + 복링' }] },
  { id: 'jiyan', t: '기염 파티', tag: '역경의 탑', m: ['jiyan', 'iuno', 'ciaccona'],
    d: '유노 강공격 반주와 샤콘 기류 지원을 받는 최고점 조합입니다.',
    v: [{ k: 'mid', m: ['jiyan', 'ciaccona', 'shorekeeper'], n: '풍식 파티' },
        { k: 'mid', m: ['jiyan', 'ciaccona', 'rover_aero'], n: '파수인 대신 방랑자·기류' },
        { k: 'f2p', m: ['jiyan', 'mortefi', 'verina'], n: '모르테피 강공격 반주' },
        { k: 'f2p', m: ['jiyan', 'rebecca', 'verina'], n: '레베카 강공격 반주' }] },
  { id: 'xiangli_yao', t: '상리요 파티', tag: '역경의 탑', m: ['xiangli_yao', 'lynae', 'mornye'],
    d: '린네가 음림 반주와 거의 같은 버프를 줘서 최고의 파트너입니다.',
    v: [{ k: 'mid', m: ['xiangli_yao', 'yinlin', 'shorekeeper'], n: '음림 해방 반주' },
        { k: 'mid', m: ['xiangli_yao', 'yangyang', 'shorekeeper'], n: '한정 아닌 조합(퀵스왑 필요)' },
        { k: 'f2p', m: ['xiangli_yao', 'jianxin', 'verina'], n: '감심 해방 38% 반주(공명 효율 더 필요)' }] },
  { id: 'changli', t: '장리 용융 파티', tag: '역경의 탑', m: ['changli', 'brant', 'lupa'],
    d: '루파가 장리를 받쳐 주고 장리 반주가 다음 캐릭터를 강화합니다.',
    v: [{ k: 'mid', m: ['changli', 'brant', 'shorekeeper'], n: '브렌트 듀얼 딜' },
        { k: 'mid', m: ['changli', 'encore', 'shorekeeper'], n: '앙코와 듀얼 용융' },
        { k: 'f2p', m: ['changli', 'yangyang', 'verina'], n: '무과금 듀얼 딜' }] },
  // 필드
  { id: 'f_hsin', t: '필드 · 여우의 별자리 무과금 사냥', tag: '필드', m: ['hsin', 'rover_electro', 'buling'], d: '광역 전자 효과와 복링 힐로 필드 몹 정리가 편합니다.' },
  { id: 'f_heal', t: '필드 · 무한 탐사', tag: '필드', m: ['cartethyia', 'rover_aero', 'verina'], d: '힐러 둘로 생존 걱정 없이 탐사합니다. 카르티시아는 받는 치유도 늘려 줍니다.' },
  { id: 'f_newbie', t: '필드 · 무료 캐릭터만', tag: '필드', m: ['rover_havoc', 'sanhua', 'baizhi'], d: '배포 캐릭터만으로 짠 기본 필드 파티.' }
];
// 자동 편성 가중치용: 추천 조합(정석·대체·입문) 목록
/* ---------- 커뮤니티 정보 (자동 편성 보정용) ----------
   COMMUNITY_TEAMS: 공략 사이트(wuwabuild.com 공명자 빌드, 3.7 기준 — Prydwen 역경의 탑 순위를 따름)에 올라온 추천 파티.
                    [종류, 이름, 캐릭터…] 종류 best = 대표 조합, mid = 대체, f2p = 입문
   CHAR_TIER      : 같은 사이트의 3.7 역경의 탑 티어(0 = T0 … 6 = T4). 계산 모델이 놓치는 손맛 · 메커니즘 차이를 조금 보정합니다. */
const COMMUNITY_TEAMS = [
  ['best', '전자', 'hsin', 'rover_electro', 'suisui'], ['f2p', '전자 입문', 'hsin', 'rover_electro', 'buling'], ['best', '합일', 'hsin', 'suoming', 'shorekeeper'], ['mid', '금희 합일', 'hsin', 'jinhsi', 'shorekeeper'],
  ['best', '서리', 'hiyuki', 'sanhua', 'shorekeeper'], ['mid', '서리', 'hiyuki', 'carlotta', 'zhezhi'], ['best', '서리 하이퍼캐리', 'hiyuki', 'lucilla', 'chisa'],
  ['best', '용융', 'jingran', 'iuno', 'shorekeeper'], ['mid', '모노 용융', 'jingran', 'lupa', 'mornye'], ['mid', '모노 용융', 'jingran', 'brant', 'lupa'], ['mid', '하이퍼캐리', 'jingran', 'rebecca', 'shorekeeper'], ['mid', '용융', 'jingran', 'denia', 'lupa'], ['f2p', '입문', 'jingran', 'mortefi', 'verina'],
  ['best', '조화 밀집', 'qingxiao', 'denia', 'mornye'], ['mid', '린네', 'qingxiao', 'lynae', 'mornye'],
  ['best', '암흑', 'xuanling', 'lynae', 'chisa'], ['mid', '암흑', 'xuanling', 'lynae', 'mornye'], ['best', '암흑', 'xuanling', 'suisui', 'chisa'], ['best', '암흑', 'xuanling', 'rebecca', 'chisa'],
  ['best', '불꽃 순환', 'denia', 'lupa', 'brant'], ['mid', '데니아', 'denia', 'changli', 'shorekeeper'],
  ['mid', '루실라', 'sigrika', 'lucilla', 'shorekeeper'],
  ['best', '회절 컬러 버스트', 'phoebe', 'lynae', 'shorekeeper'], ['mid', '린네', 'lynae', 'verina', 'shorekeeper'],
  ['best', '체인소', 'cantarella', 'chisa', 'shorekeeper'], ['mid', '치사', 'roccia', 'chisa', 'verina'],
  ['best', '용융 증폭', 'lupa', 'changli', 'mornye'], ['mid', '모니에', 'galbrena', 'brant', 'mornye'],
  ['best', '조화 파동', 'aemeath', 'lynae', 'mornye'], ['mid', '루파', 'aemeath', 'lupa', 'mornye'],
  ['best', '회절 아우레올', 'luuk', 'shorekeeper', 'verina'], ['mid', '페비', 'luuk', 'phoebe', 'shorekeeper'],
  ['best', '에코 스킬', 'sigrika', 'qiuyuan', 'shorekeeper'], ['mid', '기류', 'sigrika', 'cartethyia', 'iuno'], ['mid', '기류', 'qiuyuan', 'cartethyia', 'iuno'],
  ['best', '엣지러너', 'lucy', 'rebecca', 'mornye'], ['mid', '레베카', 'phoebe', 'rebecca', 'rover_spectro'], ['mid', '강공격', 'augusta', 'rebecca', 'shorekeeper'],
  ['mid', '금희 합일', 'jinhsi', 'suoming', 'shorekeeper'], ['mid', '방랑자·전도', 'hiyuki', 'rover_electro', 'shorekeeper'],
  ['mid', '공명 스킬', 'xiangli_yao', 'buling', 'yuanwu'], ['mid', '복링', 'calcharo', 'buling', 'shorekeeper'],
  ['best', '전도 강공격', 'augusta', 'yinlin', 'shorekeeper'], ['mid', '아우구스타', 'augusta', 'yuanwu', 'verina'],
  ['best', '용융 에코', 'galbrena', 'brant', 'shorekeeper'], ['mid', '갈브레나', 'galbrena', 'changli', 'verina'],
  ['best', '인멸 강공격', 'phrolova', 'cantarella', 'shorekeeper'], ['mid', '플로로', 'phrolova', 'roccia', 'verina'],
  ['best', '풍식', 'cartethyia', 'ciaccona', 'shorekeeper'], ['mid', '풍식', 'cartethyia', 'ciaccona', 'rover_aero'], ['mid', '유노', 'cartethyia', 'iuno', 'shorekeeper'],
  ['best', '울부짖는 늑대', 'lupa', 'changli', 'brant'], ['mid', '루파', 'encore', 'lupa', 'mortefi']
];
const TIER_N = ['T0', 'T0.5', 'T1', 'T1.5', 'T2', 'T3', 'T4'];
const CHAR_TIER = Object.fromEntries([
  [0, 'hiyuki jingran qingxiao xuanling denia iuno lucilla lynae chisa mornye suisui shorekeeper'],
  [1, 'aemeath hsin luuk sigrika lupa qiuyuan rebecca verina suoming'],
  [2, 'augusta cartethyia galbrena lucy phrolova ciaccona mortefi rover_electro lily'],
  [3, 'carlotta buling rover_aero'],
  [4, 'brant jiyan zani cantarella changli phoebe sanhua rover_spectro'],
  [5, 'camellya encore jinhsi lingyang xiangli_yao danjin roccia yinlin zhezhi baizhi'],
  [6, 'calcharo chixia rover_havoc aalto jianxin lumi taoqi yangyang youhu yuanwu']
].flatMap(([t, ids]) => ids.split(' ').map(id => [id, t])));
const tierOf = id => CHAR_TIER[id] ?? 4;
const TIER_TARGET = [1, .93, .86, .8, .74, .66, .58]; // 티어별로 기대하는 상대 화력(T0 = 1)
/* 커뮤니티 평가 보정
   1) 메인 딜러마다 '대표 조합(추천 · 커뮤니티 조합)'의 계산 피해를 구해, 가장 센 조합 대비 비율(모델 평가)을 냄
   2) 그 비율과 티어가 기대하는 비율을 기하평균으로 섞음: 보정 = (티어 기대 / 모델 평가)^α, α는 설정 세기(보통 0.5), 0.7~1.45배로 제한
   3) 서브 · 서포터는 티어에 따라 ±1.5%만
   계산 모델이 덜 반영하는 메커니즘(이상 효과 · 특수 상호작용 · 실전 손맛)을 공략 사이트 평가로 메우되, 보유 캐릭터 · 탑 버프에 따른 계산 차이는 그대로 살립니다.
   화면의 피해 숫자는 계산값 그대로이고, 자동 편성 순위에만 씁니다. */
let _cal = null;
function tierCal() {
  const key = JSON.stringify({ ...state.settings, parties: 0 }) + CHARS.length;
  if (_cal && _cal.key === key) return _cal.v;
  const ctx = { settings: state.settings, ov: {}, zone: null, season: null };
  const ref = {};
  presetTeams().forEach(x => { const m = x.m[0]; if (!CH[m] || isUpcoming(CH[m]) && !state.settings.upcoming) return; const r = bestTeam(x.m, ctx); if (r && r.score > (ref[m] || 0)) ref[m] = r.score; });
  const max = Math.max(1, ...Object.values(ref));
  const v = {}; Object.entries(ref).forEach(([m, sc]) => { v[m] = { rel: sc / max, tgt: TIER_TARGET[tierOf(m)] }; });
  _cal = { key, v }; return v;
}
function tierBias(ids, detail) {
  const w = (state.settings.tierBias ?? 100) / 100; if (!w) return detail ? { f: 1 } : 1;
  const a = w >= 2 ? .75 : w >= 1 ? .5 : .3;
  const [m, ...o] = ids; const c = m && tierCal()[m];
  const fm = c ? Math.min(1.45, Math.max(.7, Math.pow(c.tgt / c.rel, a))) : 1;
  const fo = 1 + o.filter(Boolean).reduce((s, id) => s + (3 - tierOf(id)) / 2 * 0.01 * w, 0);
  const f = fm * fo;
  return detail ? { f, fm, fo, tier: m ? TIER_N[tierOf(m)] : '', c } : f;
}
const ROLE_ORD = { main: 0, sub: 1, sup: 2 };
const byRole = ids => ids.slice().sort((a, b) => (ROLE_ORD[CH[a] && CH[a].role] ?? 1) - (ROLE_ORD[CH[b] && CH[b].role] ?? 1));
let _ptCache = null;
function presetTeams() {
  if (_ptCache && _ptCache.n === CHARS.length) return _ptCache.v;
  const out = [];
  PRESETS.filter(p => p.tag !== '필드').forEach(p => {
    out.push({ p, k: 'best', m: p.m });
    (p.v || []).forEach(v => out.push({ p, k: v.k, m: v.m, n: v.n }));
  });
  COMMUNITY_TEAMS.forEach(([k, n, ...m]) => {
    if (!m.every(id => CH[id]) || out.some(x => sameTeam(x.m, m))) return;
    const ids = byRole(m);
    out.push({ p: { t: `${CH[ids[0]].name} ${n}`, src: 'wuwabuild' }, k, m: ids, community: true });
  });
  const v = out.filter(x => x.m.every(id => CH[id]));
  _ptCache = { n: CHARS.length, v }; return v;
}

/* =====================================================================
   딜 사이클 데이터 (출처: Prydwen 캐릭터 가이드 로테이션, 아카라이브 명조 채널 사이클 글)
   ft   : 한 번 필드에 나와 있는 시간(초, 추정)
   loop : 변주로 등장했을 때의 사이클
   open : 첫 사이클(변주 없이 시작할 때)
   full : true면 사이클 도중 교체가 어려워 끝까지 돌려야 함
   ===================================================================== */
const ROT = {
  hiyuki: { ft: 13, full: false,
    loop: ['변주', '강공(평꾹)', '공명 해방 1차', '평타 3회', 'E 2회', '평타 5회', '평타 후 회피 → 거합 태세', '거합 평타 3회', '강공(평꾹)', '공명 해방 2차', 'E', '에코', '반주'],
    tip: '변주 후 약 14초 안에 거합까지 넣는 것이 핵심입니다. 등장 전에 강공으로 공명 회로를 미리 채워 두면 시간이 넉넉해집니다.' },
  hsin: { modes: {
    flare: { ft: 17, full: true,
      loop: ['변주', '평타', '강공(속세 평정)', '공명 해방 1차 (만상의 비춤 변신)', '평타 3회', '강화 E (기관 통솔 진입)', '평타 4회', '강공(천하 평정)', 'E (천둥의 마음 폭발)', '공명 해방 2차', '반주'],
      tip: '첫 사이클은 천둥의 마음 E를 2차 해방 직전에, 다음 사이클부터는 강화 E 직후에 씁니다(스택이 많을수록 강함). 퀵스왑이 막힌 캐릭터라 사이클을 끝까지 돌립니다.' },
    unison: { ft: 15, full: true, src: '게임 스킬 설명 · 게임톡 띵조해 쇄명 가이드',
      loop: ['변주 (만상의 화응 · 만상 합일)', '평타 2회', '강공 (속세를 거니는 발걸음 → 속세 평정)', '공명 해방 · 형상 전환 (합일 획득)', '교체 → 합일: 여우의 별자리 반주 + 쇄명 변주', '쇄명 사이클 후 합일로 다시 등장 (만상의 비춤 · 만상 합일 → 기관 통솔 진입)', '평타 1~4 (무수히 이어진 궁궐)', '강공 (천하 강림 → 천하 평정)', '공명 해방 · 무수히 하늘을 뒤덮은 궁궐', '반주'],
      tip: '변주를 두 번 받아 바로 기관 통솔에 들어갑니다(만상의 비춤 변주 = 기관 통솔 + 마음의 비춤 300). 파티 순서는 3-2-1-2-1(서포터 → 쇄명 → 여우의 별자리 → 쇄명 → 여우의 별자리)이고, 쇄명 합류 후에는 전자 모드가 아니라 합일 모드로 바꿔 두세요.' } } },
  rover_electro: { ft: 8, full: true,
    loop: ['변주', '평타 1~4', 'E', '평타(척력) → 공명 해방으로 캔슬', '공명 해방', 'E (과부하: 짧게 = 파티 공격력 10%)', '반주'],
    tip: '혼자서는 협주 에너지를 빨리 채우지 못해 짧게 나왔다 빠지는 3-2-1 운영이 어렵습니다. 사이클(약 8초)을 끝까지 돌린 뒤 반주로 넘기세요.',
    withTeam: { buling: { ft: 7, full: false, openAll: true,
      open: ['(복링 평타 1~4 뒤) 교체 → 평타 1~3 → 교체', '(복링 강공 2회 뒤) 교체 → E → 평타 → 교체', '변주', '평타 1~3', '공명 해방', '에코', '강화 E (과부하)', '반주 → 여우의 별자리'],
      loop: ['(복링 평타 1~4 뒤) 교체 → 평타 1~3 → 교체', '변주', '평타 1~3', 'E → 평타', '공명 해방', '에코', '강화 E (과부하)', '반주 → 여우의 별자리'],
      tip: '복링 사이클 중간에 잠깐 나와 전류를 미리 쌓아 두는 퀵스왑 운영입니다(퀵스왑은 방랑자·복링 사이만). 3-2-1로 돌리려면 복링 구간에 넣던 평타·E를 변주 뒤로 옮기면 됩니다.' } } },
  buling: { ft: 8,
    loop: ['(변주 없이 교체)', '평타 1~4', 'E', '평타 4', '강공(진위뢰 震為雷)', '강공(뇌산소과 雷山小過) → 공명 해방으로 캔슬', '공명 해방(비뢰결 · 귀일)', '에코(귀환 불가의 사도)', '반주'],
    tip: '변주 없이 들어오는 사이클이 가장 빠릅니다. 반주 피해 심화 15%는 30초 지속이라 교체해도 사라지지 않습니다.',
    withTeam: { rover_electro: { ft: 7,
      open: ['(전투 시작) 평타 1~4', '교체 → 방랑자 평타 1~3 → 교체', 'E → 평타', '강공 2회', '교체 → 방랑자 E → 평타 → 교체', '에코', '공명 해방(비뢰결 · 귀일)', '반주 → 방랑자·전도'],
      loop: ['(여우의 별자리 반주 뒤) 평타 1~4', '교체 → 방랑자 평타 1~3 → 교체', 'E → 평타', '강공 2회', '에코', '공명 해방(비뢰결 · 귀일)', '반주 → 방랑자·전도'],
      tip: '두 번째 사이클부터는 강공 2회 뒤에 방랑자를 꺼내지 않습니다. 방랑자의 E·평타는 변주 뒤로 옮겨야 협주 에너지가 너무 일찍 차지 않습니다.' } } },
  suisui: { ft: 6,
    open: ['평타 1~3', 'E (깨어난 봄기운)', '낙하 공격(바람을 가르는 제비)', '평타 1~4 → 공명 해방으로 캔슬', '공명 해방', '반주'],
    loop: ['변주', 'E', '평타 1~4 → 공명 해방으로 캔슬', '공명 해방', '반주'],
    tip: '반주 전에 교체하지 마세요. 반주와 공명 해방 버프가 사이클에 맞춰져 있습니다. 공명 효율은 약 260%가 목표입니다.' },
  lucilla: { modes: {
    chafe: { ft: 7, loop: ['변주', 'E 길게 누르기 (황금 표시에서 떼기)', '공명 해방', '평타 길게 누르기 (1·2·3형태)', '내려놓기', '반주 (교체 연타로 빠르게)'] },
    echo: { ft: 7, loop: ['변주', 'E 길게 누르기', '공명 해방', '평타 길게 누르기 (1·2·3형태)', '내려놓기', '반주 전 교체'] } },
    tip: '교체 캔슬 구간이 거의 없어 퀵스왑에는 맞지 않습니다.' },
  chisa: { ft: 6,
    open: ['평타 1·2 → E', 'E', '전기톱 돌진 평타', '전기톱 연속 베기 → 공명 해방으로 캔슬', '공명 해방', '평타 2 → E', '전기톱 평타 2·3', '마무리 평타 (교체)', '반주'],
    loop: ['변주', '평타 2', '전기톱 돌진 평타', '연속 베기 (뒷걸음 후 공명 해방으로 캔슬)', '공명 해방', 'E', '전기톱 평타 2·3', '마무리 평타 (교체)', '반주'],
    tip: '보통 파티에서 가장 먼저 나와 사이클을 엽니다. 이상 효과 심화는 교체해도 유지됩니다.' },
  xuanling: { ft: 14, loop: ['변주 → 바로 에코', '평타 1~4 (푸름)', 'E (검술의 전환 · 깃털)', '강공(깃털)', '공중 평타', '평타 1~3 → 공명 해방으로 캔슬', '공명 해방', 'E (검술의 전환 · 푸름)', '강공(푸름)', '반주'] },
  aemeath: { ft: 15, loop: ['변주 → 점프', '공명 해방(경계를 부순 별빛 · 과부하)', '메카스카우트 평타 2~4 → E (협공 · 돌진)', 'E (빛나는 날개의 합주 · 등장)', '평타 2~4 → E', 'E (빛나는 날개의 합주 · 강림)', '강공(메카스카우트 · 차지 2단계) → 공명 해방으로 캔슬', '공명 해방(경계를 부순 별빛 · 종결)', 'E (원자 배열 교체)', '메카스카우트 평타 2·3 (교체)', '반주'] },
  denia: { ft: 6, loop: ['변주', '평타 4 → E', 'E → 공명 해방으로 캔슬', '공명 해방(막이 내리는 순간 · 연극의 모습)', '평타 1·2 → 점프', '공중 평타 1·2 → E', 'E (추방 · 환멸의 모습 1·2단) → 공명 해방으로 캔슬', '공명 해방(막이 내리는 순간 · 환멸의 모습)', '반주'] },
  sigrika: { ft: 14, loop: ['변주', '평타 2~4', '평타(깨달음) → 강공으로 캔슬', '강공(룬 · 근원 → 룬 · 뒤얽힌 사슬) → 공명 해방', '공명 해방', '평타 2~4', '평타(깨달음) → 강공', '강공(룬 · 근원 → 룬 · 폭발) → E 길게', 'E 길게 (공명 회로 · 나 곧 함의이니)', '반주'] },
  qiuyuan: { ft: 6, loop: ['변주', '평타 3·4', '(E)', '공명 해방', '강공 3연 (끝없는 음률 · 헌신의 서약 · 변치않는 충절)', '반주'] },
  ciaccona: { ft: 6, loop: ['변주', '평타 3·4 → 점프', '공중 평타 1·2', '평타 4 → E', 'E', '강공(4연 다운비트) → 공명 해방', '공명 해방', '반주'] },
  phrolova: { ft: 8, loop: ['변주', '평타 3 → 대시', '공명 회로 평타 → E', 'E', '공명 회로 평타 → 에코(헤카테)', '평타 1~3 → 대시', '공명 회로 평타 → 강공', '강공 → 공명 해방', '공명 해방(지휘 상태)', '반주'],
    tip: '필드에는 짧게 있고, 지휘 상태의 헤카테가 필드 밖에서 계속 공격합니다.' },
  cantarella: { ft: 7, loop: ['변주', 'E → 공명 해방으로 캔슬', '공명 해방', '강공(몽환의 바다 → 신기루 진입)', 'E', '평타 1~3 → E', 'E (감각 흡수)', '에코', '반주'] },
  cartethyia: { ft: 16, loop: ['변주', '평타 2~4 → E', 'E', '공중 공격 → 공명 해방', '공명 해방 (플뢰르 드 리스 변신)', 'E', '강공', '평타 3~5 → E', 'E', '평타 3~5 → 공명 해방', '공명 해방', '(강공)', '반주'] },
  rover_aero: { ft: 6, loop: ['변주', '공명 회로 공중 평타 1·2', '공명 해방', 'E', '공명 회로 공중 평타 1·2', '(E)', '낙하 공격', '공명 회로 평타 → 에코', '교체 (반주)'] },
  qingxiao: { ft: 15, full: true, loop: ['변주', '공중 평타 1~3', '평타 3·4', 'E', '강공', '강화 평타 1~4', '강공', '공명 해방', '에코 (교체 캔슬)', '반주'],
    tip: '강화 상태에 들어간 뒤 교체하면 강화가 풀리므로 교체하지 마세요.' },
  mornye: { ft: 6, full: true, open: ['평타 1~3', '강공', '평타 1~3 → E', 'E', '강공 → 공명 해방', '공명 해방', '반주'],
    loop: ['변주', '평타 1~3 → E', 'E', '강공 → 공명 해방으로 캔슬', '공명 해방', '에코', '반주'], tip: '관측 모드는 교체하면 끝나므로 사이클을 한 번에 끝냅니다.' },
  lucy: { ft: 14, open: ['공명 해방', '교체'], loop: ['변주', 'E (페이로드)', 'E (펄스)', '평타 2~4 → E', 'E (데드락)', '평타 1~4', '강공 2회 → 공명 해방', '공명 해방', '반주'],
    tip: '공명 해방 쿨이 25초 이상이라 사이클을 먼저 열고, 팀 버프가 갖춰진 뒤 변주로 들어옵니다.' },
  rebecca: { ft: 6, open: ['변주', '평타 → 대시', '회피', '평타 2·3', '강공', '공명 회로 강공', '강공 → 공명 해방', '공명 해방', '교체', '반주'],
    loop: ['변주 → 점프', '낙하 공격 → E', 'E → 회피', '평타 2', '공명 회로 강공', '강공 → 공명 해방', '공명 해방', '교체', '반주'] },
  jingran: { ft: 15, loop: ['변주', '공명 해방', '강공', '평타 2~4', '강공', 'E', '평타', '강공', 'E', '평타', '강공', '반주'], tip: '사이클이 느린 편이라 퀵스왑 여지가 적습니다.' },
  iuno: { ft: 7, full: true, loop: ['변주', 'E → 에코/공명 해방으로 캔슬', '공명 해방', '점프 → 대시', '평타 1·2 → E', 'E → 대시', '평타 1·2 → E', 'E', '강공(교체)', '반주'], tip: '공중에 떠 있는 시간이 길어 퀵스왑이 어렵습니다.' },
  shorekeeper: { ft: 5, loop: ['변주', '평타 1~3 → E', 'E', '평타 2', '강공 → 공명 해방', '공명 해방', '에코', '반주'] },
  verina: { ft: 4, loop: ['(변주 없이 교체)', '평타 3~5 → E', 'E → 공명 해방', '공명 해방', '점프 공중 공격 2회', '에코', '반주'] },
  galbrena: { ft: 15, loop: ['에코 먼저', '변주', '평타 2·3', '강공 1~3 → 대시', '강공 1·2 → E', 'E → 공명 해방', '공명 해방', '세라픽 처형 연타 (대시 캔슬)', '반주'] },
  lupa: { ft: 5, loop: ['변주', 'E → 공명 해방으로 캔슬', '공명 해방', '평타', '공중 평타 1~3', '평타 → 점프', 'E', '에코', '반주'] },
  zani: { ft: 14, loop: ['변주', 'E → 공명 해방으로 캔슬', '공명 해방', '평타 3연 (교체로 광학 효과 보충)', '평타 3연', '평타 3연 → 공명 해방', '공명 해방', 'E', '평타 3 (교체)', '반주'] },
  phoebe: { modes: {
    absolution: { ft: 14, loop: ['변주', 'E → 대시 (거울의 고리 안으로)', '강공 → 공명 해방', '공명 해방', '평타 1~3 → 대시 → 강공(별빛) × 4', '반주'] },
    confession: { ft: 6, loop: ['변주 → 공명 해방', 'E → 대시', '평타 1~3 → 강공(별빛)', '평타 1~3 → 강공(별빛)', '반주'] } } },
  lynae: { ft: 5, loop: ['변주 → 공명 해방으로 캔슬', 'E → 공명 해방', '공명 해방', '강공(풀차지)', '점프 3회', '공중 평타', '반주'] },
  jinhsi: { ft: 16, loop: ['변주', 'E (창공의 무지개: 용을 타고 하늘로)', '하늘로 향해 · 평타 1~3', 'E (달을 품은 용녀)', '하늘로 향해 · 평타 4', 'E (승천하는 용: 합일 획득)', '반주'], tip: '팀 한 바퀴에 두 번 나옵니다. 두 번째 등장 때는 E 다음에 공명 해방을 넣습니다.' },
  rover_spectro: { ft: 6, loop: ['강공 → E', '후속 공격 → 공명 회로 회전·회오리', '교체 (E 쿨 대기)', '변주', '공명 해방', '평타 1·2', '공명 회로 연타', '반주'] },
  // ----- 1.0.05: 예전 캐릭터 사이클 (출처: Prydwen 캐릭터 가이드 로테이션) -----
  camellya: { ft: 22, full: true,
    loop: ['변주', 'E(피어난 동백꽃) → 에코로 캔슬', '에코 → 대시로 캔슬', '강공(넝쿨의 춤) 1~3', '강공(타오르는 넝쿨의 춤)', '강공(넝쿨의 춤) 4 → 에코로 캔슬', '에코 → 대시 → 공명 해방', '공명 해방', '평타(넝쿨의 춤) 1 → E로 캔슬', 'E(일순의 꽃)', '강공(넝쿨의 춤) 1~3', '강공(타오르는 넝쿨의 춤)', '강공(넝쿨의 춤) 4 → E로 캔슬', 'E(암흑 꽃술의 마음)', '에코 (교체)', '반주'],
    tip: '사이클이 15초를 넘어 앞 캐릭터의 반주 버프(14초)가 끝까지 유지되지 않는 편입니다. 붉은 동백꽃 상태에서는 이동이 막혀 퀵스왑에 맞지 않습니다.' },
  changli: { ft: 9,
    loop: ['변주', '평타(심안 · 돌진)', 'E', '강공', '평타(심안 · 돌진)', '공중 평타 → 대시로 캔슬', '공중 평타 4', '평타(심안 · 돌진)', 'E', '평타(심안 · 정복)', '강공(이화의 화신)', '공명 해방', '강공(이화의 화신) (교체)', '반주'],
    tip: '거의 모든 동작에서 교체 캔슬이 되는 퀵스왑 친화 캐릭터입니다. 마지막 강공을 끝까지 쓰고 에코를 넣으면 약 1.4초 길어집니다.' },
  jiyan: { ft: 16, full: true,
    open: ['평소: 공명 스킬(돌진의 창)을 쿨마다 써서 공명 에너지 모으기'],
    loop: ['에코 (버프를 미리 켜 두기)', '변주', '공명 해방(승천하는 청룡 · 결정)', '강공(파진의 창) 1타 → E로 바로 캔슬', 'E', '강공(파진의 창) 1~3타', '강공(파진의 창) 1~3타', 'E', '반주'],
    tip: '공명 해방 지속 시간 내내 필드에 있어야 합니다. 교체 캔슬은 대부분 손해라 하이퍼 캐리 파티가 맞습니다.' },
  carlotta: { ft: 16, full: true,
    loop: ['변주', 'E(폭력 미학)', 'E(눈부시는 현란함)', '공중 평타', '강공(마지막 길) → 공명 해방으로 캔슬', '공명 해방(새로운 트렌드)', '해방 연타(죽음의 징조) ×4', '해방 마무리(피할 수 없는 죽음)', 'E(폭력 미학)', 'E(눈부시는 현란함) (교체 캔슬 가능)', '반주'],
    tip: '공명 해방의 큰 자기 버프가 교체하면 끝나므로 퀵스왑에 약합니다. 강공(마지막 길)은 22초, 해방은 25초 쿨입니다.' },
  xiangli_yao: { ft: 15,
    loop: ['변주', 'E(기본 추론) → 공명 해방으로 바로 캔슬', '공명 해방(사고의 배열)', 'E(하나의 이치)', '공중 공격(해체와 재구성)', 'E(만물의 법칙)', '평타(논리 · 간파) 1~3', 'E(만물의 법칙)', 'E(하나의 이치)', '공중 공격(해체와 재구성)', 'E(만물의 법칙)', '에코 (교체 캔슬)', '반주'],
    tip: '통찰 상태는 24초까지 가지만 큐브 충전 3회를 다 쓰면 끝납니다. 거의 모든 동작이 교체 캔슬 구간이지만, 음림처럼 교체하면 사라지는 반주 버프를 받았을 때는 퀵스왑을 피하세요.' },
  augusta: { ft: 18, full: true,
    loop: ['변주', '강공(백스텝)', '평타(회전 베기)', 'E', '강공(백스텝)', '평타(회전 베기)', '강공 → 공명 해방으로 캔슬', '공명 해방', '강공 → E로 캔슬', 'E 강타 → 도약 → 낙하 (길게 누른 해방으로 캔슬)', '해방 길게 누르기', '평타 ×9', '공명 해방(불멸자의 보우)', '점프 올려치기 (마지막 타에 교체)', '반주'],
    tip: '회로 3회 사이클(대부분 파티 기준)입니다. 반주를 받은 캐릭터는 자기 반주를 쓰기 전까지 교체하면 안 돼서 퀵스왑에 약합니다.' },
  calcharo: { ft: 16,
    loop: ['에코 (미리 사용)', '변주', '공명 해방', '강공(사형 선고) (교체 캔슬 가능)', '평타(사냥꾼의 검술·지옥의 그림자) 1~5', '강공(사형 선고) (교체 캔슬 가능)', '평타(사냥꾼의 검술·지옥의 그림자) 1~5', '강공(사형 선고)', '반주'],
    tip: '강공(사형 선고)은 3번 넣습니다. 교체 캔슬을 하면 몸은 안전하지만 반주 버프를 잃어 딜이 줄어듭니다.' },
  encore: { ft: 15,
    loop: ['에코 (미리 사용)', '변주', '공명 해방', 'E(그늘이·광란)', '평타 1~4', 'E(그늘이·광란)', '평타 1~4', 'E(그늘이·광란)', '강공(그늘이·폭주하는 화염) → 시전 시작하자마자 교체 캔슬', '반주'],
    tip: '해방 위주 파티의 기본 버스트입니다. 퀵스왑 파티에서는 해방 없이 스킬·평타로 협주를 채우는 준비 사이클이 더 낫습니다.' },
  yinlin: { ft: 7,
    loop: ['변주', '평타 4 (교체 캔슬 가능)', 'E(자기장의 포효)', '강공 → E(천둥의 폭발)로 강공 후딜 캔슬', '착지하자마자 공명 해방', '평타 1', '회로 강공(천면 매혹)', '에코 → 교체 캔슬', '반주'],
    tip: '필드 시간이 짧고 대부분 동작에 교체 캔슬이 있습니다. 천둥의 폭발은 교체하면 쿨이 돌기 시작하니 교체 타이밍에 주의하세요.' },
  zhezhi: { ft: 7, full: true,
    loop: ['변주', '평타 1~3', 'E', '강공(구성)', 'E(천재의 붓놀림) → 점프로 캔슬', 'E(천재의 붓놀림) → 공명 해방으로 캔슬', '공명 해방', 'E(궁극·천재의 붓놀림) → 대시 → 에코', '반주'],
    tip: '퀵스왑할 수 있는 구간이 평타 3뿐이라 사이클을 끝까지 돌리는 편이 낫습니다.' },
  luuk: { ft: 17, full: true,
    loop: ['변주', '공중 공격 2·3', 'E(햇무리 참살 · 고리)', '평타(나란히 흐르는 금빛) → 대시로 바로 캔슬', '공중 평타 1', '공중 공격 2·3', 'E(햇무리 참살 · 균열)', '평타(나란히 흐르는 금빛) → 대시로 바로 캔슬', '공중 평타 1', '공중 공격 2·3', 'E(햇무리 참살 · 요광)', '공중 공격(대지를 가르는 판결) → 공명 해방으로 캔슬', '공명 해방', 'E (교체)', '반주'],
    tip: '황금의 법칙 쿨(24초)·해방 쿨(25초)에 맞춰 약 25초마다 돕니다. 변주 후 교체하면 기술이 끊겨 퀵스왑은 거의 불가능합니다. 에코는 보통 생략합니다.' },
  brant: { ft: 8,
    loop: ['변주', '공명 해방(세상 끝까지)', '공중 평타 2', '공중 평타 2 (길게 눌러 끝까지)', '공중 평타 3', 'E(화염 귀멸의 서곡: 갈채 가득)', '반주'],
    tip: '약 8초 사이클로 퀵스왑 없이 회로를 가득 채웁니다. 에코(장송의 용)는 마지막 닻 뒤에 쓰거나 생략합니다.' },
  roccia: { ft: 6,
    loop: ['변주', '평타 4 → 공명 해방으로 캔슬', '공명 해방', 'E → 첫 타 후 대시로 캔슬', '대시', '평타(현실에 비추는 환상) 1~3 → 에코로 캔슬', '에코 (교체)', '반주'],
    tip: '교체 캔슬 여유가 적고, 공중 공격이 끊기면 사이클이 느려집니다.' },
  rover_havoc: { ft: 10,
    loop: ['변주', 'E', '강공(멸음) → 다크 서지 진입', 'E(격살) (교체 캔슬 가능)', '공명 해방', '에코 → 바로 교체 캔슬', '반주'],
    tip: '가장 짧은 버스트 콤보입니다. 다른 딜러가 있는 퀵스왑 파티에 맞고, 해방 위주로 길게 쓰면 필드 시간이 늘어납니다. 5세트(인멸)를 유지하려면 틈틈이 평타를 넣으세요.' },
  lingyang: { ft: 16, full: true,
    loop: ['에코 (미리 사용)', '변주(출동·사자의 기상)', '공명 해방(돌진·사자의 질주)', '강공 → 회로 진입(공중)', '평타 1 → E → 평타 2 → E (반복)', '평타 1 → 회로 발차기 → 공중 꼬리 치기', '반주'],
    tip: '해방은 14초, 회로 상태는 최대 10초까지 늘어납니다. 중간에 나가면 손해가 커서 하이퍼 캐리 파티용입니다.' },
  jianxin: { ft: 8, full: true,
    loop: ['변주', '평타 (5세트·협주 유지)', 'E (쿨마다)', '공명 해방 (협주 채우기·몰이)', '(선택) 회로 채널링 약 6초 → 실드', '에코', '반주 (메인 딜러의 해방 버스트에 맞추기)'],
    tip: '정해진 사이클보다 우선순위로 돕니다. 반주(해방 피해 38%)는 교체하면 끝나므로 해방을 많이 쓰는 딜러에게 넘기세요.' },
  sanhua: { ft: 3,
    loop: ['변주', '공명 해방', 'E', '강공(폭발)', '강공(폭발)', '에코(왜가리) → 교체 캔슬', '반주'],
    tip: '게임에서 가장 빠른 협주 사이클 중 하나입니다. 평타 위주 변형: 변주 → 평타 3~5 → 해방 → E → 강공 → 반주.' },
  mortefi: { ft: 4,
    loop: ['변주', 'E(분노의 연주)', 'E(분노의 후가)', '평타 1~4', 'E(분노의 후가)', '공명 해방', '에코(왜가리) → 교체 캔슬', '반주'],
    tip: '가장 빠르고 쉬운 협주 사이클 중 하나입니다. 해방(드래곤의 광상곡)과 반주를 다음 딜러 직전에 함께 넘기세요.' },
  taoqi: { ft: 6,
    open: ['평타 1~3으로 미리 협주 채우기 (디스코드 무기면 생략 가능)'],
    loop: ['변주', '반격 1~3 (타이밍 막기)', '공명 해방', '평타 1~4', 'E', '반주'],
    tip: '정해진 순서로 도는 고정 사이클입니다. 월광 세트 + 왜가리 에코면 반주 직전에 교체 캔슬합니다.' },
  lumi: { ft: 8,
    loop: ['변주', '공명 해방', 'E(덮치기) (교체 캔슬 후 바로 복귀 가능)', '빨간 불 평타 1~3', 'E(후퇴)', '노란 불 평타', '대시 채널링(강한 빛 ×6)', 'E(덮치기)', '에코 → 교체 캔슬', '반주'],
    tip: '하이브리드치고 사이클이 긴 편입니다. 교체 후 바로 복귀하면 짧아지지만 손이 빨라야 합니다.' },
  danjin: { ft: 7,
    loop: ['변주', 'E(주식) 1·2', '공명 해방', 'E(적화)', '평타 2·3', 'E(신멸) 1~3', '강공(혼란 → 분락)', '에코 → 교체 캔슬', '반주'],
    tip: '하이브리드(빠른 협주) 사이클입니다. 딜러로 쓸 때는 주홍빛 → 평타 → 진홍 맥동을 한 번 더 넣고 강공을 끝까지 충전합니다.' },
  aalto: { ft: 5,
    open: ['다른 캐릭터 사이클 중에 E(안개 분신)를 미리 써서 쿨 돌리기'],
    loop: ['변주', '공명 해방(안개속의 꽃구경)', 'E(안개 분신)', '평타 1~5', '에코', '반주'],
    tip: '필드 시간을 최소로 쓰는 서브 딜러입니다. 해방의 문을 통과한 공격은 공격력이 오릅니다.' },
  youhu: { ft: 6.5,
    loop: ['변주', '감정(바로 캔슬)', '공명 해방', '감정', '평타 1~4', 'E', '감정', '반주'],
    tip: '약 6.5초 사이클이 계속 반복됩니다. 반주(협동 공격 피해 100%)는 협동 공격이 많은 딜러에게 넘기세요.' },
  baizhi: { ft: 6.5,
    loop: ['변주', '평타 1~4', 'E (교체해서 메인 딜러가 천뢰 줍기)', '공명 해방 (변주 직후 동작을 캔슬하도록 늦게)', '평타 1~3', '에코', '반주'],
    tip: '필드 시간 약 6.5초(무기 별의 교향곡이면 약 5.5초)입니다. 반주 치료를 받는 동안 전체 피해 15% 부스트가 붙습니다.' },
  yuanwu: { ft: 3,
    loop: ['에코', '변주 (있으면)', 'E(뇌전의 쐐기 설치)', '공명 해방 (쐐기 폭발)', '회로 E', 'E(쐐기 다시 설치)', '반주 (있으면)'],
    tip: '정해진 사이클 없이 쐐기를 깔고 바로 나가는 캐릭터입니다. 쐐기는 12초 유지, 3초마다 다시 깔 수 있습니다.' },
  yangyang: { ft: 4,
    loop: ['변주', '평타 3', '강공', '강공(바람의 찬송)', '공명 해방 (후딜 캔슬)', '평타 1', '강공', '강공(바람의 찬송)', 'E (후딜 캔슬)', '점프', '공중 공격(날개의 뜻)', '반주'],
    tip: '게임에서 가장 짧은 사이클 중 하나입니다. 반주가 다음 캐릭터의 공명 에너지를 채워 줘서 퀵스왑에 잘 맞습니다.' },
  chixia: { ft: 12,
    open: ['평소: 공명 스킬을 쿨마다 써서 회로 게이지 모으기 (1회분은 남겨 두기, 쓰고 바로 교체 캔슬)'],
    loop: ['에코 (미리 사용)', '거리 벌리고 변주(당당히 등장)', 'E 길게 → 회로 채널링(총알 30발) → 평타로 펑펑', '공명 해방 (채널링 공격력 버프 중)', 'E 길게 → 회로 채널링 → 펑펑', '반주'],
    tip: '회로 채널링 한 번에 약 4초가 걸려 필드 시간이 깁니다. 장리처럼 교체 캔슬이 많은 파트너와 듀얼 딜러로 씁니다.' },
  suoming: { modes: {
    unison: { ft: 8, src: '게임 스킬 설명 · 게임톡 띵조해 쇄명 가이드 · buffbuff 쇄명 빌드',
      loop: ['변주 (섬광 파열 → 깊은 염원 진입)', '펼친 우산 평타 1~4', 'E (찰나의 붉은 섬광)', '평타 길게 (회전 뇌격 1·2)', '그릇된 집착 800 → E (불굴의 염원)', '평타 길게 (새겨진 염원)', '공명 해방 (합일 획득)', '교체 → 합일: 쇄명 반주 + 다음 캐릭터 변주 동시 발동'],
      tip: '여우의 별자리와는 32121(서포터 → 쇄명 → 여우의 별자리 → 쇄명 → 여우의 별자리) 순서로 돌립니다. 반주 후 8초 동안 파티원이 공격할 때마다 벼락의 흔적(협동 공격, 최대 6회)이 떨어집니다. 사이클 도중 교체하면 합일과 부스트가 끊겨 퀵스왑은 하지 않습니다.' },
    carry: { ft: 15, full: true, src: '인벤 팟벤 「전도 메인딜 쇄명 종합 가이드」',
      loop: ['변주 (섬광 파열)', '공명 해방 (합일 · 그릇된 집착 200 획득)', 'E (허점 파괴: 합일 소모 → 금쇄계주 12초)', '펼친 우산 평타 ×5 (배율 +100%, 크리티컬 피해 +100%)', '강화 E (불굴의 염원)', '평타 길게 (새겨진 염원)', '반주'],
      tip: '해방 직후 E로 합일을 소모해 금쇄계주를 켭니다. 이때는 다음 캐릭터에게 주는 함께한 약속(전도 피해 보너스)과 벼락의 흔적이 없습니다.' } } },
};

/* 팀 조합별 운영 메모 */
const TEAM_ROT = [
  { has: ['hiyuki', 'suisui'], t: '고급 운영(퀵스왑): 수수 평타 1~3 → 히유키 평타 2·3·E·평타 3 → 수수 강화 E → 히유키 강공 → 수수 사이클. 수수의 공격력 50% 버프(산안개)는 변주 후 14초만 유지됩니다.' },
  { has: ['hsin', 'rover_electro', 'buling'], src: '아카라이브 명조 채널 「여전복」 사이클 글 (3.7)',
    t: '순서는 복링 → 방랑자·전도 → 여우의 별자리입니다. 점선 칸(퀵스왑)은 복링 사이클 도중 방랑자를 잠깐 꺼내 전류를 미리 쌓는 구간이고, 퀵스왑은 방랑자·복링 사이에서만 합니다. 한 바퀴는 3돌 약 28~30초, 명함 약 31~32초입니다.',
    seq: {
      open: [['buling', '평평평평', '평타 4회'], ['rover_electro', '평평평', '평타 3회', 1], ['buling', 'E평', 'E → 평타'], ['buling', '강공강공', '강공 2회'], ['rover_electro', 'E평', 'E → 평타', 1], ['buling', '에코'], ['buling', '해방'], ['buling', '복링 반주'],
        ['rover_electro', '전랑자 변주'], ['rover_electro', '평평평', '평타 3회'], ['rover_electro', '해방'], ['rover_electro', '에코'], ['rover_electro', '강화스킬', '과부하'], ['rover_electro', '전랑자 반주'], ['hsin', '여별 변주', '→ 여우의 별자리 사이클']],
      loop: [['buling', '평평평평', '평타 4회'], ['rover_electro', '평평평', '평타 3회', 1], ['buling', 'E평', 'E → 평타'], ['buling', '강공강공', '강공 2회'], ['buling', '에코'], ['buling', '해방'], ['buling', '복링 반주'],
        ['rover_electro', '전랑자 변주'], ['rover_electro', '평평평', '평타 3회'], ['rover_electro', 'E평', 'E → 평타'], ['rover_electro', '해방'], ['rover_electro', '에코'], ['rover_electro', '강화스킬', '과부하'], ['rover_electro', '전랑자 반주'], ['hsin', '여별 변주', '→ 여우의 별자리 사이클']] } },
  { has: ['hsin', 'suoming'], t: '서포터 → 쇄명 → 여우의 별자리 → 쇄명 → 여우의 별자리(1-2-3-2-3). 쇄명이 공명 해방으로 합일을 얻은 뒤 교체하면 협주 에너지 없이 반주와 변주가 동시에 터집니다.' },
  { has: ['hsin', 'jinhsi'], t: '금희가 강화 E로 합일을 얻은 뒤 교체하면 여우의 별자리가 합일 변주로 들어옵니다.' },
  { has: ['aemeath', 'denia', 'lupa'], t: '데니아가 먼저 나와 루파에게 반주, 루파가 에이메스에게 반주합니다.' },
  { has: ['phrolova', 'cantarella'], t: '칸타렐라 반주가 플로로에게 가도록 루실라 등 다른 버퍼는 3번째에 둡니다.' }
];

/* ---------- 에코 세트 조합 (5세트 / 3+2 / 1+2+2) ---------- */
const EL_SET2 = { glacio: 1, fusion: 2, electro: 3, aero: 4, spectro: 5, havoc: 6 };
function setPieces(id) { const s = RAW_SETS[id]; return s ? Math.max(...s.e.map(e => e[0])) : 5; }
function has2pc(id) { const s = RAW_SETS[id]; return !!(s && s.e.some(e => e[0] === 2)); }
function set2Count(id) { const p = setPieces(id); return p === 1 ? 2 : p === 3 ? 1 : 0; }
// 2세트 효과 원문 → 계산값 (치료·공명 효율·HP 같은 비전투 효과는 제외)
const _s2cache = {};
function set2Buffs(id) {
  if (_s2cache[id]) return _s2cache[id];
  const e = (RAW_SETS[id] || { e: [] }).e.find(x => x[0] === 2); const out = [];
  if (e) {
    const t = e[1]; let m;
    if ((m = t.match(/(응결|용융|전도|기류|회절|인멸) 피해가 (\d+)% 증가/))) out.push({ s: 'bonus', v: +m[2], el: EL_KO[m[1]] });
    else if ((m = t.match(/공격력이 (\d+)% 증가/))) out.push({ s: 'atk', v: +m[1] });
    else if ((m = t.match(/(공명 스킬|공명 해방|일반 공격|강공격) 피해가 (\d+)% 증가/))) out.push({ s: 'bonus', v: +m[2], dt: { '공명 스킬': 's', '공명 해방': 'l', '일반 공격': 'n', '강공격': 'h' }[m[1]] });
  }
  return (_s2cache[id] = out);
}
function defaultSets2(c, setId) {
  const n = set2Count(setId); if (!n) return [];
  if (+setId === +c.set && c.set2) return c.set2.slice(0, n);
  const base = [EL_SET2[c.el], 9];
  return base.slice(0, n);
}

/* =====================================================================
   ENGINE — 데미지 계산식
   피해 = 스킬 배율 × 공격력(HP 비례 캐릭터는 HP) × (1 + 피해 보너스) × (1 + 피해 심화) × 크리 기대값
          × 방어 계수 × 저항 계수 × (1 + 최종 피해)
   · 방어 계수 = 1520 / (1520 + 적 방어력 × (1 − 방어 무시))   (내 레벨 90: 800 + 8×90 = 1520, 적 방어력 = 8×적 레벨 + 792)
   · 저항 계수 = 저항 < 0: 1 − 저항/2 · 0~80%: 1 − 저항 · 80% 이상: 1 / (1 + 5×저항)
   · 크리 기대값 = 1 + min(크리티컬, 100%) × (크리티컬 피해 − 1)
   · 같은 이름의 효과(소나타·무기·합일 버프 등)는 여러 명이 줘도 한 번만, 가장 큰 값으로
   · 이상 효과 피해 = 이상 효과 배율(레벨 기반) × (1 + 이상 효과 보너스) × (1 + 이상 효과·전체 피해 부스트) × 방어 × 저항 × (1 + 최종 피해)
     — 크리티컬 없음(크리티컬을 켜 주는 체인 효과 제외), 공격력·속성 피해 보너스 무관
   · 피해 보너스(○○ 피해 증가)끼리는 합연산, 심화(부스트)끼리도 합연산,
     보너스·심화·최종 피해 구간끼리는 곱연산
   · 반주(to:next)는 로테이션 순서 서포터 → 서브 → 메인 → 서포터 를 따름
   ===================================================================== */

// 에코 완성도 추정치 = 에코 5개(4-3-3-1-1: 크리티컬 · 속성 · 속성 · 공격력 · 공격력)가 주는 합계.
// 캐릭터 기본 크리티컬 5% / 150%, Lv.90 기본 공격력, 공명 노드 보너스는 캐릭터별 게임 데이터로 따로 더합니다(에코 옵션 입력과 같은 기준).
const ECHO_PRESETS = {
  end:   { n: '종결', cr: 55, cd: 75, elem: 60, atk: 55, flat: 400 },
  std:   { n: '준종결', cr: 45, cd: 50, elem: 60, atk: 50, flat: 380 },
  start: { n: '입문', cr: 30, cd: 20, elem: 30, atk: 40, flat: 350 }
};
const MIN_ROT = 25;
const DEFAULT_SETTINGS = { preset: 'std', enemyLv: 100, baseRes: 10, rot: 0, weapon: 'sig', upcoming: false, parties: 3, towerMode: true, presetBias: 8, tierBias: 100 };

// --- 캐릭터 인덱스 구성 ---
const CH = {};
CHARS.forEach(c => {
  const r = RAW_ROLES[c.rid] || {};
  c.name = c.name || r.n || c.id;
  c.q = c.q || r.q || 5;
  c.el = c.el || EL_BY_ID[r.el];
  c.wt = c.wt || r.wt;
  c.icon = c.icon !== undefined ? c.icon : (r.icon || '');
  c.b = c.b || [];
  CH[c.id] = c;
});
const NAME_FIX = { 'rover_electro': '방랑자·전도', 'rover_aero': '방랑자·기류', 'rover_spectro': '방랑자·회절', 'rover_havoc': '방랑자·인멸', 'luuk': '루크·헤르센', 'xuanling': '양양·현령' };
Object.entries(NAME_FIX).forEach(([k, v]) => { if (CH[k]) CH[k].name = v; });
CHARS.forEach(c => { c.outro = RAW_OUTRO[c.name.replace('·', ' · ')] || RAW_OUTRO[c.name] || (c.id.startsWith('rover_') ? RAW_OUTRO[RAW_ROLES[c.rid] ? RAW_ROLES[c.rid].n : ''] : null); });
if (CH.rover_spectro) CH.rover_spectro.outro = RAW_OUTRO['방랑자'];

function baseAtkOf(c) { return c.q === 5 ? (c.role === 'sup' ? 400 : 425) : 360; }
function rotOf(c, modeKey) { const r = ROT[c.id]; if (!r) return null; return r.modes ? { ...r, ...(r.modes[modeKey] || Object.values(r.modes)[0]) } : r; }
function teamRot(c, modeKey, ids) {
  const r = rotOf(c, modeKey); if (!r || !r.withTeam || !ids) return r;
  const k = Object.keys(r.withTeam).find(id => ids.includes(id));
  return k ? { ...r, ...r.withTeam[k], teamKey: k } : r;
}
function fieldTime(c, modeKey, role) { const r = rotOf(c, modeKey); return (r && r.ft) || (role === 'main' ? 15 : role === 'sub' ? 6 : 5); }
function weaponOf(id) { return RAW_WEAPONS[id] || null; }
function weaponsForType(wt) {
  return Object.entries(RAW_WEAPONS).filter(([, w]) => w.wt === wt && w.q >= 4)
    .sort((a, b) => b[1].q - a[1].q || a[0] - b[0]).map(([id, w]) => ({ id: +id, ...w }));
}
function parseGenericWeapon(w) {
  const out = []; if (!w) return out;
  const first = w.d.split('.')[0];
  let m = first.match(/공격력이 ([\d.]+)% 증가/); if (m) out.push({ s: 'atk', v: +m[1] });
  m = first.match(/전체 속성 피해 보너스가 ([\d.]+)%/); if (m) out.push({ s: 'bonus', v: +m[1] });
  m = first.match(/^HP가 ([\d.]+)% 증가/); if (m) out.push({ s: 'hp', v: +m[1] });
  return out;
}
function weaponBuffs(id) { return WMOD[id] || parseGenericWeapon(weaponOf(id)); }

// --- 스킬 레벨 ---
// 게임 데이터(damage.json RateLv) 기준 레벨별 배율 곡선: 모든 스킬이 Lv10 대비 같은 비율로 오릅니다.
const SK_CURVE = [0.503, 0.544, 0.5855, 0.643, 0.6845, 0.732, 0.798, 0.864, 0.93, 1];
const SK_TREES = [['a', '일반 공격'], ['s', '공명 스킬'], ['f', '공명 회로'], ['l', '공명 해방'], ['i', '변주 스킬']];
const SK_DEF_TREE = { n: 'a', h: 'a', s: 's', l: 'l', i: 'i' };
function skillLevels(o) { const sl = (o && o.sl) || {}; const r = {}; SK_TREES.forEach(([k]) => { r[k] = Math.min(10, Math.max(1, +sl[k] || 10)); }); return r; }
// 해당 피해 유형이 어느 스킬 트리에서 나오는지(배율 합 비중)를 보고 레벨 배율을 섞습니다.
// 반주(레벨 없음)·이상 효과·에코 장비 피해는 스킬 레벨과 무관. 협동 공격 등 유형이 애매하면 캐릭터 전체 배율 비중을 씀
function skillLvFactor(m, dt) {
  if (dt === 'o' || dt === 'st') return 1;
  const own = (RAW_SKLV[m.c.rid]) || null;
  const fr = (own && own[dt]) || (dt === 'e' ? null : (SK_DEF_TREE[dt] ? { [SK_DEF_TREE[dt]]: 1 } : (own && own.all) || null));
  if (!fr) return 1;
  let num = 0, den = 0;
  Object.entries(fr).forEach(([k, w]) => { num += w * (k === 'x' ? 1 : SK_CURVE[m.sl[k] - 1]); den += w; });
  return den ? num / den : 1;
}

// --- 구성원 해석 (모드·무기·세트 적용) ---
/* ---------- 에코 옵션 (인증 사용자 전용) ----------
   주옵션은 5성 +25 기준 게임 데이터(ECHO_MAIN), 부옵션은 단계별 수치. 캐릭터 기본 공격력·크리티컬과
   공명 노드 보너스(RAW_BASE, RAW_NODE)는 게임 데이터 Lv.90 값을 씁니다. */
const ECHO_SUB = {
  cr: ['크리티컬', [6.3, 6.9, 7.5, 8.1, 8.7, 9.3, 9.9, 10.5], '%'], cd: ['크리티컬 피해', [12.6, 13.8, 15, 16.2, 17.4, 18.6, 19.8, 21], '%'],
  atkP: ['공격력%', [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6], '%'], atk: ['공격력(고정)', [30, 40, 50, 60], ''],
  n: ['일반 공격 피해 보너스', [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6], '%'], h: ['강공격 피해 보너스', [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6], '%'],
  s: ['공명 스킬 피해 보너스', [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6], '%'], l: ['공명 해방 피해 보너스', [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6], '%'],
  er: ['공명 효율', [6.8, 7.6, 8.4, 9.2, 10, 10.8, 11.6, 12.4], '%'], hpP: ['HP%', [6.4, 7.1, 7.9, 8.6, 9.4, 10.1, 10.9, 11.6], '%'], hp: ['HP(고정)', [320, 360, 390, 430, 470, 510, 540, 580], ''],
  defP: ['방어력%', [8.1, 9, 10, 10.9, 11.8, 12.8, 13.8, 14.7], '%'], def: ['방어력(고정)', [40, 50, 60, 70], '']
};
const ECHO_MAIN_N = { cr: '크리티컬', cd: '크리티컬 피해', atkP: '공격력%', hpP: 'HP%', defP: '방어력%', heal: '치료 효과 보너스', el: '속성 피해 보너스', er: '공명 효율' };
const ECHO_COSTS = [4, 3, 1];
const ECHO_DEFAULT = (sc = 'atk') => { const m1 = sc === 'hp' ? 'hpP' : sc === 'def' ? 'defP' : 'atkP'; return { on: false, e: [{ c: 4, m: 'cr', sub: [] }, { c: 3, m: 'el', sub: [] }, { c: 3, m: 'el', sub: [] }, { c: 1, m: m1, sub: [] }, { c: 1, m: m1, sub: [] }] }; };
function subLabel(k) { return ECHO_SUB[k] ? ECHO_SUB[k][0] : k; }
function echoSum(echo) {
  const t = { cost: 0, n5: 0 }; const add = (k, v) => { if (k && v) t[k] = +((t[k] || 0) + v).toFixed(2); };
  ((echo && echo.e) || []).slice(0, 5).forEach(x => {
    if (!x || !ECHO_MAIN[x.c]) return; const M = ECHO_MAIN[x.c];
    t.cost += +x.c; t.n5++;
    if (M[x.m] !== undefined) add(x.m, M[x.m]);
    if (M._sec) add(M._sec[0], M._sec[1]);
    const seen = new Set();
    (x.sub || []).slice(0, 5).forEach(([k, v]) => { const d = ECHO_SUB[k]; if (!d || seen.has(k)) return; seen.add(k); const max = d[1][d[1].length - 1]; add(k, Math.max(0, Math.min(+v || 0, max))); });
  });
  return t;
}
function echoStats(c, echo) {
  const t = echoSum(echo); const nd = (RAW_NODE[c.rid]) || {}; const bs = (RAW_BASE[c.rid]) || null;
  return { cr: (bs ? bs[3] : 5) + (t.cr || 0) + (nd.cr || 0), cd: (bs ? bs[4] : 150) + (t.cd || 0) + (nd.cd || 0), elem: (t.el || 0) + (nd.el || 0),
    atk: (t.atkP || 0) + (nd.atk || 0), flat: t.atk || 0, hpP: (t.hpP || 0) + (nd.hp || 0), hpFlat: t.hp || 0, defP: (t.defP || 0) + (nd.def || 0), defFlat: t.def || 0,
    dt: { n: t.n || 0, h: t.h || 0, s: t.s || 0, l: t.l || 0 }, er: 100 + (t.er || 0),
    baseAtk: bs ? bs[0] : null, tot: t, node: nd };
}
/* 공격 기준 스탯: 대부분 공격력, 카르티시아·경연처럼 HP에 비례해 피해를 주는 캐릭터는 HP.
   HP 비례 캐릭터는 'HP → 공격력 환산값'으로 바꿔 같은 식에 넣습니다. 환산 비율은 준종결 에코 + 전용 무기일 때
   5성 메인 딜러의 준종결 공격력(약 2,080)과 같아지도록 캐릭터마다 맞춥니다. 공격력% 버프는 이 캐릭터들에게 효과가 없습니다. */
const SCALE_FIX = { cartethyia: 'hp', jingran: 'hp' };
const ATK_REF = (462 + 587) * (1 + (50 + 12) / 100) + 380; // 5성 메인 딜러 기본 공격력 + 5성 무기, 준종결
// 이상 효과 피해 기준값: 내 레벨(90)로 정해지는 "이상 효과 피해 배율"을 같은 식에 넣기 위한 환산값.
// 준종결 5성 메인 딜러의 일반 피해(공격력 × (1 + 속성 피해 70%) × 크리 기대값 약 1.82)와 같은 규모로 맞춤
const ST_BASE = Math.round(ATK_REF * 1.70 * 1.82);
function scaleOf(c) {
  if (!c) return 'atk'; if (c.scale) return c.scale; if (SCALE_FIX[c.id]) return SCALE_FIX[c.id];
  const nd = (RAW_NODE[c.rid]) || c.node || {};
  if (c.auto && c.role !== 'sup' && nd.hp) return 'hp';
  return 'atk';
}
const _scaleK = {};
function scaleK(c, sc) {
  const key = c.id + sc; if (_scaleK[key]) return _scaleK[key];
  const bs = (RAW_BASE[c.rid]) || null; const baseS = bs ? (sc === 'hp' ? bs[1] : bs[2]) : (sc === 'hp' ? 12000 : 1200);
  const E = presetStats(c, ECHO_PRESETS.std, sc); const w = weaponOf(c.w);
  const wP = w && w.sub[0] === sc ? w.sub[1] : 0;
  const ref = baseS * (1 + (E[sc + 'P'] + wP) / 100) + E[sc + 'Flat'];
  return (_scaleK[key] = ref > 0 ? ATK_REF / ref : 0.1);
}
function presetStats(c, P, sc) {
  const nd = (RAW_NODE[c.rid]) || c.node || {}; const bs = (RAW_BASE[c.rid]) || null;
  // HP·방어력 비례 캐릭터는 1코스트 주옵션이 HP%(22.8)·방어력%(18)이고 부옵션도 그 스탯으로 본다
  const subP = P.atk - 36, subF = P.flat - 350;
  return { cr: (bs ? bs[3] : 5) + P.cr + (nd.cr || 0), cd: (bs ? bs[4] : 150) + P.cd + (nd.cd || 0), elem: P.elem + (nd.el || 0), atk: P.atk + (nd.atk || 0), flat: P.flat,
    hpP: 45.6 + subP + (nd.hp || 0), hpFlat: 4560 + subF * 14, defP: 36 + subP * 1.25 + (nd.def || 0), defFlat: subF * 1.2,
    dt: null, er: 100, baseAtk: bs ? bs[0] : null, preset: true };
}
function resolveMember(id, modeKey, ov, settings) {
  const c = CH[id]; if (!c) return null;
  const mode = c.modes ? c.modes[modeKey] : null;
  const o = ov[id] || {};
  const weaponId = o.w || (settings.weapon === 'sig' ? c.w : c.w4);
  const wq = (RAW_WEAPONS[weaponId] || {}).q || 4;
  const chain = o.c ?? (c.q === 4 ? 6 : 0);
  const refine = o.r ?? (wq === 5 ? 1 : 5);
  // 공명 체인 효과
  const chainB = [], mv = {}; let rotMul = 1, ftDelta = 0;
  {
    const eff = chainEffects(c);
    for (let i = 1; i <= chain; i++) (eff[i] || []).forEach(b => {
      if (b.mode && b.mode !== modeKey) return;
      if (b.s === 'mv') mv[b.dt] = (mv[b.dt] || 0) + b.v;
      else if (b.s === 'rot') rotMul = Math.min(rotMul, b.v);
      else if (b.s === 'ft') ftDelta += b.v;
      else chainB.push({ ...b, chainNode: i });
    });
  }
  const setId = o.s || (mode && mode.set) || c.set;
  const sets2 = (o.s2 && o.s && +o.s === +setId) ? o.s2.slice(0, set2Count(setId)) : defaultSets2(c, setId);
  const ap = new Set([...(c.ap || []), ...(mode ? mode.ap || [] : [])]);
  return {
    c, id, modeKey, mode, el: c.el, role: (mode && mode.role) || c.role,
    pw: c.pw * ((mode && mode.pwMul) || 1), p: (mode && mode.p) || c.p || { n: 100 },
    ap, b: ((mode ? mode.b : c.b) || []).concat(chainB), weaponId, setId, sets2, chain, refine, mv, rotMul,
    sl: skillLevels(o), // 스킬 레벨(입력 없으면 모두 10)
    st: (o.st && o.st.on) ? o.st : null, // 속성 화면 스탯 입력
    ech: (!(o.st && o.st.on) && o.echo && o.echo.on) ? echoStats(c, o.echo) : null, // 에코 옵션 입력
    ft: Math.max(3, fieldTime(c, modeKey, (mode && mode.role) || c.role) + ftDelta)
  };
}

function capsMatch(member, req) {
  if (!req) return true;
  const arr = Array.isArray(req) ? req : [req];
  return arr.some(x => member.ap.has(x));
}

// 버프 하나가 (owner → recipient)에 적용되는지
function buffApplies(buff, owner, recipient, team, order) {
  const to = buff.to || 'self';
  if (to === 'self' && recipient !== owner) return false;
  if (to === 'others' && recipient === owner) return false;
  if (to === 'next') { if (order.next.get(owner) !== recipient) return false; }
  if (buff.req && !capsMatch(recipient, buff.req)) return false;
  if (buff.reqNot && capsMatch(recipient, buff.reqNot)) return false;
  if (buff.treq && !team.some(m => capsMatch(m, buff.treq))) return false;
  if (buff.treqOther && !team.some(m => m !== owner && capsMatch(m, buff.treqOther))) return false;
  if (buff.wreq && !capsMatch(owner, buff.wreq)) return false;
  if (buff.withChar && !team.some(m => m.id === buff.withChar)) return false;
  if (buff.wielder && owner.id !== buff.wielder) return false;
  if (buff.role === 'main' && owner.role !== 'main') return false;
  if (buff.role === 'notmain' && owner.role === 'main') return false;
  return true;
}

function rotationOrder(team, ord = 0) {
  // team: [main, sub, sup]
  // ord 0: 서포터 → 서브 → 메인 (서브의 반주가 메인에게)
  // ord 1: 서브 → 서포터 → 메인 (서포터의 반주가 메인에게)
  const next = new Map();
  const [m, s, p] = team;
  const seq = (ord === 1 ? [s, p, m] : [p, s, m]).filter(Boolean);
  for (let i = 0; i < seq.length; i++) next.set(seq[i], seq[(i + 1) % seq.length] === seq[i] ? null : seq[(i + 1) % seq.length]);
  return { next };
}

// 게임 '속성' 화면에 이미 들어가 있는 상시 효과인지 (내 스탯 입력 시 중복 계산 방지)
const isPlainSelf = b => ['atk', 'bonus', 'cr', 'cd', 'hp', 'def'].includes(b.s) && !b.el && !b.dt && !b.req && !b.treq && !b.wreq && !b.treqOther && !b.withChar && (b.to || 'self') === 'self' && b.up === undefined && !b.cond;
function collectBuffs(team) {
  const list = [];
  team.forEach(owner => {
    if (!owner) return;
    owner.b.forEach(b => list.push({ ...b, owner, kind: b.chainNode ? '공명 체인' : '캐릭터', panel: !!b.chainNode && isPlainSelf(b) }));
    const wb = weaponBuffs(owner.weaponId);
    const wn = weaponOf(owner.weaponId);
    const rk = (W_REFINE[owner.weaponId] || [1, 1.25, 1.5, 1.75, 2])[(owner.refine || 1) - 1] || 1;
    wb.forEach((b, i) => (b.mode && b.mode !== owner.modeKey) ? null : list.push({ ...b, v: b.v * rk, owner, kind: '무기', panel: i === 0 && isPlainSelf(b), src: (b.src || (wn ? wn.n : '무기')) + (owner.refine > 1 ? ` R${owner.refine}` : ''),
      uniq: b.uniq || ((b.to || 'self') !== 'self' ? `w${owner.weaponId}#${i}` : undefined) })); // 같은 무기의 파티 버프는 중첩 불가
    if (wn) list.push({ s: wn.sub[0], v: wn.sub[1], owner, kind: '무기', src: wn.n + ' 부옵션', base: true, panel: true });
    const sm = SMOD[owner.setId];
    const sn = RAW_SETS[owner.setId];
    if (sm) {
      sm.b.forEach((b, i) => list.push({ ...b, owner, kind: '소나타', src: b.src || (sn ? sn.n : ''), panel: b.el === '*',
        uniq: b.uniq || ((b.to || 'self') !== 'self' ? `s${owner.setId}#${i}` : undefined) })); // 같은 소나타의 파티 버프는 중첩 불가
      // 2세트 효과(속성 피해 10%, 공격력 10% 등)는 화면 스탯에 포함 → 내 스탯 사용 시 빼 줌
      if (!sm.three && !sm.one) set2Buffs(owner.setId).forEach(b => list.push({ ...b, v: -b.v, owner, kind: '소나타', src: '2세트(속성 화면에 포함)', panelAdj: true }));
    }
    // 3+2, 1+2+2 구성의 보조 2세트 (상시 효과라 속성 화면에 포함됨)
    (owner.sets2 || []).forEach(sid => set2Buffs(sid).forEach(b => list.push({ ...b, owner, kind: '소나타', src: `${(RAW_SETS[sid] || {}).n || ''} 2세트`, panel: true, s2: true })));
  });
  return list;
}
// 내 스탯 입력창에 보여 줄 '추정 속성 화면 값'
function panelEstimate(id, settings, ov) {
  const c = CH[id]; const m = resolveMember(id, c.modes ? Object.keys(c.modes)[0] : null, ov, settings);
  const P = ECHO_PRESETS[settings.preset] || ECHO_PRESETS.std;
  const own = collectBuffs([m]).filter(b => b.panel);
  const sum = s => own.filter(b => b.s === s && (!b.el || b.el === c.el || b.el === '*') && !b.dt).reduce((a, b) => a + b.v, 0);
  const E = m.ech || presetStats(c, P);
  const w = weaponOf(m.weaponId); const base = (E.baseAtk || baseAtkOf(c)) + (w ? w.atk : 300);
  const sm = SMOD[m.setId];
  const s2 = (sm && !sm.three && !sm.one) ? set2Buffs(m.setId) : [];
  const s2v = (st, el) => s2.filter(b => b.s === st && !b.dt && (!el || !b.el || b.el === el)).reduce((a, b) => a + b.v, 0);
  // 속성 화면의 공격 유형 피해 보너스(일반·강공·스킬·해방) = 에코 부옵션 + 2세트(예: 공명 스킬 피해 12%)
  const dtp = {}; ['n', 'h', 's', 'l'].forEach(k => { const v = ((E.dt && E.dt[k]) || 0) + s2.filter(b => b.s === 'bonus' && b.dt === k).reduce((a, b) => a + b.v, 0); if (v) dtp[k] = +v.toFixed(1); });
  const bs = (RAW_BASE[c.rid]) || null; const sc = scaleOf(c);
  const res = { atk: Math.round(base * (1 + (E.atk + sum('atk') + s2v('atk')) / 100) + E.flat), cr: +(E.cr + sum('cr')).toFixed(1), cd: +(E.cd + sum('cd')).toFixed(1),
    el: +(E.elem + sum('bonus') + s2v('bonus', c.el)).toFixed(1), er: E.er, dt: E.dt, dtp, scale: sc };
  if (sc !== 'atk' && bs) res[sc] = Math.round((sc === 'hp' ? bs[1] : bs[2]) * (1 + (E[sc + 'P'] + sum(sc)) / 100) + E[sc + 'Flat']);
  return res;
}

function matchFilter(b, el, dt, ownerEl) {
  if (b.el) { const want = b.el === '*' ? ownerEl : b.el; if (want !== el) return false; }
  if (b.dt && b.dt !== dt) return false;
  return true;
}

/* 한 파티 계산. ids=[메인, 서브, 서포터], modes={id:modeKey}, zone=탑 구역키 or null */
function calcTeam(ids, ctx) {
  const { settings, ov, modes = {}, zone = null, season = null } = ctx;
  const P = ECHO_PRESETS[settings.preset] || ECHO_PRESETS.std;
  const team = ids.map(id => id ? resolveMember(id, modes[id] || (CH[id] && CH[id].modes ? Object.keys(CH[id].modes)[0] : null), ov, settings) : null);
  const members = team.filter(Boolean);
  team.forEach((m, i) => { if (m && i > 0 && m.role === 'main') m.pw *= 0.4; }); // 메인 딜러를 서브 칸에 넣으면 필드 시간이 줄어듦
  const order = rotationOrder(team, ctx.ord || 0);
  const buffs = collectBuffs(team);
  const tz = ctx.tz || ((zone && season) ? getTowerMod(season, zone) : null); // ctx.tz: 탑 밖 콘텐츠(폐허 등)의 저항 · 버프
  const zoneBuffs = tz ? tz.b.map(b => ({ ...b, to: 'team', kind: '탑', src: '탑 버프' })) : [];

  // 모드 유효성(합일 모드는 다른 합일 캐릭터 필요)
  let invalid = false;
  members.forEach(m => { if (m.mode && m.mode.needOther && !members.some(o => o !== m && o.ap.has(m.mode.needOther))) invalid = true; });

  const enemyDef = 8 * settings.enemyLv + 792;
  const out = members.map(r => {
    const custom = !!r.st;
    const applied = buffs.filter(b => {
      if (b.panelAdj) return custom && b.owner === r;
      if (custom && b.panel && b.owner === r) return false;
      if (b.base) return b.owner === r;
      return buffApplies(b, b.owner, r, members, order);
    });
    const zApplied = zoneBuffs.filter(b => buffApplies({ ...b, to: 'team' }, r, r, members, order));
    let all = applied.concat(zApplied);
    // 같은 효과(예: 합일 버프)는 여러 캐릭터가 줘도 한 번만, 가장 큰 값으로
    const best = {}; all.forEach(b => { if (b.uniq && (!best[b.uniq] || b.v > best[b.uniq].v)) best[b.uniq] = b; });
    all = all.filter(b => !b.uniq || best[b.uniq] === b);
    const E = r.ech || presetStats(r.c, P); // 에코 옵션을 넣었으면 그 값, 아니면 에코 완성도 추정치
    let atkP = custom ? 0 : E.atk, flat = custom ? 0 : E.flat;
    all.forEach(b => { const v = b.v * (b.up ?? 1); if (b.s === 'atk' && !b.el && !b.dt) atkP += v; if (b.s === 'flat') flat += v; });
    const w = weaponOf(r.weaponId);
    const bsr = (RAW_BASE[r.c.rid]) || null;
    const baseAtk = ((bsr && bsr[0]) || baseAtkOf(r.c)) + (w ? w.atk : 300);
    // 내 스탯: 속성 화면 공격력 + (기본 공격력 × 추가 버프%)
    let ATK = custom ? (+r.st.atk || 0) + baseAtk * atkP / 100 + flat : baseAtk * (1 + atkP / 100) + flat;
    const sc = scaleOf(r.c); let S = null, sP = 0;
    if (sc !== 'atk') { // HP(또는 방어력) 비례: HP% 버프·무기 HP 부옵션만 오르고, 공격력 버프는 효과 없음
      const baseS = bsr ? (sc === 'hp' ? bsr[1] : bsr[2]) : (sc === 'hp' ? 12000 : 1200);
      sP = custom ? 0 : E[sc + 'P']; const sF = custom ? 0 : E[sc + 'Flat'];
      all.forEach(b => { if (b.s === sc && !b.el && !b.dt) sP += b.v * (b.up ?? 1); });
      S = custom ? (+r.st[sc] || 0) + baseS * sP / 100 + sF : baseS * (1 + sP / 100) + sF;
      ATK = S * scaleK(r.c, sc);
    }
    let total = 0; const per = {};
    Object.entries(r.p).forEach(([dt, share]) => {
      const isSt = dt === 'st';
      // 이상 효과 피해(서리·불꽃·전자·풍식·광학 등): 레벨 기반 "이상 효과 피해 배율"이라 공격력·크리티컬·일반 피해 보너스의 영향을 받지 않음
      // (게임 설명: "이상 효과 피해는 크리티컬을 발생시킬 수 없다"). 이상 효과 전용 효과와 전체 피해 부스트·최종 피해·방어 무시·저항 감소만 적용
      let bonus = isSt ? 0 : custom ? (+r.st.el || 0) + (+r.st[dt] || 0) : E.elem + ((E.dt && E.dt[dt]) || 0), amp = 0, cr = custom ? +r.st.cr || 0 : E.cr, cd = custom ? +r.st.cd || 0 : E.cd, ign = 0, shred = 0, fin = 0;
      let stc = null;
      all.forEach(b => {
        if (b.s === 'stcrit') { if (isSt && matchFilter({ ...b, dt: undefined }, r.el, dt, b.owner ? b.owner.el : r.el) && (!stc || b.cr * b.cd > stc.cr * stc.cd)) stc = b; return; }
        if (!matchFilter(b, r.el, dt, b.owner ? b.owner.el : r.el)) return;
        if (isSt && b.dt !== 'st') {
          if (b.s === 'bonus' || b.s === 'cr' || b.s === 'cd') return;          // 일반 피해 보너스·크리티컬은 이상 효과에 적용 안 됨
          if ((b.s === 'amp' || b.s === 'final') && b.el) return;               // 속성 피해 부스트도 적용 안 됨(전체 피해 부스트만 적용)
        }
        const v = b.v * (b.up ?? 1);
        if (b.s === 'bonus') bonus += v; else if (b.s === 'amp') amp += v; else if (b.s === 'cr') cr += v;
        else if (b.s === 'cd') cd += v; else if (b.s === 'defign') ign += v; else if (b.s === 'res') shred += v; else if (b.s === 'final') fin += v;
      });
      if (isSt) { cr = stc ? stc.cr : 0; cd = stc ? stc.cd : 100; }
      cr = Math.max(0, Math.min(cr, 100));
      const critE = 1 + (cr / 100) * (cd / 100 - 1);
      const defM = 1520 / (1520 + enemyDef * (1 - Math.min(ign, 100) / 100));
      let res = settings.baseRes + (tz && tz.res[r.el] ? tz.res[r.el] : 0) - shred;
      if (tz && tz.resEchoExempt && dt === 'e' && tz.res[r.el] > 0) res -= tz.resEchoExempt;
      const resM = res < 0 ? 1 - res / 200 : res < 80 ? 1 - res / 100 : 1 / (1 + 5 * res / 100);
      const mult = (1 + bonus / 100) * (1 + amp / 100) * critE * defM * resM * (1 + fin / 100);
      const mvMul = 1 + ((r.mv[dt] || 0) + (r.mv['*'] || 0)) / 100;
      const lvF = skillLvFactor(r, dt);
      const d = r.pw * 60 / 100 * (share / 100) * (isSt ? ST_BASE : ATK) * mult * mvMul * lvF;
      per[dt] = { share, bonus, amp, cr, cd, ign, res, fin, critE, mult, mvMul, lvF, dmg: d };
      total += d;
    });
    return { m: r, ATK, atkP, scale: sc, S, sP, total, per, custom, echo: !!r.ech, applied: all.filter(b => !b.base && !b.panelAdj) };
  });
  // 딜 사이클 = 파티원 필드 시간의 합 (설정에서 고정값을 넣으면 그 값을 사용)
  team.forEach((m, i) => { if (m && i > 0 && m.c.role === 'main' && m.role === 'main') m.ft = Math.min(m.ft, 8); });
  // 특정 파트너와 함께일 때의 전용 사이클(예: 복링 + 방랑자·전도 퀵스왑)
  const tIds = members.map(m => m.id);
  members.forEach(m => { const base = rotOf(m.c, m.modeKey); const tr = teamRot(m.c, m.modeKey, tIds); if (base && tr && tr.teamKey && tr.ft) m.ft += tr.ft - base.ft; });
  const rotMul = 1;
  const autoRot = members.reduce((a, m) => a + m.ft, 0);
  // 공명 해방 쿨타임(대부분 20~25초) 때문에 파티 한 바퀴는 25초보다 짧아지지 않는다고 봄
  const rot = settings.rot > 0 ? settings.rot : Math.max(MIN_ROT, autoRot);
  out.forEach(x => { x.dps = x.total / rot; });
  const totalDmg = out.reduce((s, x) => s + x.total, 0);
  const hasHeal = members.some(m => m.ap.has('heal'));
  const hasShield = members.some(m => m.ap.has('shield'));
  const intoMain = team[0] ? [...order.next.entries()].find(([, v]) => v === team[0]) : null;
  return { ids, team, out, totalDmg, rot, autoRot, rotMul, dps: totalDmg / rot, hasHeal, hasShield, invalid, modes, ord: ctx.ord || 0, intoMain: intoMain ? intoMain[0].id : null };
}

/* 모드 조합 자동 탐색 → 최고 결과 */
function bestTeam(ids, ctx) {
  const modeChars = ids.filter(id => id && CH[id] && CH[id].modes);
  const forced = ctx.forcedModes || {};
  const combos = [{}];
  modeChars.forEach(id => {
    const keys = forced[id] ? [forced[id]] : Object.keys(CH[id].modes);
    const next = [];
    combos.forEach(cb => keys.forEach(k => next.push({ ...cb, [id]: k })));
    combos.splice(0, combos.length, ...next);
  });
  let best = null;
  const ords = (ids[1] && ids[2]) ? [0, 1] : [0];
  combos.forEach(md => ords.forEach(ord => {
    const r = calcTeam(ids, { ...ctx, modes: md, ord });
    const score = r.invalid ? -1 : r.totalDmg; // 1사이클 피해량 기준
    if (!best || score > best.score) best = { ...r, score };
  }));
  return best;
}

/* 탑 시즌 계산: 시즌 40 = 2026-09-14 04:00(KST) 시작, 28일 주기 */
const SEASON_BASE = { n: 40, t: Date.UTC(2026, 8, 13, 19, 0, 0) };
const DAY = 86400000;
function seasonAt(now) {
  const n = SEASON_BASE.n + Math.floor((now - SEASON_BASE.t) / (28 * DAY));
  const start = SEASON_BASE.t + (n - SEASON_BASE.n) * 28 * DAY;
  return { n, start, end: start + 28 * DAY };
}
function latestSeasonWithData(n) { return TOWER_DB[n] ? n : null; }
// 방랑자는 속성이 달라도 피로도를 공유 → 같은 캐릭터로 취급
function gk(id) { return id && id.startsWith('rover_') ? 'rover' : id; }

/* ===== 최적화 ===== */
function isUpcoming(c) { return !!(c.upcoming || (c.release && Date.now() < c.release)); }
function releaseLabel(c) { if (!isUpcoming(c)) return ''; if (c.releaseTxt) return c.releaseTxt; const d = new Date(c.release); return `${d.getMonth() + 1}/${d.getDate()} 출시`; }
function availableIds(state) {
  return CHARS.filter(c => state.owned.has(c.id) && (!isUpcoming(c) || state.settings.upcoming)).map(c => c.id);
}

function candidateTeams(pool, ctx, opts = {}) {
  const canMain = id => CH[id].role === 'main' || (CH[id].modes && Object.values(CH[id].modes).some(m => m.role === 'main'));
  const mains = pool.filter(id => canMain(id) || (opts.flexMain && CH[id].role === 'sub'));
  const results = [];
  const seen = new Set();
  const mainList = mains.length ? mains : pool.slice();
  mainList.forEach(m => {
    const others = pool.filter(x => gk(x) !== gk(m));
    // 2인 사전 평가로 파트너 후보 추리기 (opts.duo가 있으면 앞서 구한 목록을 다시 씀)
    const cand = (opts.duo && opts.duo[m]) ? opts.duo[m].slice(0, opts.k || 9) : others.map(x => {
      const asSub = bestTeam([m, x, null], ctx).score;
      const asSup = bestTeam([m, null, x], ctx).score;
      return { x, v: Math.max(asSub, asSup) };
    }).sort((a, b) => b.v - a.v).slice(0, Math.max(opts.k || 9, opts.keepDuo || 0)).map(d => d.x);
    if (opts.saveDuo) opts.saveDuo[m] = cand;
    cand.splice(opts.k || 9);
    for (let i = 0; i < cand.length; i++) for (let j = 0; j < cand.length; j++) {
      if (i === j) continue;
      const s = cand[i], p = cand[j];
      if (gk(s) === gk(p)) continue;
      const key = m + '|' + [s, p].sort().join('|');
      const r = bestTeam([m, s, p], ctx);
      if (seen.has(key)) {
        const ex = results.find(t => t.key === key);
        if (ex && r.score > ex.score) Object.assign(ex, r, { key });
        continue;
      }
      seen.add(key);
      results.push({ ...r, key });
    }
    if (others.length < 2) results.push({ ...bestTeam([m, others[0] || null, null], ctx), key: m + '|solo' });
  });
  return results.filter(r => r.score > 0).sort((a, b) => b.score - a.score);
}

function teamPenalty(r, settings) {
  // 역경의 탑: 힐·실드가 전혀 없는 파티는 생존 위험 → 점수 10% 감점
  return (r.hasHeal || r.hasShield) ? 1 : 0.9;
}

function pickDisjoint(lists, symmetric, limit = 140) {
  // lists: 슬롯별 후보(각 후보는 _s 점수 보유, 내림차순). 캐릭터가 겹치지 않으면서 _s 합이 최대인 조합
  const k = lists.length;
  const L = lists.map(l => l.slice().sort((a, b) => b._s - a._s).slice(0, limit));
  const maxRest = new Array(k + 1).fill(0);
  for (let i = k - 1; i >= 0; i--) maxRest[i] = maxRest[i + 1] + (L[i][0] ? L[i][0]._s : 0);
  let best = -Infinity, bestSel = null, iter = 0;
  function dfs(i, used, acc, sel, minIdx) {
    if (++iter > 400000) return;
    if (i === k) { if (acc > best) { best = acc; bestSel = sel.slice(); } return; }
    if (acc + maxRest[i] <= best) return;
    const list = L[i];
    for (let x = symmetric ? minIdx : 0; x < list.length; x++) {
      const t = list[x];
      if (acc + t._s + maxRest[i + 1] <= best) break;
      if (t.ids.some(id => id && used.has(gk(id)))) continue;
      t.ids.forEach(id => id && used.add(gk(id)));
      sel.push(t);
      dfs(i + 1, used, acc + t._s, sel, x + 1);
      sel.pop();
      t.ids.forEach(id => id && used.delete(gk(id)));
      if (iter > 400000) return;
    }
    // 이 슬롯을 비우는 선택(캐릭터 부족 시)
    sel.push(null); dfs(i + 1, used, acc - 50, sel, minIdx); sel.pop();
  }
  dfs(0, new Set(), 0, [], 0);
  return bestSel || [];
}

/* =====================================================================
   역경의 탑 버프 원문 → 계산용 보정값 자동 변환
   (새 시즌 데이터가 들어와도 같은 규칙으로 계산에 반영)
   ===================================================================== */
const EL_KO = { '응결': 'glacio', '용융': 'fusion', '전도': 'electro', '기류': 'aero', '회절': 'spectro', '인멸': 'havoc' };
const COND_KO = [
  ['이상 효과', STATUS_CAPS], ['전자 효과', 'flare'], ['합일', 'unison'], ['실드', 'shield'], ['서리 효과', 'chafe'],
  ['암흑 효과', 'bane'], ['풍식 효과', 'erosion'], ['광학 효과', 'frazzle'], ['불꽃 효과', 'fusionBurst'],
  ['조화 밀집', 'tuneStrain'], ['조화 파동', 'tuneRupture'], ['해킹', 'hack']
];
const DT_KO = [['일반 공격', 'n'], ['강공격', 'h'], ['공명 스킬', 's'], ['공명 해방', 'l'], ['에코 어빌리티', 'e'], ['반주 스킬', 'o'], ['협동 공격', 'c']];

function elsIn(str) { return Object.keys(EL_KO).filter(k => str.includes(k)).map(k => EL_KO[k]); }

function parseTowerBuffs(texts) {
  const mod = { res: {}, b: [], resEchoExempt: 0 };
  const addRes = (el, v) => { mod.res[el] = (mod.res[el] || 0) + v; };
  texts.forEach(raw => {
    const text = raw.replace(/\s+/g, ' ');
    // 1) 저항 증감
    if (/전체 속성 저항이 (\d+)% 증가/.test(text)) {
      const v = +RegExp.$1;
      const ex = (text.match(/받는 ([^.]*?) 해당 효과의 영향을 받지 않는다/) || [])[1] || '';
      const exEl = elsIn(ex);
      Object.values(EL_KO).forEach(el => { if (!exEl.includes(el)) addRes(el, v); });
      if (ex.includes('에코 어빌리티')) mod.resEchoExempt = v;
    }
    const resRe = /((?:[가-힣]+ 저항(?:과|와)? ?)+)이? ?(\d+)% ?(감소|증가)/g;
    let m;
    while ((m = resRe.exec(text))) {
      if (m[1].includes('전체 속성')) continue;
      const els = elsIn(m[1]);
      els.forEach(el => addRes(el, (m[3] === '감소' ? -1 : 1) * (+m[2])));
    }
    // 2) 문장 단위 버프
    text.split(/\. |다\. |다$/).forEach(sentRaw => {
      const sent = sentRaw.trim(); if (!sent || /저항/.test(sent) && !/무시/.test(sent)) return;
      let req = null, treq = null;
      for (const [k, cap] of COND_KO) {
        if (sent.includes(k)) {
          if (/보유 시|보유한|있는 목표|상태에 있는/.test(sent)) treq = cap; else req = cap;
          break;
        }
      }
      if (/에코 어빌리티 발동 시/.test(sent)) { treq = 'echo'; req = null; }
      let up = 1;
      if (/변주 스킬 발동 시|변주 스킬을 발동/.test(sent)) { const d = +((sent.match(/(\d+)초간/) || [])[1] || 15); up = d >= 18 ? .9 : d >= 15 ? .8 : .6; }
      if (/공명 스킬 발동 시/.test(sent) && /(\d+)초간/.test(sent) && +RegExp.$1 <= 5) up = Math.min(up, .7);
      const stackN = +((sent.match(/최대 (\d+)스택/) || [])[1] || 1);
      const base = { req, treq, up };
      const push = b => mod.b.push({ ...base, ...b, up: b.up ?? up });
      const dtOf = s => { for (const [k, d] of DT_KO) if (s.includes(k + ' 피해') || s.includes(k + ' 최종')) return d; return null; };
      // 전투 시간 누적 최종 피해(최대 60%) → 평균 25%
      if (/전투 시작 \d+초 후/.test(sent) && /최대 (\d+)%까지/.test(sent)) { mod.b.push({ s: 'final', v: Math.round(+RegExp.$1 * 0.42) }); return; }
      let mm;
      if ((mm = sent.match(/(\d+)% 방어력을 무시|방어력을 (\d+)% 무시/))) push({ s: 'defign', v: +(mm[1] || mm[2]) });
      const finRe = /([가-힣 ]*?)피해(?:가)? ?최종적으로 (\d+)%|최종 피해가 (\d+)%/g;
      while ((mm = finRe.exec(sent))) {
        const pre = mm[1] || sent.slice(0, mm.index);
        const v = +(mm[2] || mm[3]);
        const els = elsIn(pre.slice(-8));
        const dt = /에코 어빌리티 최종/.test(sent) ? 'e' : null;
        if (els.length) els.forEach(el => push({ s: 'final', v, el })); else push({ s: 'final', v, dt });
      }
      if ((mm = sent.match(/받는 피해가 (\d+)% 부스트/))) push({ s: 'amp', v: +mm[1] });
      if ((mm = sent.match(/공격력이 (?:1초마다 )?(\d+)% 증가/))) push({ s: 'atk', v: +mm[1] * (/1초마다/.test(sent) ? stackN : 1) });
      if ((mm = sent.match(/크리티컬 피해가 (\d+)% 증가/))) push({ s: 'cd', v: +mm[1], up: /4스택까지 중첩 시/.test(sent) ? .8 : up });
      if ((mm = sent.match(/크리티컬이 (\d+)% 증가/))) push({ s: 'cr', v: +mm[1] });
      const bonusRe = /([가-힣 와과]*?)피해(?: 보너스)?(?:가|를)? (\d+(?:\.\d+)?)% 증가/g;
      while ((mm = bonusRe.exec(sent))) {
        const pre = mm[1]; let v = +mm[2];
        if (/최종/.test(sent.slice(mm.index, mm.index + mm[0].length + 4))) continue;
        if (/크리티컬/.test(pre.slice(-6))) continue;
        if (/스택/.test(sent) && stackN > 1 && !/최대 \d+스택 중첩이 가능하고 \d+초간/.test(sent) || /6% 증가되고, 최대 4스택/.test(sent)) v = v * stackN * (pre.includes('실드') || sent.includes('실드') ? .5 : 1);
        const els = elsIn(pre);
        const dt = dtOf(pre + '피해');
        if (els.length && !pre.includes('전체 속성')) els.forEach(el => push({ s: 'bonus', v, el }));
        else push({ s: 'bonus', v, dt });
      }
    });
  });
  // 중복 문장 제거용: 같은 내용이 여러 층에 반복되므로 호출측에서 고유 텍스트만 넘김
  mod.b = mod.b.map(b => { const o = { ...b }; if (!o.req) delete o.req; if (!o.treq) delete o.treq; if (o.up === 1) delete o.up; return o; });
  return mod;
}

/* ---------- 시즌 데이터 저장소 (내장 + 자동 갱신분) ---------- */
let TOWER_DB = JSON.parse(JSON.stringify(RAW_TOWER));
let _towerModCache = {};
function setTowerDB(db) { TOWER_DB = db; _towerModCache = {}; }
function zoneFloors(sn, zone) {
  const z = ZONES[zone]; const fl = TOWER_DB[sn] || [];
  return z ? fl.filter(f => f.a === z.area && z.floors.includes(f.f)) : [];
}
function getTowerMod(sn, zone) {
  const key = sn + '|' + zone;
  if (!_towerModCache[key]) {
    const texts = [...new Set(zoneFloors(sn, zone).flatMap(f => f.b))].filter(t => !t.startsWith('('));
    _towerModCache[key] = texts.length ? parseTowerBuffs(texts) : null;
  }
  return _towerModCache[key];
}
function zoneRec(sn, zone) { return [...new Set(zoneFloors(sn, zone).flatMap(f => f.rec || []))].map(id => EL_BY_ID[id]).filter(Boolean); }

/* =====================================================================
   공명 체인 원문 → 계산용 효과 자동 변환 (+ 수동 보정)
   s:'mv'  = 해당 피해 유형의 스킬 배율 상승(본인 딜)
   s:'rot' = 딜 사이클 시간 배수(작을수록 사이클이 짧아짐)
   ===================================================================== */
const CHAIN_DT = [['일반 공격', 'n'], ['강공격', 'h'], ['공중 공격', 'h'], ['회피 반격', 'n'], ['공명 스킬', 's'], ['공명 해방', 'l'], ['변주 스킬', 'i'], ['반주 스킬', 'o'], ['에코 어빌리티', 'e'], ['협동 공격', 'c']];
const NAMED_W = 0.6; // 특정 스킬 하나만 강화될 때, 그 유형 피해 중 해당 스킬이 차지하는 비율(추정)

function chainDt(seg, c) {
  const hits = CHAIN_DT.filter(([k]) => seg.includes(k)).map(([, d]) => d);
  if (hits.length) return [...new Set(hits)];
  // 스킬 고유 이름으로만 적힌 경우: 캐릭터 스킬 이름표로 추정
  const nm = RAW_SKILLN[c.rid] || {};
  const map = { n: 'n', s: 's', l: 'l', i: 'i', o: 'o' };
  for (const [k, d] of Object.entries(map)) if (nm[k] && seg.includes(nm[k])) return [d];
  return [];
}

function parseChainNode(text, c) {
  const out = [];
  text.replace(/\s+/g, ' ').split(/(?<=다)\. ?|(?<=다)$/).forEach(raw => {
    const s = raw.trim(); if (!s) return;
    if (/받는 피해가 \d+% 감소|치료량|HP를 회복|중단되지 않|경직 저항|스태미나|끌어당긴|면역/.test(s) && !/피해 배율|크리티컬|공격력|피해 보너스|부스트/.test(s)) return;
    const team = /파티 내 (모든 )?캐릭터|근처 파티 내 모든 캐릭터|파티 내 등장 캐릭터/.test(s);
    const next = /다음 등장 캐릭터/.test(s);
    const to = next ? 'next' : team ? 'team' : 'self';
    const stack = +((s.match(/최대 (\d+)스택/) || [])[1] || 1);
    const per = /스택(마다| 당|을 보유할 때마다)|1스택 당/.test(s);
    let m;
    // 스킬 배율 상승
    const mvRe = /([^.]*?)의 피해 배율(?:을|이)? (?:추가로 )?(\d+)% 상승/g;
    while ((m = mvRe.exec(s))) {
      const dts = chainDt(m[1], c); let v = +m[2];
      if (per) v *= Math.min(stack, 4) * .5;
      (dts.length ? dts : ['*']).forEach(dt => out.push({ s: 'mv', v: v * NAMED_W, dt }));
    }
    if ((m = s.match(/(\d+)% 방어력을 무시|방어력을 (\d+)% 무시/))) out.push({ s: 'defign', v: +(m[1] || m[2]) * (chainDt(s, c).length ? NAMED_W : 1), to });
    if ((m = s.match(/크리티컬 피해(?:가|를)? (?:추가로 )?(\d+)% 증가/))) {
      const pre = s.slice(0, s.indexOf(m[0])); const dts = /의 크리티컬 피해/.test(s) ? chainDt(pre, c) : [];
      let v = +m[1]; if (per) v *= Math.min(stack, 4) * .5;
      if (dts.length) dts.forEach(dt => out.push({ s: 'cd', v: v * NAMED_W, dt, to })); else out.push({ s: 'cd', v, to });
    }
    if ((m = s.match(/크리티컬이 (\d+)% 증가/))) out.push({ s: 'cr', v: +m[1] * .7, to });
    if ((m = s.match(/HP(?: 최대치)?(?:가|를)? (\d+)% 증가/)) && !/회복/.test(s)) out.push({ s: 'hp', v: +m[1], to });
    if ((m = s.match(/공격력(?:이|을)? (\d+)% 증가/))) { let v = +m[1]; if (per || /\d스택 중첩/.test(s)) v *= Math.min(stack, 3) * .7; out.push({ s: 'atk', v, to }); }
    if ((m = s.match(/(?:([가-힣]+) )?피해(?: 보너스)?(?:가|를)? (\d+)% (?:증가|부스트)/)) && !/받는 피해/.test(s.slice(0, s.indexOf(m[0]) + 2)) && !/크리티컬/.test(m[0])) {
      const amp = /부스트/.test(m[0]); const v = +m[2];
      const els = Object.keys(EL_KO).filter(k => (m[1] || '').includes(k) || s.slice(Math.max(0, s.indexOf(m[0]) - 6), s.indexOf(m[0]) + 4).includes(k)).map(k => EL_KO[k]);
      const dts = chainDt(s.slice(Math.max(0, s.indexOf(m[0]) - 14), s.indexOf(m[0]) + 2), c);
      const b = { s: amp ? 'amp' : 'bonus', v, to };
      if (els.length) b.el = els[0];
      if (dts.length === 1) b.dt = dts[0];
      if (/이상 효과|서리 효과|전자 효과|광학 효과|불꽃 효과|풍식 효과|냉해 효과/.test(s.slice(Math.max(0, s.indexOf(m[0]) - 12), s.indexOf(m[0])))) b.dt = 'st';
      if (/받는 [^ ]+ 효과의 (최종 )?피해/.test(s)) b.dt = 'st';
      out.push(b);
    }
    // 이상 효과 피해에 크리티컬을 켜 주는 효과(크리티컬·크리티컬 피해 고정값)
    if ((m = s.match(/(서리|불꽃|전자|풍식|광학|암흑) 효과[^.]*?크리티컬을 발생시킬 수 있으며, 크리티컬은 ([\d.]+)%, 크리티컬 피해는 ([\d.]+)%로 고정/))) { out.push({ s: 'stcrit', v: 1, cr: +m[2], cd: +m[3], dt: 'st', to: 'team' }); return; }
    if ((m = s.match(/최종 피해가 (\d+)% 증가/))) out.push({ s: 'final', v: +m[1], dt: /효과/.test(s) ? 'st' : undefined, to });
  });
  return out;
}

/* 원문만으로 판단이 어려운 노드는 직접 보정 (id: {체인번호: [효과]}) */
const CHAIN_FIX = {
  hsin: { 2: [{ s: 'mv', v: 36, dt: 'h' }, { s: 'ft', v: -2, note: '전투 개막 시 강화 강공격 충전 → 사이클 약 2초 단축' }],
    3: [{ s: 'mv', v: 42, dt: 'l' }, { s: 'cd', v: 35, dt: 'l', mode: 'unison' }],
    4: [{ s: 'bonus', v: 20, to: 'team' }],
    6: [{ s: 'bonus', v: 40, dt: 's' }, { s: 'defign', v: 20, dt: 's' }, { s: 'final', v: 13.5, to: 'team', req: 'unison', mode: 'unison', uniq: 'unisonBuff', src: 'S6: 합일 버프 최대 4스택 → 3스택 기준 4.5%씩' },
        { s: 'stcrit', v: 1, cr: 80, cd: 230, dt: 'st', to: 'team', mode: 'flare', src: 'S6: 주변 목표가 받는 전자 효과 피해가 크리티컬 80% / 230%로 발생' }] },
  suoming: { 2: [{ s: 'cd', v: 40 }, { s: 'cd', v: 22, to: 'next', src: 'S2: 반주 시 다음 캐릭터 크리티컬 피해 10% + 합일 버프 2스택 12%' }],
    3: [{ s: 'amp', v: 30, dt: 'n', up: .8 }],
    6: [{ s: 'final', v: 9, to: 'team', req: 'unison', treqOther: 'unison', uniq: 'unisonBuff', src: 'S6: 합일 버프 1스택 효과 +50%(2스택 기준 4.5%씩)' },
        { s: 'final', v: 13.5, to: 'team', req: 'unison', withChar: 'hsin', uniq: 'unisonBuff', src: 'S6: 여우의 별자리 합일 모드와 3스택 기준 4.5%씩' },
        { s: 'mv', v: 30, dt: 'n' }, { s: 'cd', v: 200, up: .85, mode: 'carry', src: 'S6: 금쇄계주 중 크리티컬 피해 +200%' }] },
  hiyuki: { 3: [{ s: 'mv', v: 60, dt: 'st' }, { s: 'mv', v: 50, dt: 'h' }], 6: [{ s: 'cd', v: 40, cond: true }, { s: 'final', v: 25, dt: 'st', to: 'team' }, { s: 'mv', v: 40, dt: 'st' }] },
  lucilla: { 2: [{ s: 'amp', v: 80, el: 'glacio', dt: 'st', to: 'team', mode: 'chafe' }, { s: 'bonus', v: 40, dt: 'e', to: 'team', mode: 'echo' }] },
  suisui: { 2: [{ s: 'cd', v: 50, to: 'team', req: STATUS_CAPS }], 6: [{ s: 'cd', v: 200, dt: 's' }, { s: 'cd', v: 200, dt: 'i' }] },
  chisa: { 2: [{ s: 'bonus', v: 50, to: 'team', req: STATUS_CAPS }] }
};

const _chainCache = {};
function chainEffects(c) {
  if (_chainCache[c.id]) return _chainCache[c.id];
  const raw = RAW_CHAIN[c.rid] || {};
  const res = {};
  for (let i = 1; i <= 6; i++) {
    const fix = CHAIN_FIX[c.id] && CHAIN_FIX[c.id][i];
    let list = fix ? fix.map(b => ({ ...b })) : (raw[i] ? parseChainNode(raw[i].d, c) : []);
    if (!fix) list = list.map(b => {
      // 특정 스킬 하나의 큰 피해 증가는 스킬 배율 상승으로 환산
      if ((b.s === 'bonus' || b.s === 'amp') && (b.to || 'self') === 'self' && !b.el && b.v > 60) return { s: 'mv', v: Math.min(b.v * .4, 50), dt: b.dt || '*' };
      if (b.s === 'mv') return { ...b, v: Math.min(b.dt === '*' ? b.v * .5 : b.v, 60) };
      return b;
    });
    const seen = new Set();
    res[i] = list.filter(b => { const k = JSON.stringify(b); if (seen.has(k)) return false; seen.add(k); return true; })
      .map(b => ({ ...b, src: `S${i} ${raw[i] ? raw[i].n : ''}`.trim() }));
  }
  return (_chainCache[c.id] = res);
}


/* =====================================================================
   버전 · 패치 노트 (수정할 때마다 맨 위에 추가하고 APP_VERSION을 올립니다)
   ===================================================================== */
const APP_VERSION = D_PATCH_NOTES[0].v;
const PATCH_NOTES = D_PATCH_NOTES;

/* =====================================================================
   APP — 화면 구성
   ===================================================================== */
const LS_KEY = 'ddingjo-atm-v2';
const LS_TOWER = 'ddingjo-atm-tower';
const LS_TOWER_TXT = 'ddingjo-atm-tower-txt';
const DATA_BASE = 'https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/HEAD/';
const FREE_IDS = ['rover_havoc', 'rover_spectro', 'rover_aero', 'rover_electro', 'sanhua', 'yangyang', 'chixia', 'baizhi', 'taoqi', 'danjin', 'yuanwu'];
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const fmt = n => Math.round(n).toLocaleString('ko-KR');
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => {
  const sk = SYNC_KEYS.includes(k); const prev = sk ? lsGet(k) : null;
  try { localStorage.setItem(k, v); } catch (e) { /* 저장 불가 */ }
  if (sk) { if (prev !== null && noTab(prev) !== noTab(v)) markTouched(); syncDirty(); }
};
const SYNC_KEYS = ['ddingjo-atm-v2', 'ddingjo-atm-echo-calc']; // 로그인하면 계정에 저장되는 설정(보유 캐릭터 · 파티 · 캐릭터 설정 · 육성 · 에코 계산기)
// 이 기기에서 설정을 직접 바꾼 적이 있는지(처음 로그인할 때 계정 설정을 바로 불러올지, 물어볼지 정함)
const LS_TOUCHED = 'ddingjo-atm-touched';
const noTab = t => { try { const o = JSON.parse(t); if (o && typeof o === 'object') delete o.tab; return JSON.stringify(o); } catch (e) { return t; } };
const markTouched = () => { try { localStorage.setItem(LS_TOUCHED, '1'); } catch (e) { } };
try { if (!localStorage.getItem('ddingjo-atm-sync-v')) { if (localStorage.getItem(SYNC_KEYS[0])) markTouched(); localStorage.setItem('ddingjo-atm-sync-v', '1'); } } catch (e) { } // 1.0.21 전부터 쓰던 기기는 '바꾼 적 있음'으로

/* ---------- 신규 공명자 자동 반영 ----------
   GitHub Actions(tools/update_chars.py)가 게임 데이터를 매일 확인해 chars-extra.json을 갱신하면,
   사이트가 그 파일을 읽어 아직 앱에 없는 공명자를 보유 목록·뽑기 추천·육성 계산·도감에 추가합니다.
   마지막으로 받은 내용은 이 브라우저에 보관해 다음 접속 때 바로 반영합니다. */
const LS_EXTRA = 'ddingjo-atm-extra';
const EXTRA_URLS = [BASE + 'chars-extra.json', 'https://raw.githubusercontent.com/Real-Sesame/-/HEAD/public/chars-extra.json'];
let EXTRA_INFO = null;
const DATA_META = { gameVer: '', charsAt: '' }; // 홈 화면 '데이터 기준' 표시용
function applyExtra(doc) {
  if (!doc || doc.schema !== 1 || !Array.isArray(doc.roles)) return null;
  const info = { gameVer: doc.gameVer || '', updated: doc.updated || '', added: [], merged: [] };
  try {
    Object.entries(doc.weapons || {}).forEach(([id, w]) => {
      if (RAW_WEAPONS[id] || !w || !w.n) return; const { img, ...rest } = w; RAW_WEAPONS[id] = rest;
      if (img) IMG_WEAPON[id] = img;
    });
    {
      Object.entries(doc.items || {}).forEach(([id, it]) => { if (!RAW_GROW.items[id] && it && it.n) { RAW_GROW.items[id] = { n: it.n, q: it.q || 1 }; if (it.img) IMG_ITEM[id] = it.img; } });
      Object.entries(doc.exp || {}).forEach(([g, arr]) => { if (!RAW_GROW.exp[g] && Array.isArray(arr)) RAW_GROW.exp[g] = arr; });
    }
    const rids = new Set(CHARS.map(c => c.rid).filter(Boolean));
    doc.roles.forEach(r => {
      if (!r || !r.rid || !r.n || rids.has(r.rid)) return;
      if (r.grow && !RAW_GROW.chars[r.rid]) RAW_GROW.chars[r.rid] = r.grow;
      if (r.chain && !RAW_CHAIN[r.rid]) RAW_CHAIN[r.rid] = r.chain;
      if (Array.isArray(r.base) && !RAW_BASE[r.rid]) RAW_BASE[r.rid] = r.base;
      if (r.node && !RAW_NODE[r.rid]) RAW_NODE[r.rid] = r.node;
      const tgt = r.merge && CH[r.merge];
      if (tgt) { // 출시 전에 미리 넣어 둔 캐릭터(예: 릴리)를 실제 게임 데이터와 연결
        tgt.rid = r.rid; if (r.img && !IMG_CHAR[tgt.id]) IMG_CHAR[tgt.id] = r.img;
        if (!tgt.outro && r.outro && r.outro.d) tgt.outro = r.outro;
        if (r.w && RAW_WEAPONS[r.w] && !RAW_WEAPONS[tgt.w]) tgt.w = r.w;
        rids.add(r.rid); info.merged.push(tgt.id); return;
      }
      const id = 'x' + r.rid; if (CH[id]) return;
      const el = EL[r.el] ? r.el : 'spectro', role = ROLE_N[r.role] ? r.role : 'sub';
      const like = CHARS.filter(c => c.wt === r.wt && c.role === role && !c.auto && c.w)[0] || CHARS.find(c => c.wt === r.wt && c.w) || {};
      const setLike = CHARS.find(c => c.el === el && c.role === role && c.set && !c.auto) || CHARS.find(c => c.role === role && c.set) || {};
      const c = {
        id, rid: r.rid, name: r.n, q: r.q === 4 ? 4 : 5, el, wt: r.wt, icon: '', role, pw: +r.pw || 30, p: r.p || { n: 50, s: 50 },
        ap: Array.isArray(r.ap) ? r.ap : [], f: [], b: Array.isArray(r.b) ? r.b : [],
        w: (r.w && RAW_WEAPONS[r.w]) ? r.w : like.w, w4: like.w4, set: setLike.set, auto: true, tags: r.tags || [],
        outro: r.outro && r.outro.d ? r.outro : null,
        note: `자동 추가 (게임 데이터 ${info.gameVer || '최신'}) · 역할·버프는 공식 역할 태그와 반주 스킬 설명으로 추정한 값입니다.`
      };
      CHARS.push(c); CH[id] = c; if (r.img) IMG_CHAR[id] = r.img; rids.add(r.rid); info.added.push(id);
    });
  } catch (e) { console.warn('chars-extra 적용 실패', e); }
  return info;
}
EXTRA_INFO = applyExtra((() => { try { return JSON.parse(lsGet(LS_EXTRA) || 'null'); } catch (e) { return null; } })());
async function refreshExtra() {
  for (const u of EXTRA_URLS) {
    if (location.protocol === 'file:' && !/^https:/.test(u)) continue;
    try {
      const res = await fetch(u + (u.includes('?') ? '&' : '?') + 'h=' + Math.floor(Date.now() / 36e5), { cache: 'no-cache' });
      if (!res.ok) continue;
      const txt = await res.text(); const doc = JSON.parse(txt);
      if (!doc || doc.schema !== 1) continue;
      DATA_META.gameVer = doc.gameVer || ''; DATA_META.charsAt = doc.updated || ''; paintDataInfo();
      if (lsGet(LS_EXTRA) === txt) return;
      lsSet(LS_EXTRA, txt);
      const info = applyExtra(doc); if (!info) return;
      EXTRA_INFO = { ...info, added: [...((EXTRA_INFO && EXTRA_INFO.added) || []), ...info.added], merged: [...((EXTRA_INFO && EXTRA_INFO.merged) || []), ...info.merged] };
      const names = info.added.concat(info.merged).map(id => CH[id].name);
      if (names.length) { toast(`게임 데이터 ${info.gameVer} 기준 새 공명자를 반영했습니다: ${names.join(', ')}`); switchTab(state.tab); }
      else paintExtra();
      return;
    } catch (e) { /* 오프라인·파일 없음 → 내장 데이터만 사용 */ }
  }
}
function paintExtra() {
  const el = $('#extra-status'); if (!el) return;
  const x = EXTRA_INFO; const auto = CHARS.filter(c => c.auto);
  el.innerHTML = x ? `신규 공명자 자동 확인: 게임 데이터 <b>${esc(x.gameVer || '-')}</b>${x.updated ? ` · ${esc(x.updated.slice(0, 10))} 갱신` : ''} · ${auto.length ? `자동 추가 ${auto.length}명 (${auto.map(c => esc(c.name)).join(', ')})` : '앱에 없는 공명자 없음'}`
    : '신규 공명자 자동 확인: GitHub Pages 주소로 열면 게임 업데이트 때 새 공명자가 자동으로 추가됩니다.';
}
const autoChip = c => c && c.auto ? '<span class="chip warn" title="게임 데이터로 자동 추가 · 역할과 버프는 추정치">자동 추가 · 추정</span>' : '';

DEFAULT_SETTINGS.solo = false;
const state = {
  owned: new Set(CHARS.map(c => c.id)), ov: {}, forced: {}, settings: { ...DEFAULT_SETTINGS },
  parties: [], tab: 'tower-build', rosterFilter: 'all', rosterQuery: '', presetFilter: 'all', dbView: 'chars',
  infoSeason: null, fieldHeal: 'need', fieldPref: 'comfort', swap: null, swapFilter: 'all', guideHidden: false,
  towerStatus: { kind: 'idle', msg: '내장 데이터 사용 중' }
};

function save() {
  lsSet(LS_KEY, JSON.stringify({ owned: [...state.owned], ov: state.ov, forced: state.forced, settings: state.settings, parties: state.parties, tab: state.tab, guideHidden: state.guideHidden, grow: state.grow, inv: state.inv, growYield: state.growYield }));
}
function load() {
  try {
    const d = JSON.parse(lsGet(LS_KEY) || 'null'); if (!d) return false;
    if (Array.isArray(d.owned)) state.owned = new Set(d.owned.filter(id => CH[id]));
    state.ov = d.ov || {}; state.forced = d.forced || {};
    state.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
    if (state.settings.rot === 25) state.settings.rot = 0; // 이전 버전 고정값 → 자동
    if (![0, 4, 8, 15].includes(state.settings.presetBias)) state.settings.presetBias = state.settings.presetBias > 8 ? 15 : state.settings.presetBias ? 8 : 0; // 1.0.22에서 단계 변경
    state.parties = (d.parties || []).filter(p => p && Array.isArray(p.ids)).map(p => ({ ...p, ids: p.ids.map(id => (id && CH[id]) ? id : null) }));
    if (d.tab && document.querySelector(`#tabs .tab[data-tab="${d.tab}"]`)) state.tab = d.tab;
    state.guideHidden = !!d.guideHidden;
    if (d.grow) state.grow = d.grow; if (d.inv) state.inv = d.inv; if (d.growYield) state.growYield = d.growYield;
    return true;
  } catch (e) { return false; }
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2400);
}

/* ---------- 이미지 ---------- */
function portraitHTML(c, { tag = 'div', attrs = '', swap = false } = {}) {
  if (!c) return `<${tag} class="portrait" ${attrs}><span class="ph" style="color:var(--muted)">＋</span></${tag}>`;
  const url = (IMG_CHAR[c.id]) || '';
  const bg = EL[c.el] ? EL[c.el].c : 'var(--line)';
  const initial = esc(c.name.replace('방랑자·', '').slice(0, 1));
  return `<${tag} class="portrait" ${attrs} style="background:${bg}">
    ${url ? `<img src="${url}" alt="">` : `<span class="ph">${initial}</span>`}
    <span class="el-dot" style="background:${bg}"></span>
    <span class="q" style="background:${c.q === 5 ? 'var(--r5)' : 'var(--r4)'}"></span>
    ${swap ? '<span class="swap">교체</span>' : ''}
  </${tag}>`;
}
const wIcon = id => (IMG_WEAPON[id]) ? `<img src="${IMG_WEAPON[id]}" alt="">` : '<img alt="">';
const sIcon = id => (IMG_SET[id]) ? `<img src="${IMG_SET[id]}" alt="">` : '<img alt="">';
function elTag(el) { return EL[el] ? `<span class="el-tag" style="color:${EL[el].c}">${EL[el].n}</span>` : ''; }

/* ---------- 버프 표기 ---------- */
const STAT_N = { stcrit: '크리티컬 발생(크리티컬 / 크리티컬 피해 고정)', atk: '공격력', flat: '공격력(고정)', bonus: '피해 보너스', amp: '피해 부스트', cr: '크리티컬', cd: '크리티컬 피해', defign: '방어 무시', res: '저항 감소', final: '최종 피해', er: '공명 효율', hp: 'HP', def: '방어력' };
const TO_N = { self: '자신', team: '파티 전원', others: '다른 파티원', next: '다음 등장 캐릭터' };
function buffLabel(b) { const p = []; if (b.el && b.el !== '*') p.push(EL[b.el].n); if (b.dt) p.push(DT[b.dt]); p.push(STAT_N[b.s] || b.s); return p.join(' '); }
function capTxt(x) { const a = [].concat(x); return a.length >= 5 ? '이상 효과' : a.map(k => CAP_N[k] || k).join('·'); }
function buffCond(b) {
  const c = [];
  if (b.req) c.push(`받는 캐릭터가 ${capTxt(b.req)} 담당일 때`);
  if (b.treq) c.push(`파티에 ${capTxt(b.treq)} 담당이 있을 때`);
  if (b.treqOther) c.push(`다른 파티원 중 ${capTxt(b.treqOther)} 담당이 있을 때`);
  if (b.withChar && CH[b.withChar]) c.push(`${CH[b.withChar].name}와 함께일 때`);
  if (b.up !== undefined && b.up < 1) c.push(`유지율을 고려해 ${Math.round(b.up * 100)}%만 반영`);
  return c.join(' · ');
}
// 도감용: "누구에게 · 무엇이 · 얼마나 · 조건 · 출처"를 한 줄씩
function buffDescHTML(b) {
  const tgt = TO_N[b.to || 'self'];
  const eff = [b.el && b.el !== '*' ? EL[b.el].n : '', b.dt ? DT[b.dt] : '', STAT_N[b.s] || b.s].filter(Boolean).join(' ');
  const v = b.s === 'stcrit' ? `${b.cr}% / ${b.cd}%` : b.s === 'flat' ? `+${b.v}` : b.s === 'res' ? `-${b.v}%` : `+${b.v}%`;
  const cond = buffCond(b);
  return `<div class="bf"><div><span class="bf-to">${esc(tgt)}</span> ${esc(eff)} <b class="num">${v}</b></div>${cond ? `<div class="bf-c">조건: ${esc(cond)}</div>` : ''}${b.src ? `<div class="bf-s">${esc(b.src)}</div>` : ''}</div>`;
}
function buffVal(b) { if (b.s === 'stcrit') return `${b.cr}% / ${b.cd}%`; const v = b.v * (b.up ?? 1); return b.s === 'flat' ? `+${Math.round(v)}` : `+${+v.toFixed(1)}%`; }

/* ---------- 파티 슬롯 계획 ----------
   단일 캐릭터 끄기: 3파티(잔향·심연 3~4층·울림) / 4파티(+심연 1~2층)
   단일 캐릭터 켜기: 잔향·울림 1~3층을 단일 캐릭터가 맡고 4층은 파티가 맡음 (4~7파티) */
const SLOT = {
  L: { zones: ['L'], type: 'team', label: '잔향의 탑', fl: '1~4층', cost: 10 },
  R: { zones: ['R'], type: 'team', label: '울림의 탑', fl: '1~4층', cost: 10 },
  C12: { zones: ['C12'], type: 'team', label: '심연의 탑', fl: '1~2층', cost: 10 },
  C34: { zones: ['C34'], type: 'team', label: '심연의 탑', fl: '3~4층 (보스)', cost: 10 },
  sL: { zones: ['L'], type: 'solo', label: '잔향의 탑', fl: '1~3층 · 단일', cost: 6 },
  sR: { zones: ['R'], type: 'solo', label: '울림의 탑', fl: '1~3층 · 단일', cost: 6 },
  L4: { zones: ['L'], type: 'team', label: '잔향의 탑', fl: '4층', cost: 4 },
  R4: { zones: ['R'], type: 'team', label: '울림의 탑', fl: '4층', cost: 4 },
  LR4: { zones: ['L', 'R'], type: 'team', label: '잔향 · 울림의 탑', fl: '각 4층', cost: 8 },
  sC1: { zones: ['C12'], type: 'solo', label: '심연의 탑', fl: '1층 · 단일', cost: 5 },
  C2: { zones: ['C12'], type: 'team', label: '심연의 탑', fl: '2층', cost: 5 }
};
function slotPlan() {
  const { solo, parties: k } = state.settings;
  if (!solo) return k === 4 ? ['L', 'C12', 'C34', 'R'] : ['L', 'C34', 'R'];
  return ({ 4: ['sL', 'LR4', 'C34', 'sR'], 5: ['sL', 'LR4', 'C12', 'C34', 'sR'], 6: ['sL', 'L4', 'C12', 'C34', 'sR', 'R4'], 7: ['sL', 'L4', 'sC1', 'C2', 'C34', 'sR', 'R4'] })[k] || ['sL', 'LR4', 'C34', 'sR'];
}
function partyOptions() { return state.settings.solo ? [4, 5, 6, 7] : [3, 4]; }

/* ---------- 계산 컨텍스트 ---------- */
function curSeason() { const s = seasonAt(Date.now()); return { ...s, data: latestSeasonWithData(s.n) }; }
function ctxFor(zone) { const s = curSeason(); return { settings: state.settings, ov: state.ov, forcedModes: state.forced, zone: state.settings.towerMode ? zone : null, season: s.data }; }
function evalParty(p) {
  const sl = SLOT[p.slot]; if (!sl || !p.ids.some(Boolean)) return null;
  const rs = sl.zones.map(z => bestTeam(p.ids, ctxFor(z)));
  const r = rs[0];
  if (rs.length > 1) { r.dpsAlt = rs.slice(1).map(x => x.totalDmg); }
  return r;
}

/* ---------- 추천 조합 매칭 ---------- */
const sameTeam = (a, b) => { const x = a.filter(Boolean).map(gk).sort().join('|'); return x === b.filter(Boolean).map(gk).sort().join('|') && a.filter(Boolean).length === b.filter(Boolean).length; };
const PB_TIER = { best: 1, mid: .7, f2p: .6 };
function presetMatch(ids) { return presetTeams().find(x => sameTeam(ids, x.m)) || null; }
// 설정의 가중치(%)만큼 추천 조합 점수를 올림. 정석 100%, 대체 70%, 입문 60% 비율
function presetBias(ids) { const w = (state.settings.presetBias ?? 8) / 100; if (!w) return 1; const m = presetMatch(ids); return m ? 1 + w * PB_TIER[m.k] : 1; }

/* ---------- 자동 편성 ---------- */
// 주어진 후보 풀과 현재 파티(고정 포함)로 새 편성을 계산해 돌려줌 (화면·상태는 건드리지 않음)
function planParties(pool, parties) {
  const plan = slotPlan();
  const baseCtx = { ...ctxFor(null), zone: null };
  const k = pool.length > 30 ? 8 : 10;
  const duo = {};
  const cands = candidateTeams(pool, baseCtx, { k, saveDuo: duo, keepDuo: k + 2 }).slice(0, 240);
  // 구역(탑 버프 · 적 저항)마다 강한 파티가 다르므로, 구역별로도 후보를 뽑아 합침
  const seenK = new Set(cands.map(t => t.ids.map(gk).sort().join('|')));
  [...new Set(plan.flatMap(key => SLOT[key].type === 'team' ? SLOT[key].zones : []))].forEach(z => {
    candidateTeams(pool, { ...ctxFor(z), zone: z }, { k: k - 1, duo }).slice(0, 60).forEach(t => { const key = t.ids.map(gk).sort().join('|'); if (!seenK.has(key)) { seenK.add(key); cands.push(t); } });
  });
  // 추천 조합(정석·대체·입문) 중 보유 캐릭터로 짤 수 있는 것도 후보에 넣고, 점수에 가중치를 줍니다
  const poolSet = new Set(pool);
  presetTeams().forEach(x => { if (x.m.every(id => poolSet.has(id)) && new Set(x.m.map(gk)).size === 3 && !cands.some(t => sameTeam(t.ids, x.m))) cands.push({ ids: x.m.slice() }); });
  // 같은 세 명이라도 메인 · 서브 · 서포터 배치를 바꿔 가장 좋은 쪽으로
  cands.forEach(t => { if (t.ids.filter(Boolean).length === 3 && !t._perm) { const alt = [[t.ids[1], t.ids[0], t.ids[2]], [t.ids[2], t.ids[1], t.ids[0]]].filter(a => CH[a[0]].role !== 'sup'); const z = { ...ctxFor(null), zone: null }; let b = bestTeam(t.ids, z).score; alt.forEach(a => { const r = bestTeam(a, z); if (r.score > b * 1.02) { b = r.score; t.ids = a; } }); t._perm = 1; } });
  const tf = v => Math.log(Math.max(v, 1e-4)); // 파티 간 균형을 맞추는 방향으로 편성
  const memo = new Map(); const zctx = {}; // 같은 파티 · 같은 구역 계산은 한 번만
  const zoneScore = (ids, z) => { const k = ids.join('|') + '@' + z; if (!memo.has(k)) memo.set(k, bestTeam(ids, zctx[z] || (zctx[z] = ctxFor(z)))); return memo.get(k); };
  const sn = curSeason().data;
  const lists = plan.map((key, i) => {
    const p = parties[i];
    if (p && p.locked) return [{ ids: p.ids.slice(), _s: 0, locked: true }];
    const sl = SLOT[key];
    if (sl.type === 'solo') {
      const rec = sn ? zoneRec(sn, sl.zones[0]) : [];
      const sc = pool.filter(id => CH[id].role !== 'sup').map(id => {
        const r = bestTeam([id, null, null], ctxFor(sl.zones[0]));
        const match = !rec.length || rec.includes(CH[id].el);
        return { ids: [id, null, null], raw: r.score * (match ? 1 : 0.3), match };
      });
      const best = Math.max(...sc.map(x => x.raw), 1);
      return sc.map(x => ({ ...x, _s: 0.35 * tf(x.raw / best) }));
    }
    const sc = cands.map(t => {
      const raw = sl.zones.reduce((a, z) => { const r = zoneScore(t.ids, z); return a + r.score * teamPenalty(r); }, 0) / sl.zones.length * presetBias(t.ids);
      return { ids: t.ids, raw: raw * tierBias(t.ids) };
    });
    const best = Math.max(...sc.map(x => x.raw), 1);
    return sc.map(x => ({ ...x, _s: tf(x.raw / best) }));
  });
  // 파티 슬롯을 먼저 탐색하면 가지치기가 잘 됨
  const order = plan.map((k, i) => i).sort((a, b) => (SLOT[plan[a]].type === 'solo') - (SLOT[plan[b]].type === 'solo'));
  const picked = pickDisjoint(order.map(i => lists[i]), false);
  const chosen = []; order.forEach((i, j) => { chosen[i] = picked[j]; });
  return plan.map((key, i) => {
    const old = parties[i];
    if (old && old.locked) return { ...old, slot: key };
    const c = chosen[i];
    return { slot: key, ids: c ? c.ids.slice() : [null, null, null], locked: false };
  });
}
function optimize(silent) {
  ensureParties();
  const lockedIds = new Set(state.parties.filter(p => p.locked).flatMap(p => p.ids.filter(Boolean).map(gk)));
  const pool = availableIds(state).filter(id => !lockedIds.has(gk(id)));
  if (pool.length < 3 && !state.parties.some(p => p.locked)) { if (!silent) toast('보유 캐릭터를 3명 이상 선택해 주세요.'); renderBuild(); return; }
  state.parties = planParties(pool, state.parties);
  save(); renderBuild();
  if (!silent) toast(`${state.parties.length}파티를 자동 편성했습니다.`);
}
function ensureParties() {
  const plan = slotPlan();
  const ok = partyOptions(); if (!ok.includes(state.settings.parties)) state.settings.parties = ok[0];
  const plan2 = slotPlan();
  state.parties = plan2.map((key, i) => {
    const p = state.parties[i] || { ids: [null, null, null], locked: false };
    let ids = p.ids.slice(0, 3); while (ids.length < 3) ids.push(null);
    if (SLOT[key].type === 'solo') ids = [ids.find(Boolean) || null, null, null];
    return { slot: key, ids, locked: !!p.locked };
  });
  return plan;
}

/* ---------- 시즌 표시 ---------- */
function seasonStripHTML(prefix) {
  const s = curSeason();
  const st = new Date(s.start), d = new Date(s.end), left = s.end - Date.now();
  const days = Math.floor(left / DAY), hrs = Math.floor((left % DAY) / 3600000);
  if (!s.data) return `<strong>심경 구역 시즌 ${s.n}</strong><span>이 시즌의 탑 구성이 아직 공개 데이터에 없습니다. 역경의 탑 정보 탭에서 다시 확인해 주세요.</span>`;
  return `<strong>${prefix || ''}심경 구역 시즌 ${s.n}</strong><span>${st.getMonth() + 1}/${st.getDate()} ~ ${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:00</span><span class="chip acc">초기화까지 ${days}일 ${hrs}시간</span>`;
}

/* ---------- 탑 편성 렌더 ---------- */
function renderBuild() {
  ensureParties();
  $('#guide-wrap').hidden = state.guideHidden;
  const segP = $('#seg-parties');
  segP.innerHTML = partyOptions().map(n => `<button data-v="${n}" aria-pressed="${n === state.settings.parties}">${n}파티</button>`).join('');
  $$('button', segP).forEach(b => b.addEventListener('click', () => { state.settings.parties = +b.dataset.v; ensureParties(); optimize(true); }));
  $('#build-season').innerHTML = seasonStripHTML() + `<span>· ${state.settings.towerMode ? '구역별 저항·버프 반영' : '탑 버프 미반영'}</span>`;
  const results = state.parties.map(evalParty);
  const used = state.parties.flatMap(p => p.ids.filter(Boolean).map(gk));
  const dup = used.length - new Set(used).size;
  const teamIdx = state.parties.map((p, i) => i).filter(i => SLOT[state.parties[i].slot].type === 'team' && results[i]);
  const total = results.reduce((a, r) => a + (r ? r.totalDmg : 0), 0);
  const bal = teamIdx.map(i => bestTeam(state.parties[i].ids, { ...ctxFor(null), zone: null }).totalDmg);
  const ratio = bal.length > 1 ? Math.min(...bal) / Math.max(...bal) : 1;
  const grade = ratio > .85 ? 'S 고른 편' : ratio > .7 ? 'A 양호' : ratio > .55 ? 'B 편차 있음' : 'C 한쪽 쏠림';
  const soloN = state.parties.filter(p => SLOT[p.slot].type === 'solo').length;
  $('#build-summary').innerHTML = `
    <div><div class="k">파티 합산 1사이클 피해</div><div class="v">${fmt(total)}</div></div>
    <div><div class="k">사용 캐릭터</div><div class="v txt">${new Set(used).size}명${soloN ? ` · 단일 ${soloN}` : ''}</div></div>
    <div><div class="k">파티 간 균형 (탑 버프 제외)</div><div class="v txt">${bal.length ? grade : '-'}</div></div>
    <div><div class="k">중복 · 피로도</div><div class="v txt" style="color:${dup ? 'var(--bad)' : 'var(--good)'}">${dup ? `${dup}명 중복` : '중복 없음'}</div></div>`;
  $('#parties').innerHTML = state.parties.map((p, i) => partyHTML(p, results[i], i)).join('');
  $('#build-note').textContent = state.settings.solo
    ? '1~3층은 추천 속성(속성 접대)을 가진 캐릭터 한 명으로 깨는 구성입니다. 단일 캐릭터 피로도 6(심연 1층은 5), 4층 파티는 4입니다. 방랑자는 속성이 달라도 피로도를 공유하므로 한 파티에만 배치합니다.'
    : '심경 구역 피로도는 캐릭터당 10입니다. 잔향·울림의 탑은 1~4층 합계 10, 심연의 탑은 층당 5라서 전 층을 돌려면 4파티가 필요합니다. 방랑자는 속성이 달라도 피로도를 공유하므로 한 파티에만 배치합니다.';
  bindPartyEvents();
  $('#owned-chip').textContent = `보유 ${state.owned.size}명`;
}

function gearHTML(id, mem, c) {
  const w = weaponOf(mem.weaponId); const st = (state.ov[id] || {}).st;
  return `<button class="gear-sum" data-cfg="${id}" title="${esc(w ? w.n : '')} · ${esc(setLabel(mem))}" aria-label="${esc(c.name)} 체인·무기·스탯 설정">
    ${wIcon(mem.weaponId)}${sIcon(mem.setId)}${(mem.sets2 || []).map(sIcon).join('')}<span class="num">S${mem.chain}·R${mem.refine}</span>${Object.values(mem.sl || {}).some(v => v < 10) ? `<span class="num tag-sl">Lv ${SK_TREES.map(([k]) => mem.sl[k]).join('/')}</span>` : ''}${st && st.on ? '<span class="tag-me">내 스탯</span>' : ((state.ov[id] || {}).echo && state.ov[id].echo.on ? '<span class="tag-me">에코</span>' : '')}<span class="cfg">설정</span></button>`;
}
function modeSelHTML(id, c, r) {
  if (!c.modes) return '';
  const auto = c.modes[(r && r.modes[id]) || Object.keys(c.modes)[0]].n;
  return `<select data-mode="${id}" aria-label="공명 모드"><option value="">모드 자동 (${esc(auto)})</option>${Object.entries(c.modes).map(([k, m]) => `<option value="${k}" ${state.forced[id] === k ? 'selected' : ''}>${esc(m.n)} 모드</option>`).join('')}</select>`;
}

function partyHTML(p, r, pi) {
  const sl = SLOT[p.slot];
  const solo = sl.type === 'solo';
  const sn = curSeason().data;
  const head = `<div class="party-head">
      <div><h3>${pi + 1}파티 ${solo ? '<span class="chip solo">단일</span>' : ''}</h3><div class="zone">${esc(sl.label)} · ${esc(sl.fl)} · 피로도 ${sl.cost}</div></div>
      <div class="party-dps"><div class="v">${r ? fmt(r.totalDmg) : '-'}</div><div class="k">1사이클 피해${r && r.dpsAlt ? ` · 울림 ${fmt(r.dpsAlt[0])}` : ''}</div>${r ? `<div class="k">약 ${Math.round(r.rot)}초 · 초당 ${fmt(r.dps)}</div>` : ''}
      <button class="lock" data-lock="${pi}" aria-pressed="${!!p.locked}" style="margin-top:4px">${p.locked ? '고정됨' : '고정'}</button></div>
    </div>`;
  if (solo) {
    const id = p.ids[0]; const c = id ? CH[id] : null;
    const rec = sn ? zoneRec(sn, sl.zones[0]) : [];
    let info = `<div class="solo-info"><div>추천 속성 ${rec.length ? rec.map(elTag).join(' ') : '<span class="muted">없음</span>'}</div>`;
    if (c) {
      const o = r && r.out[0]; const mem = o ? o.m : resolveMember(id, null, state.ov, state.settings);
      const match = !rec.length || rec.includes(c.el);
      info += `<div><b style="color:var(--ink);font-size:14px">${esc(c.name)}</b> ${match ? '<span class="chip ok">속성 접대</span>' : '<span class="chip warn">추천 속성 아님</span>'}</div>
        ${modeSelHTML(id, c, r)}${gearHTML(id, mem, c)}${r ? rotationHTML(r) : ''}`;
    } else info += '<div>초상화를 눌러 캐릭터를 넣어 주세요.</div>';
    info += '</div>';
    return `<article class="party solo">${head}<div class="slots one"><div class="slot" style="padding:6px">${portraitHTML(c, { tag: 'button', attrs: `data-swap="${pi}:0" aria-label="단일 캐릭터 교체"`, swap: !!c })}</div>${info}</div></article>`;
  }
  const slotsHTML = [0, 1, 2].map(si => {
    const id = p.ids[si]; const c = id ? CH[id] : null; const roleN = ['메인', '서브', '서포터'][si];
    if (!c) return `<div class="slot empty"><div class="slot-role">${roleN}</div>${portraitHTML(null, { tag: 'button', attrs: `data-swap="${pi}:${si}" aria-label="${roleN} 슬롯에 캐릭터 넣기"` })}<div class="nm muted">비어 있음</div></div>`;
    const o = r ? r.out.find(x => x.m.id === id) : null;
    const share = r && r.totalDmg && o ? (o.total / r.totalDmg * 100) : 0;
    const mem = o ? o.m : resolveMember(id, null, state.ov, state.settings);
    return `<div class="slot">
      <div class="slot-role">${roleN}</div>
      ${portraitHTML(c, { tag: 'button', attrs: `data-swap="${pi}:${si}" aria-label="${esc(c.name)} 교체"`, swap: true })}
      <div class="nm">${esc(c.name)}</div>
      <div class="share"><i style="width:${share.toFixed(0)}%"></i></div>
      <div class="meta"><span class="num">${o ? fmt(o.total) : '-'}</span><span>${share.toFixed(0)}%</span></div>
      ${modeSelHTML(id, c, r)}${gearHTML(id, mem, c)}
    </div>`;
  }).join('');
  let body = '';
  if (r) {
    const chips = [];
    const pm = presetMatch(p.ids); if (pm) chips.push(`<span class="chip acc" title="${pm.community ? '공략 사이트(wuwabuild.com, 3.7) 추천 파티' : '사이트에 정리된 추천 조합'}">${pm.community ? '커뮤니티 조합' : '추천 조합'} · ${esc(pm.p.t)}${pm.k === 'best' ? '' : pm.k === 'mid' ? ' (대체)' : ' (입문)'}</span>`);
    if (sl.type === 'team') { const tb = tierBias(p.ids.filter(Boolean).length ? p.ids : [], true); const pct = Math.round((tb.f - 1) * 100); if (tb.tier && Math.abs(pct) >= 1) chips.push(`<span class="chip" title="자동 편성 순위에만 쓰는 보정입니다. 메인 딜러 커뮤니티 티어 ${tb.tier}(계산 모델 평가 ${tb.c ? Math.round(tb.c.rel * 100) + '%' : '-'} · 티어 기대 ${tb.c ? Math.round(tb.c.tgt * 100) + '%' : '-'})와 서브 · 서포터 티어를 반영합니다. 설정 → 커뮤니티 평가 반영에서 바꿀 수 있어요.">커뮤니티 ${esc(tb.tier)} · 순위 보정 ${pct > 0 ? '+' : ''}${pct}%</span>`); }
    chips.push(r.hasHeal ? '<span class="chip ok">힐러 있음</span>' : r.hasShield ? '<span class="chip ok">실드 있음</span>' : '<span class="chip warn">힐·실드 없음</span>');
    Object.entries(r.modes || {}).forEach(([id, k]) => chips.push(`<span class="chip acc">${esc(CH[id].name)} · ${esc(CH[id].modes[k].n)}</span>`));
    if (r.invalid) chips.push('<span class="chip warn">합일 상대 없음</span>');
    p.ids.filter(id => id && isUpcoming(CH[id])).forEach(id => chips.push(`<span class="chip warn">${esc(CH[id].name)} ${esc(releaseLabel(CH[id]))}</span>`));
    if (state.settings.towerMode && sn) {
      const tz = getTowerMod(sn, sl.zones[0]); const mainEl = r.out[0] ? r.out[0].m.el : null;
      if (tz && mainEl && tz.res[mainEl]) chips.push(`<span class="chip ${tz.res[mainEl] < 0 ? 'ok' : 'warn'}">${EL[mainEl].n} 저항 ${tz.res[mainEl] > 0 ? '+' : ''}${tz.res[mainEl]}%</span>`);
    }
    const main = r.out.find(x => x.m.role === 'main') || r.out[0];
    const ext = main ? main.applied.filter(b => b.kind !== '탑' && !(b.owner === main.m && (b.to || 'self') === 'self' && b.kind !== '캐릭터')) : [];
    const rows = ext.map(b => `<li><span class="src">${esc(b.owner ? b.owner.c.name : '')} · ${esc(b.src || '')} <span class="muted">(${esc(buffLabel(b))})</span></span><span>${buffVal(b)}</span></li>`).join('');
    const tRows = main ? main.applied.filter(b => b.kind === '탑').map(b => `<li><span class="src">탑 버프 <span class="muted">(${esc(buffLabel(b))})</span></span><span>${buffVal(b)}</span></li>`).join('') : '';
    const grid = main ? `<div class="mult-grid"><div class="h" style="text-align:left">${esc(main.m.c.name)}</div><div class="h">비중</div><div class="h">보너스</div><div class="h">심화</div><div class="h">크리 기대</div><div class="h">배수</div>
      ${Object.entries(main.per).map(([dt, x]) => `<div class="rl">${DT[dt]}</div><div>${x.share}%</div><div>${x.bonus.toFixed(0)}%</div><div>${x.amp.toFixed(0)}%</div><div>×${x.critE.toFixed(2)}</div><div>×${x.mult.toFixed(2)}</div>`).join('')}
      </div><div class="note" style="margin-top:6px">${main.scale === 'hp' ? `HP <span class="num">${fmt(main.S)}</span> (HP +${main.sP.toFixed(0)}% · HP 비례 캐릭터)` : main.scale === 'def' ? `방어력 <span class="num">${fmt(main.S)}</span> (방어력 +${main.sP.toFixed(0)}%)` : `공격력 <span class="num">${fmt(main.ATK)}</span> (공격력 +${main.atkP.toFixed(0)}%)`}</div>` : '';
    body = `<div class="chips">${chips.join('')}</div>
      ${rotationHTML(r, 'p' + pi)}
      <details class="buffs"><summary>메인 딜러가 받는 버프 ${ext.length}개 · 계산 근거</summary><ul class="buff-list">${rows || '<li><span class="src">받는 버프 없음</span><span></span></li>'}${tRows}</ul>${grid}</details>`;
  }
  return `<article class="party">${head}<div class="slots">${slotsHTML}</div><div class="party-body">${body}</div></article>`;
}


/* ---------- 딜 사이클 예시 ---------- */
function stepsHTML(arr) { return `<div class="steps">${arr.map(x => `<span class="step">${esc(x)}</span>`).join('<span class="arr">→</span>')}</div>`; }
function genericSteps(c, role) {
  return role === 'main'
    ? ['변주', `공명 스킬 ${(RAW_SKILLN[c.rid] || {}).s || ''}`.trim(), `공명 회로 ${(RAW_SKILLN[c.rid] || {}).f || ''} 위주 딜`.trim(), '공명 해방', '반주']
    : ['변주', '공명 스킬', '공명 해방', '협주 에너지가 차면 반주'];
}
function memberRotHTML(m, opts) {
  const c = m.c; const r = teamRot(c, m.modeKey, opts.ids);
  const steps = r && r.loop ? r.loop : genericSteps(c, m.role);
  const chips = [];
  if (r && r.full) chips.push('<span class="chip warn">끝까지 필드 유지</span>');
  if (opts.intoMain) chips.push('<span class="chip acc">메인에게 반주</span>');
  if (!r) chips.push('<span class="chip">기본 틀 (세부 사이클 자료 없음)</span>');
  const tip = r && (r.tip || (ROT[c.id] && ROT[c.id].tip));
  const firstLbl = opts.first ? '첫 사이클 (변주 없이 시작)' : '첫 사이클';
  return `<li class="${opts.pc || ''}"><div class="rot-head">${opts.pc ? '<span class="dot"></span>' : ''}<b>${esc(c.name)}</b>${m.modeKey && c.modes ? ` <span class="muted">${esc(c.modes[m.modeKey].n)} 모드</span>` : ''}<span class="num muted">약 ${m.ft}초</span>${chips.join('')}</div>
    ${(opts.first || (r && r.openAll)) && r && r.open ? `<div class="note">${firstLbl}</div>${stepsHTML(r.open)}<div class="note">두 번째 사이클부터</div>` : ''}
    ${stepsHTML(steps)}
    ${opts.buffs ? `<div class="note">받는 반주 버프: ${opts.buffs}</div>` : ''}
    ${tip ? `<div class="note">${esc(tip)}</div>` : ''}</li>`;
}
/* 팀 전체 순서를 캐릭터 색으로 구분해 보여 줌. step = [캐릭터 id, 표기, 풀이, 퀵스왑 여부] */
function teamSeqHTML(sq, pcOf) {
  const row = (arr) => `<div class="cseq">${arr.map(([id, tx, sub, qs]) => {
    const c = CH[id]; const nm = c ? c.name : id;
    return `<span class="cstep ${pcOf[id] || ''}${qs ? ' hand' : ''}" title="${esc(nm)}${qs ? ' (퀵스왑)' : ''}">${qs ? '<span class="sw">퀵스왑</span>' : ''}${esc(tx)}${sub ? ` <small>${esc(sub)}</small>` : ''}</span>`;
  }).join('')}</div>`;
  return `${sq.open ? `<div class="seq-block"><div class="cap">팀 전체 순서 · 첫 사이클 (전투 시작)</div>${row(sq.open)}</div>` : ''}
    ${sq.loop ? `<div class="seq-block"><div class="cap">팀 전체 순서 · 두 번째 사이클부터 (반복)</div>${row(sq.loop)}</div>` : ''}`;
}
/* ---------- 사이클 타임라인 (간트) ----------
   팀 순서(TEAM_ROT.seq) 또는 캐릭터별 사이클(ROT)을 이어 붙이고, 동작 종류별 대략적인 길이 비율로
   각 캐릭터의 필드 시간을 나눠서 그립니다. 실제 프레임 데이터가 아닌 추정치입니다. */
function stepWeight(t) {
  const s = String(t).replace(/\([^)]*\)/g, ' ');
  let w = 0, m;
  if ((m = s.match(/평타\s*(\d)\s*~\s*(\d)/))) w += (+m[2] - +m[1] + 1) * 0.45;
  else if ((m = s.match(/평타\s*(\d)\s*회/))) w += +m[1] * 0.45;
  else if ((m = s.match(/평+/))) w += m[0].length * 0.45;
  else if (/평타/.test(s)) w += 0.6;
  if ((m = s.match(/강공\s*(\d)\s*회|강공\s*(\d)\s*연/))) w += +(m[1] || m[2]) * 1.2;
  else if ((m = s.match(/(강공)+/))) w += (m[0].length / 2) * 1.2;
  if (/해방/.test(s)) w += 1.6;
  if (/(^|[^가-힣])E|스킬/.test(s) && !/변주|반주/.test(s)) w += /강화/.test(s) ? 1.3 : 1.0;
  if (/에코/.test(s)) w += 0.8;
  if (/변주/.test(s)) w += 1.0;
  if (/반주/.test(s)) w += 0.3;
  return w || 0.8;
}
function cycleSteps(seq, ids) {
  const tr = TEAM_ROT.find(t => t.seq && t.seq.loop && t.has.every(id => ids.includes(id)));
  let steps = [];
  if (tr) {
    steps = tr.seq.loop.map(([id, tx, sub, qs]) => ({ id, t: tx, sub: sub || '', full: sub ? `${tx} (${sub})` : tx, qs: !!qs }));
    seq.forEach(m => { // 팀 순서에 한 칸만 있는 캐릭터(예: 여우의 별자리)는 본인 사이클을 펼쳐 넣음
      const own = steps.filter(x => x.id === m.id);
      if (own.length !== 1) return;
      const r = teamRot(m.c, m.modeKey, ids); const loop = (r && r.loop) || genericSteps(m.c, m.role);
      const at = steps.indexOf(own[0]);
      steps.splice(at + 1, 0, ...loop.filter(x => !/^변주/.test(x)).map(x => ({ id: m.id, t: x, full: x })));
    });
  } else {
    seq.forEach(m => { const r = teamRot(m.c, m.modeKey, ids); ((r && r.loop) || genericSteps(m.c, m.role)).forEach(x => steps.push({ id: m.id, t: x, full: x })); });
  }
  seq.forEach(m => {
    const own = steps.filter(x => x.id === m.id); const sum = own.reduce((a, x) => a + stepWeight(x.t), 0) || 1;
    own.forEach(x => { x.d = stepWeight(x.t) * m.ft / sum; });
  });
  let t = 0; steps.forEach(x => { x.s = t; t += x.d; });
  return { steps, total: t };
}
function rotationHTML(r, key) {
  const [M, Sb, P] = r.team;
  const members = r.team.filter(Boolean);
  if (members.length === 1) {
    return `<details class="buffs"><summary>딜 사이클 · 약 ${r.rot.toFixed(0)}초</summary><ol class="rot-list">${memberRotHTML(members[0], { first: true })}</ol>
      <div class="note">단일 캐릭터 칸은 변주·반주 버프 없이 본인 딜만 계산합니다.</div></details>`;
  }
  const seq = (r.ord === 1 ? [Sb, P, M] : [P, Sb, M]).filter(Boolean);
  const mainOut = r.out.find(x => x.m === M);
  const fromNext = mainOut ? mainOut.applied.filter(b => b.to === 'next') : [];
  const buffs = fromNext.length ? [...new Set(fromNext.map(b => `${b.owner.c.name} ${buffLabel(b)} ${buffVal(b)}`))].map(esc).join(', ') : '';
  const items = seq.map((m, i) => memberRotHTML(m, { first: i === 0, intoMain: seq[i + 1] === M, buffs: m === M ? buffs : '', ids: members.map(x => x.id), pc: 'p' + (i + 1) })).join('');
  const pcOf = {}; seq.forEach((m, i) => { pcOf[m.id] = 'p' + (i + 1); });
  const legend = `<div class="seq-legend"><span class="muted">색 구분</span>${seq.map((m, i) => `<span class="lg p${i + 1}">${portraitHTML(m.c)}<span class="ord">${i + 1}</span>${esc(m.c.name)}</span>`).join('')}</div>`;
  const ids = members.map(m => m.id);
  const tr = TEAM_ROT.filter(t => t.has.every(id => ids.includes(id)));
  const notes = tr.map(t => `<div class="note team-note">${esc(t.t)}${t.src ? ` <span class="muted">출처: ${esc(t.src)}</span>` : ''}</div>${t.seq ? teamSeqHTML(t.seq, pcOf) : ''}`).join('');
  const chainNote = M && M.c.id === 'hsin' && M.chain >= 2 ? '<div class="note">여우의 별자리 2체인: 전투 개막 시 강화 강공격이 충전된 상태라 필드 시간이 약 2초 짧아집니다.</div>' : '';
  return `<details class="buffs"><summary>딜 사이클 · 약 ${r.rot.toFixed(0)}초 (${seq.map(m => esc(m.c.name)).join(' → ')})</summary>
    ${legend}${key ? `<div style="margin:4px 0 10px"><button class="btn sm primary" data-tlopen="${key}">타임라인으로 크게 보기 →</button></div>` : ''}${notes}<ol class="rot-list">${items}</ol>${chainNote}
    ${r.autoRot < r.rot ? `<div class="note">필드 시간 합은 약 ${r.autoRot.toFixed(0)}초지만, 공명 해방 쿨타임 때문에 한 바퀴는 최소 ${r.rot.toFixed(0)}초로 계산합니다.</div>` : ''}<div class="note">필드 시간은 가이드 기준 추정치이고, 파티 사이클 시간은 세 캐릭터 필드 시간의 합입니다. 출처: Prydwen 로테이션 가이드, 아카라이브 명조 채널.</div></details>`;
}

function bindPartyEvents() {
  $$('#parties [data-swap]').forEach(b => b.addEventListener('click', () => { const [pi, si] = b.dataset.swap.split(':').map(Number); openSwap({ pi, si }); }));
  $$('#parties [data-cfg]').forEach(b => b.addEventListener('click', () => openCharCfg(b.dataset.cfg)));
  $$('#parties [data-tlopen]').forEach(b => b.addEventListener('click', () => { state.tlSel = b.dataset.tlopen; switchTab('timeline'); window.scrollTo(0, 0); }));
  $$('#parties [data-mode]').forEach(s => s.addEventListener('change', () => { if (s.value) state.forced[s.dataset.mode] = s.value; else delete state.forced[s.dataset.mode]; save(); renderBuild(); }));
  $$('#parties [data-lock]').forEach(b => b.addEventListener('click', () => {
    const p = state.parties[+b.dataset.lock]; p.locked = !p.locked; save(); renderBuild();
    toast(p.locked ? '이 파티는 자동 편성 때 그대로 둡니다.' : '고정을 풀었습니다.');
  }));
}

/* ---------- 캐릭터 설정 (체인·무기·세트·에코 옵션·내 스탯) ---------- */
function setLabel(mem) { const n = id => (RAW_SETS[id] || {}).n || ''; return mem.sets2 && mem.sets2.length ? `${n(mem.setId)} ${setPieces(mem.setId)}세트 + ${mem.sets2.map(x => n(x) + ' 2세트').join(' + ')}` : `${n(mem.setId)} 5세트`; }
function echoMainOpts(c, cost, cur) {
  const M = ECHO_MAIN[cost] || {}; const keys = Object.keys(M).filter(k => k !== '_sec');
  const sel = keys.includes(cur) ? cur : keys[0];
  return keys.map(k => `<option value="${k}" ${k === sel ? 'selected' : ''}>${k === 'el' ? EL[c.el].n + ' 피해 보너스' : ECHO_MAIN_N[k] || k} ${M[k]}%</option>`).join('');
}
function echoSlotHTML(c, x, i) {
  const subs = (x.sub || []).slice(0, 5); while (subs.length < 5) subs.push(['', '']);
  const kOpts = cur => `<option value="">— 부옵션 —</option>` + Object.keys(ECHO_SUB).map(k => `<option value="${k}" ${k === cur ? 'selected' : ''}>${esc(subLabel(k))}</option>`).join('');
  return `<div class="ec-slot"><div class="ec-head"><b>에코 ${i + 1}</b>
      <select class="ec-c" aria-label="에코 ${i + 1} 코스트">${ECHO_COSTS.map(n => `<option value="${n}" ${n === +x.c ? 'selected' : ''}>코스트 ${n}</option>`).join('')}</select></div>
    <label class="ec-main">주옵션<select class="ec-m">${echoMainOpts(c, +x.c, x.m)}</select><span class="ec-sec note"></span></label>
    ${subs.map(([k, v], j) => { const d = ECHO_SUB[k]; return `<div class="ec-sub"><select class="ec-sk" aria-label="부옵션 ${j + 1}">${kOpts(k)}</select><input class="ec-sv num" type="number" step="0.1" min="0" inputmode="decimal" aria-label="부옵션 ${j + 1} 수치" value="${v === '' || v === undefined ? '' : v}" ${d ? `list="ec-dl-${k}" max="${d[1][d[1].length - 1]}" placeholder="${d[1][0]}~${d[1][d[1].length - 1]}"` : ''}></div>`; }).join('')}
  </div>`;
}
function openCharCfg(id) {
  const c = CH[id]; const o = state.ov[id] || {}; const st = o.st || {};
  const sc0 = scaleOf(c); const PK = [sc0, 'cr', 'cd', 'el'];
  const ech = (o.echo && Array.isArray(o.echo.e)) ? o.echo : ECHO_DEFAULT(sc0);
  const mode0 = st.on ? 'panel' : (ech.on ? 'echo' : 'est');
  const mem = resolveMember(id, c.modes ? Object.keys(c.modes)[0] : null, state.ov, state.settings);
  const est = panelEstimate(id, state.settings, { ...state.ov, [id]: { ...o, st: null } });
  const wOpts = weaponsForType(c.wt).map(w => `<option value="${w.id}" ${w.id === mem.weaponId ? 'selected' : ''}>${w.q === 5 ? '★5' : '★4'} ${esc(w.n)}</option>`).join('');
  const sOpts = Object.entries(RAW_SETS).map(([sid, s]) => `<option value="${sid}" ${+sid === +mem.setId ? 'selected' : ''}>${esc(s.n)}</option>`).join('');
  const num = (k, label, ph, step = '0.1') => `<label>${label}<input type="number" id="cf-st-${k}" step="${step}" min="0" value="${st[k] ?? ''}" placeholder="${ph}"></label>`;
  $('#char-title').textContent = `${c.name} 설정`;
  $('#char-body').innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px"><div style="width:56px;flex:0 0 56px">${portraitHTML(c)}</div>
      <div class="note">${elTag(c.el)} · ${WT[c.wt]} · ${c.q}성 · ${ROLE_N[c.role]}</div></div>
    <div class="cfg-grid">
      <label>공명 체인<select id="cf-c">${[0, 1, 2, 3, 4, 5, 6].map(n => `<option value="${n}" ${n === mem.chain ? 'selected' : ''}>${n}체인</option>`).join('')}</select></label>
      <label>무기<select id="cf-w">${wOpts}</select></label>
      <label>재련<select id="cf-r">${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${n === mem.refine ? 'selected' : ''}>${n}재련</option>`).join('')}</select></label>
      <label>에코 세트 (메인)<select id="cf-s">${sOpts}</select></label>
    </div>
    <div class="cfg-grid" id="cf-s2wrap" style="margin-top:10px"></div>
    <div class="cfg-sec">
      <h4 style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">스킬 레벨 <button type="button" class="btn sm ghost" id="cf-sl-max">모두 10</button></h4>
      <p class="note" style="margin:0 0 10px">게임 → 공명자 → <b>공명 회로(스킬)</b> 화면의 레벨을 넣으세요. 기본값은 모두 10입니다. 레벨 1은 10의 약 50% 배율입니다.</p>
      <div class="cfg-grid sl-grid">${SK_TREES.map(([k, n]) => `<label>${n}<select class="cf-sl" data-k="${k}">${[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(v => `<option value="${v}" ${v === mem.sl[k] ? 'selected' : ''}>Lv.${v}</option>`).join('')}</select></label>`).join('')}</div>
      <p class="note" id="cf-sl-eff" style="margin:8px 0 0"></p>
    </div>
    <div class="cfg-sec">
      <h4>스탯 계산 기준</h4>
      <div class="seg" id="cf-mode" role="radiogroup" style="margin-bottom:6px">${[['est', '추정치'], ['echo', '에코 옵션 입력'], ['panel', '속성 화면 스탯']].map(([v, n]) => `<button type="button" data-v="${v}" aria-pressed="${v === mode0}">${n}</button>`).join('')}</div>
      <p class="note" id="cf-mode-note" style="margin:0"></p>
    </div>
    <div class="cfg-sec" id="cf-echo-sec">
      <h4 style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">에코 옵션 <span style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="btn sm ghost" id="cf-ec-std">기본 구성 4-3-3-1-1</button><button type="button" class="btn sm ghost" id="cf-ec-clear">부옵션 지우기</button></span></h4>
      <p class="note" style="margin:0 0 10px">게임 → 공명자 → <b>에코</b> 화면에서 에코 5개의 코스트·주옵션·부옵션을 옮겨 적으세요. 주옵션은 5성 +25 기준 값이 자동으로 들어가고, 부옵션은 단계 값 중에서 고르거나 직접 입력합니다(최대치를 넘으면 최대치로 계산). 소나타 세트는 위의 에코 세트에서 고릅니다. 캐릭터 기본 공격력·크리티컬(5% / 150%)과 공명 노드 보너스는 게임 데이터로 자동 반영됩니다.</p>
      <div class="ec-grid" id="cf-ec">${ech.e.slice(0, 5).map((x, i) => echoSlotHTML(c, x, i)).join('')}</div>
      ${Object.entries(ECHO_SUB).map(([k, d]) => `<datalist id="ec-dl-${k}">${d[1].map(v => `<option value="${v}">`).join('')}</datalist>`).join('')}
      <div class="ec-sum" id="cf-ec-sum" aria-live="polite"></div>
    </div>
    <div class="cfg-sec" id="cf-panel-sec">
      <h4>속성 화면 스탯</h4>
      <p class="note" style="margin:0 0 10px">게임 → 공명자 → <b>속성</b> 화면의 숫자를 그대로 넣으세요. 무기·에코·상시 효과가 이미 포함된 값이라 다시 더하지 않고, 반주·조건부 버프만 추가로 계산합니다. 비워 두면 회색 추정치를 씁니다.</p>
      <div class="cfg-grid">
        ${sc0 === 'atk' ? num('atk', '공격력', est.atk, '1') : num(sc0, sc0 === 'hp' ? 'HP (HP 비례 캐릭터)' : '방어력', est[sc0], '1')}${num('cr', '크리티컬 (%)', est.cr)}${num('cd', '크리티컬 피해 (%)', est.cd)}${num('el', `${EL[c.el].n} 피해 보너스 (%)`, est.el)}
      </div>
      <details style="margin-top:10px"><summary class="note" style="cursor:pointer">공격 유형 피해 보너스 (속성 화면에 있으면 입력 · 비워 두면 회색 추정치)</summary>
        <div class="cfg-grid" style="margin-top:8px">${num('n', '일반 공격 (%)', est.dtp.n || 0)}${num('h', '강공격 (%)', est.dtp.h || 0)}${num('s', '공명 스킬 (%)', est.dtp.s || 0)}${num('l', '공명 해방 (%)', est.dtp.l || 0)}</div></details>
    </div>
    <div class="cfg-actions">
      <button class="btn sm" id="cf-reset">기본값으로</button>
      <button class="btn primary sm" id="cf-save">저장하고 다시 계산</button>
    </div>`;
  const paintS2 = (keep) => {
    const sid = +$('#cf-s').value; const n = set2Count(sid);
    const cur = keep ? mem.sets2 : defaultSets2(c, sid);
    const opts2 = sel => Object.entries(RAW_SETS).filter(([k]) => has2pc(k)).map(([k, v]) => `<option value="${k}" ${+k === +sel ? 'selected' : ''}>${esc(v.n)} (2세트: ${esc((v.e.find(x => x[0] === 2) || [0, ''])[1])})</option>`).join('');
    $('#cf-s2wrap').innerHTML = n ? Array.from({ length: n }, (_, i) => `<label>보조 2세트 ${n > 1 ? i + 1 : ''}<select class="cf-s2">${opts2(cur[i])}</select></label>`).join('') + `<p class="note" style="grid-column:1/-1;margin:0">${setPieces(sid)}세트 효과 + 2세트 ${n}개 구성입니다.</p>` : '';
  };
  paintS2(true);
  const paintSL = () => {
    const sl = {}; $$('.cf-sl').forEach(x => { sl[x.dataset.k] = +x.value; });
    const m2 = { ...mem, sl: skillLevels({ sl }) };
    const tot = Object.entries(mem.p).reduce((a, [dt, sh]) => a + sh * skillLvFactor(m2, dt), 0) / Object.values(mem.p).reduce((a, b) => a + b, 0);
    $('#cf-sl-eff').textContent = `현재 레벨로 본인 피해는 모두 10일 때의 약 ${(tot * 100).toFixed(1)}%입니다.`;
  };
  $$('.cf-sl').forEach(x => x.addEventListener('change', paintSL)); paintSL();
  $('#cf-sl-max').addEventListener('click', () => { $$('.cf-sl').forEach(x => { x.value = '10'; }); paintSL(); });
  $('#cf-s').addEventListener('change', () => paintS2(false));
  let mode = mode0;
  const readEcho = () => ({ on: mode === 'echo', e: $$('#cf-ec .ec-slot').map(sl => ({ c: +$('.ec-c', sl).value, m: $('.ec-m', sl).value,
    sub: $$('.ec-sub', sl).map(r => [$('.ec-sk', r).value, $('.ec-sv', r).value === '' ? 0 : +$('.ec-sv', r).value]).filter(([k, v]) => k && v > 0) })) });
  const paintMode = () => {
    $$('#cf-mode button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === mode));
    $('#cf-echo-sec').hidden = mode !== 'echo'; $('#cf-panel-sec').hidden = mode !== 'panel';
    $('#cf-mode-note').textContent = mode === 'est' ? `설정의 에코 완성도(${(ECHO_PRESETS[state.settings.preset] || ECHO_PRESETS.std).n}) 추정치로 계산합니다.`
      : mode === 'echo' ? '에코 5개의 주옵션·부옵션을 더해 스탯을 만들고, 무기·소나타·반주 버프는 그 위에 따로 계산합니다.'
      : '속성 화면 숫자에 이미 무기·에코·상시 효과가 들어 있으므로, 반주·조건부 버프만 더합니다.';
    if (mode === 'panel') PK.forEach(k => { const el = $('#cf-st-' + k); if (!el.value) el.value = est[k]; });
    if (mode === 'echo') paintEcho();
  };
  const ownDmg = ov2 => { try { const r = calcTeam([id, null, null], { ...ctxFor(null), zone: null, season: null, ov: ov2 }); return r.out[0] ? r.out[0].total : 0; } catch (e) { return 0; } };
  const paintEcho = () => {
    $$('#cf-ec .ec-slot').forEach(sl => { const cst = +$('.ec-c', sl).value; const cur = $('.ec-m', sl).value; $('.ec-m', sl).innerHTML = echoMainOpts(c, cst, cur); const M = ECHO_MAIN[cst]; $('.ec-sec', sl).textContent = M && M._sec ? `+ ${M._sec[0] === 'hp' ? 'HP' : '공격력'} ${M._sec[1]}` : ''; });
    const e = readEcho(); const t = echoSum(e); const ovE = { ...state.ov, [id]: { ...o, st: null, echo: { ...e, on: true } } };
    const pe = panelEstimate(id, state.settings, ovE);
    const d0 = ownDmg({ ...state.ov, [id]: { ...o, st: null, echo: { ...e, on: false } } }), d1 = ownDmg(ovE);
    const dtb = ['n', 'h', 's', 'l'].filter(k => pe.dt && pe.dt[k]).map(k => `${DT[k]} ${pe.dt[k]}%`).join(' · ');
    $('#cf-ec-sum').innerHTML = `<div class="ec-cost ${t.cost > 12 ? 'bad' : ''}">코스트 <b class="num">${t.cost}</b> / 12${t.cost > 12 ? ' · 12를 넘었습니다' : ''}</div>
      <div class="ec-stats num">${pe.scale !== 'atk' && pe[pe.scale] ? `<span>${pe.scale === 'hp' ? 'HP' : '방어력'} <b>${fmt(pe[pe.scale])}</b></span>` : `<span>공격력 <b>${fmt(pe.atk)}</b></span>`}<span>크리티컬 <b>${pe.cr}%</b></span><span>크리티컬 피해 <b>${pe.cd}%</b></span><span>${EL[c.el].n} 피해 <b>${pe.el}%</b></span><span>공명 효율 <b>${(pe.er || 100).toFixed(1)}%</b></span>${dtb ? `<span>${dtb}</span>` : ''}</div>
      <div class="note">속성 화면 예상치(무기·소나타 상시 효과 포함). 크리티컬 기대값 ${(1 + Math.min(pe.cr, 100) / 100 * (pe.cd / 100 - 1)).toFixed(3)}배 · 본인 1사이클 피해는 추정치보다 <b class="${d1 >= d0 ? 'up' : 'down'}">${d0 ? ((d1 / d0 - 1) * 100 >= 0 ? '+' : '') + ((d1 / d0 - 1) * 100).toFixed(1) + '%' : '-'}</b></div>`;
  };
  $$('#cf-mode button').forEach(b => b.addEventListener('click', () => { mode = b.dataset.v; paintMode(); }));
  $('#cf-ec').addEventListener('change', paintEcho); $('#cf-ec').addEventListener('input', e => { if (e.target.classList.contains('ec-sv')) paintEcho(); });
  $('#cf-ec').addEventListener('change', e => { if (e.target.classList.contains('ec-sk')) { const inp = e.target.parentElement.querySelector('.ec-sv'); inp.setAttribute('list', 'ec-dl-' + e.target.value); const d = ECHO_SUB[e.target.value]; inp.max = d ? d[1][d[1].length - 1] : ''; inp.placeholder = d ? `${d[1][0]}~${d[1][d[1].length - 1]}` : ''; if (!e.target.value) inp.value = ''; } });
  $('#cf-ec-std').addEventListener('click', () => { const keep = readEcho(); const d = ECHO_DEFAULT(sc0); $('#cf-ec').innerHTML = d.e.map((x, i) => echoSlotHTML(c, { ...x, sub: (keep.e[i] || {}).sub || [] }, i)).join(''); paintEcho(); });
  $('#cf-ec-clear').addEventListener('click', () => { $$('#cf-ec .ec-sk').forEach(x => { x.value = ''; }); $$('#cf-ec .ec-sv').forEach(x => { x.value = ''; }); paintEcho(); });
  paintMode();
  $('#cf-save').addEventListener('click', () => {
    const g = k => { const v = $('#cf-st-' + k).value; return v === '' ? undefined : +v; };
    const nst = { on: mode === 'panel' }; [...PK, 'n', 'h', 's', 'l'].forEach(k => { const v = g(k); if (v !== undefined) nst[k] = v; });
    if (nst.on) PK.forEach(k => { if (nst[k] === undefined) nst[k] = est[k]; });
    if (nst.on) ['n', 'h', 's', 'l'].forEach(k => { if (nst[k] === undefined && est.dtp[k]) nst[k] = est.dtp[k]; });
    state.ov[id] = { ...o, c: +$('#cf-c').value, w: +$('#cf-w').value, r: +$('#cf-r').value, s: +$('#cf-s').value, s2: $$('.cf-s2').map(x => +x.value), st: nst, echo: readEcho(), sl: Object.fromEntries($$('.cf-sl').map(x => [x.dataset.k, +x.value])) };
    if (state.ov[id].echo === undefined) delete state.ov[id].echo;
    save(); closeDlg('#dlg-char'); rerenderTab(); toast(`${c.name} 설정을 저장했습니다.`);
  });
  $('#cf-reset').addEventListener('click', () => { delete state.ov[id]; save(); closeDlg('#dlg-char'); rerenderTab(); toast(`${c.name} 설정을 기본값으로 되돌렸습니다.`); });
  const d = $('#dlg-char'); if (d.showModal) d.showModal(); else d.setAttribute('open', '');
}
function closeDlg(sel) { const d = $(sel); if (d.close) d.close(); else d.removeAttribute('open'); }
function rerenderTab() { switchTab(state.tab); }


/* ---------- 내 데이터 내보내기 / 불러오기 ---------- */
const IN_ARTIFACT = !!(window.claude && window.claude.use);
async function exportData() {
  const data = { app: 'ddingjo-atm', v: 2, owned: [...state.owned], ov: state.ov, forced: state.forced, settings: state.settings, parties: state.parties };
  const d0 = new Date(); const fname = `ddingjo-mydata-${d0.getMonth() + 1}${String(d0.getDate()).padStart(2, '0')}.json`;
  if (IN_ARTIFACT) {
    const dl = await window.claude.use('downloads').catch(() => null);
    if (!dl) { $('#data-msg').textContent = '이 화면에서는 파일 저장을 쓸 수 없습니다.'; return; }
    try { await dl.save({ filename: fname, data: JSON.stringify(data, null, 1) }); $('#data-msg').textContent = '파일을 저장했습니다.'; }
    catch (e) { $('#data-msg').textContent = e && e.code === 'declined' ? '저장을 취소했습니다.' : '파일을 저장하지 못했습니다.'; }
    return;
  }
  const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = fname;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  $('#data-msg').textContent = '파일을 저장했습니다.';
}
function importData(file) {
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const d = JSON.parse(fr.result); if (d.app !== 'ddingjo-atm') throw new Error('형식');
      state.owned = new Set((d.owned || []).filter(id => CH[id])); state.ov = d.ov || {}; state.forced = d.forced || {};
      state.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) }; state.parties = d.parties || [];
      save(); location.reload();
    } catch (e) { $('#data-msg').textContent = '띵조 AUTO TEAM MAKER에서 내보낸 파일이 아닙니다.'; }
  };
  fr.readAsText(file);
}

/* ---------- 공유 코드 ----------
   설정을 JSON → deflate 압축 → base64url로 바꾼 코드. 불러올 때는 내용을 먼저 보여 주고 확인을 받은 뒤 덮어씁니다. */
const SHARE_PREFIX = 'DJ1.';
const b64u = { enc: u8 => { let s = ''; u8.forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec: t => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(s, ch => ch.charCodeAt(0)); } };
async function zipBytes(u8, mode) {
  if (typeof CompressionStream === 'undefined') return null;
  const st = new Blob([u8]).stream().pipeThrough(mode === 'c' ? new CompressionStream('deflate-raw') : new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(st).arrayBuffer());
}
function sharePayload(withSt) {
  const ov = {};
  Object.entries(state.ov).forEach(([id, o]) => { const x = { ...o }; if (!withSt) { delete x.st; delete x.echo; } if (Object.keys(x).length) ov[id] = x; });
  return { a: 'ddingjo-atm', v: 1, ver: APP_VERSION, o: [...state.owned], ov, f: state.forced, s: state.settings, p: state.parties.map(p => ({ slot: p.slot, ids: p.ids, locked: !!p.locked })) };
}
async function makeShareCode(withSt) {
  const raw = new TextEncoder().encode(JSON.stringify(sharePayload(withSt)));
  const z = await zipBytes(raw, 'c').catch(() => null);
  return z ? SHARE_PREFIX + b64u.enc(z) : 'DJ0.' + b64u.enc(raw); // 압축을 못 쓰는 브라우저는 압축 없이
}
async function readShareCode(code) {
  code = String(code || '').trim().replace(/^.*[#?&]share=/, '').replace(/\s+/g, '');
  let bytes;
  if (code.startsWith(SHARE_PREFIX)) bytes = await zipBytes(b64u.dec(code.slice(4)), 'd');
  else if (code.startsWith('DJ0.')) bytes = b64u.dec(code.slice(4));
  else throw new Error('prefix');
  if (!bytes) throw new Error('nozip');
  const d = JSON.parse(new TextDecoder().decode(bytes));
  if (d.a !== 'ddingjo-atm') throw new Error('app');
  return d;
}
function applyShare(d) {
  state.owned = new Set((d.o || []).filter(id => CH[id]));
  const ov = {}; Object.entries(d.ov || {}).forEach(([id, o]) => { if (CH[id]) ov[id] = { ...o, st: o.st || (state.ov[id] && state.ov[id].st), echo: o.echo || (state.ov[id] && state.ov[id].echo) }; });
  Object.entries(state.ov).forEach(([id, o]) => { if (!ov[id] && (o.st || o.echo)) ov[id] = { st: o.st, echo: o.echo }; }); // 코드에 스탯이 없으면 내 스탯은 남겨 둠
  state.ov = ov; state.forced = d.f || {};
  state.settings = { ...DEFAULT_SETTINGS, ...(d.s || {}) };
  state.parties = (d.p || []).filter(p => SLOT[p.slot]).map(p => ({ slot: p.slot, ids: (p.ids || []).map(id => (id && CH[id]) ? id : null), locked: !!p.locked }));
  save(); ensureParties(); switchTab('tower-build');
}
function openShare(prefill) {
  $('#share-out').value = ''; $('#share-copy').disabled = true; $('#share-len').textContent = '';
  $('#share-in').value = prefill || ''; $('#share-preview').innerHTML = '';
  $('#share-st').checked = false;
  const d = $('#dlg-share'); if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  if (prefill) checkShare();
}
async function checkShare() {
  const box = $('#share-preview');
  let d;
  try { d = await readShareCode($('#share-in').value); }
  catch (e) { box.innerHTML = '<span style="color:var(--bad)">띵조 AUTO TEAM MAKER 공유 코드가 아니거나, 복사할 때 일부가 잘렸습니다.</span>'; return; }
  const parties = (d.p || []).filter(p => (p.ids || []).some(Boolean));
  const teamTxt = parties.map((p, i) => `${i + 1}파티: ${(p.ids || []).filter(Boolean).map(id => CH[id] ? CH[id].name : '?').join(' · ')}`);
  const cfgN = Object.keys(d.ov || {}).length; const stN = Object.values(d.ov || {}).filter(o => o.st || o.echo).length;
  box.innerHTML = `<div class="share-sum"><div><b>보유 ${(d.o || []).length}명</b> · 캐릭터 설정 ${cfgN}명${stN ? ` · 스탯·에코 포함 ${stN}명` : ''} · 파티 ${parties.length}개 ${d.ver ? `<span class="muted">(Ver. ${esc(d.ver)}에서 만든 코드)</span>` : ''}</div>
    ${teamTxt.length ? `<div class="muted">${teamTxt.map(esc).join('<br>')}</div>` : ''}
    <div style="color:var(--warn)">불러오면 지금 보유 캐릭터·캐릭터 설정·파티가 이 내용으로 바뀝니다. 필요하면 먼저 설정 → 내 데이터 → 파일로 내보내기로 백업하세요.</div>
    <div class="toolbar" style="margin:0"><button class="btn sm primary" id="share-apply">이 내용으로 바꾸기</button><button class="btn sm ghost" id="share-cancel">취소</button></div></div>`;
  $('#share-apply').addEventListener('click', () => { applyShare(d); closeDlg('#dlg-share'); toast('공유 코드 내용으로 바꿨습니다.'); });
  $('#share-cancel').addEventListener('click', () => { box.innerHTML = ''; });
}
function bindShare() {
  $('#btn-share').addEventListener('click', () => openShare());
  $('#share-close').addEventListener('click', () => closeDlg('#dlg-share'));
  $('#dlg-share').addEventListener('click', e => { if (e.target.id === 'dlg-share') closeDlg('#dlg-share'); });
  $('#share-text').addEventListener('click', copyText);
  $('#share-make').addEventListener('click', async () => {
    const code = await makeShareCode($('#share-st').checked);
    $('#share-out').value = code; $('#share-copy').disabled = false; $('#share-len').textContent = `${code.length}자`;
  });
  $('#share-copy').addEventListener('click', () => copyStr($('#share-out').value, '공유 코드를 복사했습니다.'));
  $('#share-check').addEventListener('click', checkShare);
  // 주소 끝에 #share=코드 가 붙어 있으면 확인 창을 띄움(바로 덮어쓰지 않음)
  const h = (location.hash || '').match(/share=([^&]+)/);
  if (h) { setTimeout(() => openShare(decodeURIComponent(h[1])), 300); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } }
}

/* ---------- 교체 대화상자 ---------- */
function openSwap(ctx) {
  state.swap = ctx;
  const sl = SLOT[state.parties[ctx.pi].slot];
  $('#swap-title').textContent = sl.type === 'solo' ? `${ctx.pi + 1}파티 단일 캐릭터 선택` : `${ctx.pi + 1}파티 ${['메인', '서브', '서포터'][ctx.si]} 교체`;
  renderSwap();
  const d = $('#dlg-swap'); if (d.showModal) d.showModal(); else d.setAttribute('open', '');
}
function renderSwap() {
  const filters = [['all', '전체'], ['main', '메인'], ['sub', '서브'], ['sup', '서포터'], ...Object.entries(EL).map(([k, v]) => [k, v.n])];
  $('#swap-filter').innerHTML = filters.map(([k, n]) => `<button class="fbtn" data-f="${k}" aria-pressed="${state.swapFilter === k}">${n}</button>`).join('') + '<button class="fbtn" data-f="__clear">슬롯 비우기</button>';
  const { pi, si } = state.swap;
  const usedElsewhere = new Set();
  state.parties.forEach((p, i) => p.ids.forEach((id, j) => { if (id && !(i === pi && j === si)) usedElsewhere.add(gk(id)); }));
  const list = CHARS.filter(c => state.owned.has(c.id)).filter(c => { const f = state.swapFilter; if (f === 'all') return true; if (EL[f]) return c.el === f; return c.role === f; });
  $('#swap-grid').innerHTML = list.map(c => {
    const inSame = state.parties[pi].ids.some((id, j) => id && j !== si && gk(id) === gk(c.id));
    const used = usedElsewhere.has(gk(c.id)) && !inSame;
    const why = c.id.startsWith('rover_') && used ? '방랑자는 피로도를 공유합니다' : '다른 파티에 배치됨';
    return `<button class="rc" data-pick="${c.id}" ${used ? `disabled title="${why}"` : ''}>${portraitHTML(c)}<span class="nm">${esc(c.name)}</span><span class="sub">${EL[c.el].n} · ${ROLE_N[c.role].split('·')[0]}${isUpcoming(c) ? ' · ' + releaseLabel(c) : ''}${used ? ' · 사용 중' : ''}</span></button>`;
  }).join('') || '<p class="muted">보유한 캐릭터가 없습니다.</p>';
  $$('#swap-filter .fbtn').forEach(b => b.addEventListener('click', () => { if (b.dataset.f === '__clear') { pick(null); return; } state.swapFilter = b.dataset.f; renderSwap(); }));
  $$('#swap-grid [data-pick]').forEach(b => b.addEventListener('click', () => pick(b.dataset.pick)));
}
function pick(id) {
  const { pi, si } = state.swap; const p = state.parties[pi];
  if (id) { const at = p.ids.findIndex(x => x && gk(x) === gk(id)); if (at >= 0 && at !== si) p.ids[at] = p.ids[si]; }
  p.ids[si] = id; closeSwap(); save(); renderBuild();
}
function closeSwap() { const d = $('#dlg-swap'); if (d.close) d.close(); else d.removeAttribute('open'); }

/* ---------- 필드 파티 ---------- */
function renderField() {
  const pool = availableIds(state); const el = $('#field-list');
  if (pool.length < 3) { el.innerHTML = '<div class="card">보유 캐릭터를 3명 이상 선택하면 필드 파티를 추천합니다.</div>'; return; }
  const ctx = { settings: state.settings, ov: state.ov, forcedModes: state.forced, zone: null, season: null };
  let cands = candidateTeams(pool, ctx, { k: 8 }).slice(0, 200);
  if (state.fieldHeal === 'need') cands = cands.filter(t => t.hasHeal);
  const maxD = Math.max(...cands.map(t => t.totalDmg), 1);
  const W = state.fieldPref === 'comfort' ? { d: .45, s: .35, a: .12, m: .08 } : { d: .75, s: .15, a: .07, m: .03 };
  const scored = cands.map(t => {
    const ms = t.ids.filter(Boolean).map(id => CH[id]);
    const healers = ms.filter(c => c.ap.includes('heal')).length;
    const sustain = Math.min(1, healers * .75 + (t.hasShield ? .25 : 0));
    const aoe = ms.filter(c => (c.f || []).includes('aoe')).length / 3;
    const conv = ms.some(c => (c.f || []).some(x => x === 'move' || x === 'group')) ? 1 : 0;
    return { t, sc: 100 * (W.d * t.totalDmg / maxD + W.s * sustain + W.a * aoe + W.m * conv), healers, aoe, conv };
  }).sort((a, b) => b.sc - a.sc);
  const perMain = {}; const top = [];
  for (const x of scored) { const m = x.t.ids[0]; perMain[m] = (perMain[m] || 0) + 1; if (perMain[m] <= 2) top.push(x); if (top.length >= 8) break; }
  el.innerHTML = top.length ? top.map((x, i) => `<div class="field-row">
      <div class="rank">${i + 1}</div>
      <div style="min-width:0">
        <div class="mini-team">${x.t.ids.filter(Boolean).map(id => `<div class="mini">${portraitHTML(CH[id])}<div>${esc(CH[id].name)}</div></div>`).join('')}</div>
        <div class="chips" style="margin-top:6px">${x.healers ? `<span class="chip ok">힐러 ${x.healers}</span>` : '<span class="chip warn">힐러 없음</span>'}${x.t.hasShield ? '<span class="chip ok">실드</span>' : ''}${x.aoe ? `<span class="chip">광역 ${Math.round(x.aoe * 3)}</span>` : ''}${x.conv ? '<span class="chip">이동·모으기</span>' : ''}<span class="chip">1사이클&nbsp;<span class="num">${fmt(x.t.totalDmg)}</span></span><span class="chip">약 ${Math.round(x.t.rot)}초</span></div>
      </div>
      <div style="text-align:right"><div class="score">${x.sc.toFixed(0)}</div><div class="note">필드 점수</div></div>
    </div>`).join('') : '<div class="card">조건에 맞는 조합이 없습니다. 힐러 필수를 해제해 보세요.</div>';
}

function loadTeam(ids, pi) {
  ensureParties();
  const p = state.parties[pi]; const solo = SLOT[p.slot].type === 'solo';
  const want = solo ? [ids[0], null, null] : ids.slice(0, 3);
  state.parties.forEach((q, i) => { if (i !== pi) q.ids = q.ids.map(id => id && want.some(w => w && gk(w) === gk(id)) ? null : id); });
  p.ids = want; save(); switchTab('tower-build'); toast(`${pi + 1}파티에 넣었습니다.`);
}

/* ---------- 추천 조합 ---------- */
function renderPresets() {
  const tags =[['all', '전체'], ['역경의 탑', '역경의 탑'], ['입문', '입문'], ['필드', '필드']];
  $('#preset-filter').innerHTML = tags.map(([k, n]) => `<button class="fbtn" data-pf="${k}" aria-pressed="${state.presetFilter === k}">${n}</button>`).join('');
  $$('#preset-filter .fbtn').forEach(b => b.addEventListener('click', () => { state.presetFilter = b.dataset.pf; renderPresets(); }));
  const ctx = { settings: state.settings, ov: state.ov, forcedModes: state.forced, zone: null, season: null };
  const list = PRESETS.filter(p => state.presetFilter === 'all' || p.tag === state.presetFilter);
  ensureParties();
  const opts = state.parties.map((p, i) => SLOT[p.slot].type === 'team' ? `<option value="${i}">${i + 1}파티 · ${esc(SLOT[p.slot].label)} ${esc(SLOT[p.slot].fl)}</option>` : '').join('');
  const TIER_N = { mid: '대체', f2p: '입문' };
  $('#preset-grid').innerHTML = list.map(p => {
    const r = bestTeam(p.m, ctx);
    const missing = p.m.filter(id => !state.owned.has(id));
    const modes = Object.entries(r.modes || {}).map(([id, mk]) => `<span class="chip acc">${esc(CH[id].modes[mk].n)}</span>`).join('');
    const up = p.m.filter(id => isUpcoming(CH[id])).map(id => `<span class="chip warn">${esc(CH[id].name)} ${esc(releaseLabel(CH[id]))}</span>`).join('');
    const vs = (p.v || []).filter(v => v.m.every(id => CH[id]));
    const vRes = vs.map(v => bestTeam(v.m, ctx));
    // 정석을 못 짜면, 보유 캐릭터로 짤 수 있는 대체 조합 중 피해가 가장 큰 것을 표시
    let firstOwned = -1; if (missing.length) vs.forEach((v, i) => { if (v.m.every(id => state.owned.has(id)) && (firstOwned < 0 || vRes[i].totalDmg > vRes[firstOwned].totalDmg)) firstOwned = i; });
    const vHTML = vs.length ? `<div class="pv-list"><div class="pv-h">대체 조합 <span class="muted">캐릭터가 부족할 때</span></div>${vs.map((v, i) => {
      const vr = vRes[i]; const miss = v.m.filter(id => !state.owned.has(id)).length; const pct = r.totalDmg ? Math.round(vr.totalDmg / r.totalDmg * 100) : 0;
      return `<div class="pv ${i === firstOwned ? 'pick' : ''}"><span class="chip ${v.k === 'f2p' ? 'ok' : ''}">${TIER_N[v.k]}</span>
        <div class="pv-team">${v.m.map(id => `<span class="pv-m ${state.owned.has(id) ? '' : 'missing'}" title="${esc(CH[id].name)}">${portraitHTML(CH[id])}<span>${esc(CH[id].name)}</span></span>`).join('')}</div>
        <div class="pv-info"><div class="note">${esc(v.n || '')}</div><div><b class="num">${fmt(vr.totalDmg)}</b> <span class="muted num">(정석의 ${pct}%)</span> ${miss ? `<span class="chip warn">미보유 ${miss}</span>` : '<span class="chip ok">전원 보유</span>'}${i === firstOwned ? ' <span class="chip acc">내 캐릭터로 최선</span>' : ''}</div></div>
        <button class="btn sm" data-pvload="${p.id}:${i}">편성에 넣기</button></div>`; }).join('')}</div>` : '';
    return `<article class="preset">
      <div><div class="chips" style="margin-bottom:6px"><span class="chip">${esc(p.tag)}</span>${modes}${missing.length ? `<span class="chip warn">미보유 ${missing.length}</span>` : '<span class="chip ok">전원 보유</span>'}${up}</div><h3>${esc(p.t)}</h3></div>
      <div class="mini-team">${p.m.map((id, i) => `<div class="mini ${state.owned.has(id) ? '' : 'missing'}">${portraitHTML(CH[id])}<div>${esc(CH[id].name)}</div><div class="muted">${['메인', '서브', '서포터'][i]}</div></div>`).join('')}</div>
      <p>${esc(p.d)}</p>
      <div class="foot"><div><span class="num" style="font-weight:600;font-size:17px">${fmt(r.totalDmg)}</span> <span class="note">1사이클 피해 · 약 ${Math.round(r.rot)}초 · 초당 ${fmt(r.dps)} (탑 버프 제외)</span></div>
        <span class="gear" style="max-width:100%"><select id="pl-${p.id}" aria-label="넣을 파티">${opts}</select><button class="btn sm" data-pload="${p.id}">편성에 넣기</button></span></div>
      ${vHTML}
    </article>`;
  }).join('');
  $$('#preset-grid [data-pvload]').forEach(b => b.addEventListener('click', () => { const [pid, i] = b.dataset.pvload.split(':'); const p = PRESETS.find(x => x.id === pid); const v = p.v.filter(v => v.m.every(id => CH[id]))[+i]; loadTeam(v.m.slice(), +$(`#pl-${p.id}`).value); }));
  $$('#preset-grid [data-pload]').forEach(b => b.addEventListener('click', () => { const p = PRESETS.find(x => x.id === b.dataset.pload); loadTeam(p.m.slice(), +$(`#pl-${p.id}`).value); }));
}

/* ---------- 역경의 탑 정보 + 자동 갱신 ---------- */
function towerTxtDict() { try { return JSON.parse(lsGet(LS_TOWER_TXT) || '{}'); } catch (e) { return {}; } }
const stripTags = s => String(s).replace(/<[^>]+>/g, '');
async function fetchJSON(path) { const r = await fetch(DATA_BASE + path, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status); return r.json(); }

async function refreshTower(force) {
  const cache = (() => { try { return JSON.parse(lsGet(LS_TOWER) || 'null'); } catch (e) { return null; } })();
  if (cache && cache.db) { setTowerDB({ ...RAW_TOWER, ...cache.db }); }
  if (!force && cache && Date.now() - cache.at < 6 * 3600000 && (cache.latest || 0) >= curSeason().n) {
    state.towerStatus = { kind: cache.missing && cache.missing.length ? 'warn' : 'ok', msg: `최신 데이터 확인 ${new Date(cache.at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · 시즌 ${cache.latest}까지 수록`, missing: cache.missing || [] };
    return;
  }
  if (IN_ARTIFACT) { state.towerStatus = { kind: 'ok', msg: `공유 링크 버전: 내장 탑 데이터(시즌 ${Math.max(...Object.keys(RAW_TOWER).map(Number))}까지)를 사용합니다. 새 시즌은 링크가 업데이트되면 반영됩니다.`, noBtn: true }; return; }
  state.towerStatus = { kind: 'busy', msg: '최신 탑 구성 확인 중…' }; paintUpdateBox();
  // 1) 사이트가 매일 게임 데이터로 만들어 두는 tower.json(한국어 포함) → 2) 없으면 게임 데이터를 직접 받음
  try {
    const r = await fetch(`${BASE}tower.json?h=${Math.floor(Date.now() / 36e5)}`, { cache: 'no-cache' });
    const d = r.ok ? await r.json() : null;
    if (d && d.db && Object.keys(d.db).length) {
      const latest = Math.max(...Object.keys(d.db).map(Number), ...Object.keys(RAW_TOWER).map(Number));
      lsSet(LS_TOWER, JSON.stringify({ at: Date.now(), db: d.db, missing: [], latest }));
      setTowerDB({ ...RAW_TOWER, ...d.db });
      state.towerStatus = { kind: 'ok', msg: `최신 데이터 확인 완료 · 시즌 ${latest}까지 수록${d.at ? ` · 게임 데이터 반영 ${mdhm(Date.parse(d.at))}` : ''}`, missing: [] };
      paintUpdateBox(); if (state.tab === 'tower-info') renderTowerInfo(); if (state.tab === 'tower-build') renderBuild(); if (curView === 'season' || curView === 'home') route(true);
      return;
    }
  } catch (e) { /* 아래 방법으로 */ }
  try {
    const [cfg, tb, mi] = await Promise.all([fetchJSON('BinData/tower/towerconfig.json'), fetchJSON('BinData/tower/towerbuff.json'), fetchJSON('BinData/monster_Info/monsterinfo.json')]);
    const extra = towerTxtDict();
    const T = k => (KO_TOWER_TXT[k] ?? extra[k] ?? null);
    const bmap = new Map(tb.map(b => [b.Id, b.Desc])); const mmap = new Map(mi.map(m => [m.Id, m.Name]));
    const db = {}; const missing = new Set();
    const minS = curSeason().n - 1;
    cfg.filter(c => c.Difficulty === 3 && c.Season >= minS).forEach(c => {
      const b = (c.ShowBuffs || []).map(id => { const k = bmap.get(id); const t = k && T(k); if (!t && k) missing.add(k); return t ? stripTags(t) : '(새 버프 · 한글 텍스트 받기 필요)'; });
      const m = (c.ShowMonsters || []).map(id => { const k = mmap.get(id); const t = k && T(k); if (!t && k) missing.add(k); return t || '신규 적'; });
      (db[c.Season] = db[c.Season] || []).push({ a: c.AreaNum, f: c.Floor, n: '', c: c.Cost, rec: c.RecommendElement || [], m, b });
    });
    const latest = Math.max(...Object.keys(db).map(Number), ...Object.keys(RAW_TOWER).map(Number));
    lsSet(LS_TOWER, JSON.stringify({ at: Date.now(), db, missing: [...missing], latest }));
    setTowerDB({ ...RAW_TOWER, ...db });
    state.towerStatus = { kind: missing.size ? 'warn' : 'ok', msg: `최신 데이터 확인 완료 · 시즌 ${latest}까지 수록`, missing: [...missing] };
  } catch (e) {
    state.towerStatus = { kind: 'warn', msg: '최신 데이터를 가져오지 못해 내장 데이터(시즌 40~42)를 사용 중입니다.' };
  }
  paintUpdateBox(); if (state.tab === 'tower-info') renderTowerInfo(); if (state.tab === 'tower-build') renderBuild();
}
async function fetchKoText() {
  const st = state.towerStatus; const need = new Set(st.missing || []);
  if (!need.size) return;
  state.towerStatus = { ...st, kind: 'busy', msg: '한글 텍스트 받는 중… (약 55MB, 1~2분 걸릴 수 있어요)' }; paintUpdateBox();
  try {
    const all = await fetchJSON('Textmaps/ko/multi_text/MultiText.json');
    const extra = towerTxtDict();
    all.forEach(x => { if (need.has(x.Id)) extra[x.Id] = stripTags(x.Content); });
    lsSet(LS_TOWER_TXT, JSON.stringify(extra));
    await refreshTower(true); toast('새 시즌 한글 텍스트를 저장했습니다.');
  } catch (e) { state.towerStatus = { ...st, kind: 'warn', msg: '한글 텍스트를 받지 못했습니다. 잠시 후 다시 시도해 주세요.' }; paintUpdateBox(); }
}
function paintUpdateBox() {
  const box = $('#update-box'); if (!box) return;
  const s = state.towerStatus;
  box.innerHTML = `<span class="dot ${s.kind === 'ok' ? 'ok' : s.kind === 'busy' ? 'busy' : s.kind === 'warn' ? 'warn' : ''}"></span><span>${esc(s.msg)}</span>
    ${s.noBtn ? '' : `<button class="btn sm" id="btn-refresh" ${s.kind === 'busy' ? 'disabled' : ''}>지금 확인</button>`}
    ${s.missing && s.missing.length ? `<button class="btn sm" id="btn-kotext" ${s.kind === 'busy' ? 'disabled' : ''}>새 시즌 한글 텍스트 받기 (${s.missing.length}개)</button>` : ''}`;
  const b1 = $('#btn-refresh'); if (b1) b1.addEventListener('click', () => refreshTower(true));
  const b2 = $('#btn-kotext'); if (b2) b2.addEventListener('click', fetchKoText);
}

function renderTowerInfo() {
  const cur = curSeason();
  const seasons = Object.keys(TOWER_DB).map(Number).sort((a, b) => a - b).filter(n => n >= cur.n - 1);
  if (state.infoSeason == null || !TOWER_DB[state.infoSeason]) state.infoSeason = cur.data || seasons[seasons.length - 1];
  $('#info-season').innerHTML = seasonStripHTML('현재 ');
  paintUpdateBox();
  $('#seg-season').innerHTML = seasons.map(n => `<button data-sn="${n}" aria-pressed="${state.infoSeason === n}">시즌 ${n}${n === cur.n ? ' · 진행 중' : n < cur.n ? ' · 지난 시즌' : ' · 다음 시즌'}</button>`).join('');
  $$('#seg-season button').forEach(b => b.addEventListener('click', () => { state.infoSeason = +b.dataset.sn; renderTowerInfo(); }));
  const sn = state.infoSeason;
  const pool = availableIds(state);
  const cands = pool.length >= 3 ? candidateTeams(pool, { settings: state.settings, ov: state.ov, forcedModes: state.forced, zone: null, season: null }, { k: 7 }).slice(0, 120) : null;
  $('#tower-grid').innerHTML = ['L', 'C12', 'C34', 'R'].map(z => {
    const fs = zoneFloors(sn, z); if (!fs.length) return '';
    const rec = zoneRec(sn, z);
    const buffs = [...new Set(fs.flatMap(f => f.b))];
    const ctx = { settings: state.settings, ov: state.ov, forcedModes: state.forced, zone: z, season: sn };
    let best = '';
    if (cands) {
      const ranked = cands.map(t => bestTeam(t.ids, ctx)).sort((a, b) => b.score * teamPenalty(b) - a.score * teamPenalty(a));
      const tops = []; const seen = new Set();
      for (const t of ranked) { if (seen.has(t.ids[0])) continue; seen.add(t.ids[0]); tops.push(t); if (tops.length >= 3) break; }
      best = `<div><div class="note" style="margin-bottom:6px">내 보유 캐릭터 기준 추천 파티</div><div class="stack" style="gap:8px">${tops.map((t, i) => `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="rank" style="font-size:15px">${i + 1}</span><div class="mini-team">${t.ids.filter(Boolean).map(id => `<div class="mini">${portraitHTML(CH[id])}<div>${esc(CH[id].name)}</div></div>`).join('')}</div><span class="num note">${fmt(t.totalDmg)}</span></div>`).join('')}</div></div>`;
      if (rec.length && z !== 'C34') {
        const solos = pool.filter(id => rec.includes(CH[id].el) && CH[id].role !== 'sup').map(id => bestTeam([id, null, null], ctx)).sort((a, b) => b.totalDmg - a.totalDmg).slice(0, 4);
        if (solos.length) best += `<div><div class="note" style="margin-bottom:6px">1~3층 단일 캐릭터 후보 (속성 접대)</div><div class="mini-team">${solos.map(t => `<div class="mini">${portraitHTML(CH[t.ids[0]])}<div>${esc(CH[t.ids[0]].name)}</div></div>`).join('')}</div></div>`;
      }
    }
    return `<article class="tower">
      <div><h3>${esc(ZONES[z].n)}</h3><div class="note">${esc(ZONES[z].sub)} · 층당 피로도 ${fs.map(f => f.c).join('/')}</div></div>
      ${rec.length ? `<div>추천 속성 ${rec.map(elTag).join(' ')}</div>` : ''}
      ${buffs.map(b => `<div class="bufftxt">${esc(b)}</div>`).join('')}
      <div class="stack" style="gap:4px">${fs.map(f => `<div class="floor-row"><b>${f.f}층</b><span class="mons">${esc(f.m.join(', '))}</span></div>`).join('')}</div>
      ${best}
    </article>`;
  }).join('') || '<div class="card">이 시즌 데이터가 없습니다.</div>';
}

/* ---------- 보유 캐릭터 ---------- */
function renderRoster() {
  paintExtra();
  const filters = [['all', '전체'], ['5', '5성'], ['4', '4성'], ...Object.entries(EL).map(([k, v]) => [k, v.n]), ['main', '메인'], ['sub', '서브'], ['sup', '서포터']];
  $('#roster-filter').innerHTML = filters.map(([k, n]) => `<button class="fbtn" data-rf="${k}" aria-pressed="${state.rosterFilter === k}">${n}</button>`).join('');
  $$('#roster-filter .fbtn').forEach(b => b.addEventListener('click', () => { state.rosterFilter = b.dataset.rf; renderRoster(); }));
  const f = state.rosterFilter, q = state.rosterQuery.trim();
  const list = CHARS.filter(c => (f === 'all' || (f === '5' && c.q === 5) || (f === '4' && c.q === 4) || c.el === f || c.role === f) && (!q || c.name.includes(q)));
  $('#roster-grid').innerHTML = list.map(c => {
    const o = state.ov[c.id] || {}; const ch = o.c ?? (c.q === 4 ? 6 : 0);
    return `<div class="rc-wrap"><button class="rc" data-own="${c.id}" aria-pressed="${state.owned.has(c.id)}">${portraitHTML(c)}<span class="nm">${esc(c.name)}</span><span class="sub">${EL[c.el].n} · ${WT[c.wt] || ''}${isUpcoming(c) ? ' · ' + releaseLabel(c) : ''}</span></button>
      <button class="gear-sum" data-cfg="${c.id}" ${state.owned.has(c.id) ? '' : 'hidden'}><span class="num">S${ch}</span>${o.st && o.st.on ? '<span class="tag-me">내 스탯</span>' : (o.echo && o.echo.on ? '<span class="tag-me">에코</span>' : '')}<span class="cfg">설정</span></button></div>`;
  }).join('') || '<p class="muted">검색 결과가 없습니다.</p>';
  $$('#roster-grid [data-cfg]').forEach(b => b.addEventListener('click', () => openCharCfg(b.dataset.cfg)));
  $$('#roster-grid [data-own]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.own; state.owned.has(id) ? state.owned.delete(id) : state.owned.add(id);
    b.setAttribute('aria-pressed', state.owned.has(id)); const cfg = b.parentElement.querySelector('[data-cfg]'); if (cfg) cfg.hidden = !state.owned.has(id); save(); $('#owned-chip').textContent = `보유 ${state.owned.size}명`;
  }));
  $('#owned-chip').textContent = `보유 ${state.owned.size}명`;
}

/* ---------- 도감 ---------- */
function renderDB() {
  $$('#seg-db button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === state.dbView));
  const body = $('#db-body');
  const bl = arr => arr.map(buffDescHTML).join('');
  if (state.dbView === 'chars') {
    body.innerHTML = `<table class="db dbc"><thead><tr><th>공명자</th><th>속성 · 무기</th><th>역할</th><th>반주 스킬 (게임 원문)</th><th>계산에 쓰는 버프</th></tr></thead><tbody>${CHARS.map(c => {
      const buffs = c.modes ? Object.values(c.modes).map(m => `<div class="bf-mode">${esc(m.n)} 모드</div>${bl(m.b)}`).join('') : bl(c.b || []);
      return `<tr><td class="c-name" style="min-width:150px"><div style="display:flex;gap:8px;align-items:center"><div style="width:40px;flex:0 0 40px">${portraitHTML(c)}</div><b>${esc(c.name)}</b>${c.auto ? '<br>' + autoChip(c) : ''}</div></td>
        <td class="nw c-el">${elTag(c.el)}<div class="muted">${WT[c.wt] || ''} · ${c.q}성</div></td><td class="nw c-role">${ROLE_N[c.role]}</td>
        <td class="c-out" data-l="반주 스킬 (게임 원문)" style="min-width:260px">${c.outro ? `<b>${esc(c.outro.n)}</b><br><span class="muted">${esc(c.outro.d)}</span>` : `<span class="muted">${esc(c.note || '데이터 없음')}</span>`}</td>
        <td class="c-buf" data-l="계산에 쓰는 버프" style="min-width:260px">${buffs || '<span class="muted">파티 버프 없음 (딜 전용)</span>'}${c.note && c.outro ? `<div class="note">${esc(c.note)}</div>` : ''}</td></tr>`;
    }).join('')}</tbody></table>`;
  } else if (state.dbView === 'chains') {
    body.innerHTML = `<table class="db"><thead><tr><th>공명자</th><th>체인</th><th>효과 (게임 원문)</th><th>계산 반영</th></tr></thead><tbody>${CHARS.filter(c => RAW_CHAIN[c.rid]).map(c => {
      const eff = chainEffects(c);
      return [1, 2, 3, 4, 5, 6].map(i => `<tr>${i === 1 ? `<td rowspan="6" style="min-width:130px"><div style="width:44px">${portraitHTML(c)}</div><b>${esc(c.name)}</b></td>` : ''}<td class="num" style="min-width:110px">S${i}<br><span class="muted" style="font-family:var(--f-body)">${esc(RAW_CHAIN[c.rid][i] ? RAW_CHAIN[c.rid][i].n : '')}</span></td>
        <td style="min-width:300px" class="muted">${esc(RAW_CHAIN[c.rid][i] ? RAW_CHAIN[c.rid][i].d : '')}</td>
        <td style="min-width:160px">${(eff[i] || []).map(b => b.s === 'mv' ? `${b.dt === '*' ? '전체' : DT[b.dt]} 스킬 배율 +${Math.round(b.v)}%` : b.s === 'rot' ? `딜 사이클 ×${b.v}` : `${esc(TO_N[b.to || 'self'])} ${esc(buffLabel(b))} ${buffVal(b)}`).join('<br>') || '<span class="muted">생존·편의</span>'}</td></tr>`).join('');
    }).join('')}</tbody></table>`;
  } else if (state.dbView === 'weapons') {
    const rows = Object.entries(RAW_WEAPONS).filter(([, w]) => w.q >= 4).sort((a, b) => a[1].wt - b[1].wt || b[1].q - a[1].q || a[0] - b[0]);
    body.innerHTML = `<table class="db"><thead><tr><th>무기</th><th>종류</th><th>기본 공격력</th><th>부옵션</th><th>효과 (1재련)</th></tr></thead><tbody>${rows.map(([id, w]) => `<tr><td style="min-width:170px">${IMG_WEAPON[id] ? `<img class="db-icon" src="${IMG_WEAPON[id]}" alt=""> ` : ''}<b style="color:${w.q === 5 ? 'var(--r5)' : 'var(--r4)'}">★${w.q}</b> ${esc(w.n)}</td><td>${WT[w.wt]}</td><td class="num">${w.atk}</td><td>${esc(STAT_N[w.sub[0]] || w.sub[0])} ${w.sub[1]}%</td><td style="min-width:320px" class="muted">${esc(w.d)}</td></tr>`).join('')}</tbody></table>`;
  } else {
    body.innerHTML = `<table class="db"><thead><tr><th>에코 세트</th><th>효과</th><th>추천 착용</th></tr></thead><tbody>${Object.entries(RAW_SETS).map(([id, s]) => {
      const users = CHARS.filter(c => +c.set === +id || (c.set2 || []).includes(+id) || (c.modes && Object.values(c.modes).some(m => +m.set === +id))).map(c => c.name + ((c.set2 || []).includes(+id) ? '(2세트)' : ''));
      return `<tr><td style="min-width:180px">${IMG_SET[id] ? `<img class="db-icon" src="${IMG_SET[id]}" alt=""> ` : ''}<b>${esc(s.n)}</b></td><td style="min-width:320px">${s.e.map(([pc, d]) => `<div><b>${pc}세트</b> <span class="muted">${esc(d)}</span></div>`).join('')}</td><td>${esc(users.join(', ')) || '-'}</td></tr>`;
    }).join('')}</tbody></table>`;
  }
}

/* ---------- 설정 · 테마 ---------- */
function bindSettings() {
  const s = state.settings;
  $('#set-preset').value = s.preset; $('#set-lv').value = s.enemyLv; $('#set-res').value = s.baseRes; $('#set-rot').value = s.rot; $('#set-up').value = s.upcoming ? '1' : '0'; $('#set-pbias').value = String(s.presetBias ?? 8); $('#set-tbias').value = String(s.tierBias ?? 100);
  const upd = () => {
    s.preset = $('#set-preset').value; s.enemyLv = +$('#set-lv').value || 100; s.baseRes = +$('#set-res').value || 0;
    s.rot = Math.max(0, +$('#set-rot').value || 0); s.upcoming = $('#set-up').value === '1'; s.presetBias = +$('#set-pbias').value; s.tierBias = +$('#set-tbias').value;
    save(); renderBuild(); toast('설정을 반영했습니다.');
  };
  ['#set-preset', '#set-lv', '#set-res', '#set-rot', '#set-up'].forEach(sel => $(sel).addEventListener('change', upd));
  $('#set-pbias').addEventListener('change', () => { upd(); optimize(true); });
  $('#set-tbias').addEventListener('change', () => { upd(); optimize(true); });
}
function effectiveTheme() { const t = document.documentElement.getAttribute('data-theme'); if (t) return t; return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
function paintThemeBtn() { const d = effectiveTheme() === 'dark'; const b = $('#btn-theme'); b.textContent = d ? '☀' : '☾'; b.setAttribute('aria-label', d ? '라이트 모드로 바꾸기' : '다크 모드로 바꾸기'); b.title = d ? '라이트 모드' : '다크 모드'; }
function initTheme() {
  const t = lsGet(LS_KEY + '-theme'); document.documentElement.setAttribute('data-theme', t || 'dark'); // 기본은 우주(다크) 테마
  paintThemeBtn();
  $('#btn-theme').addEventListener('click', () => { const next = effectiveTheme() === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', next); lsSet(LS_KEY + '-theme', next); paintThemeBtn(); });
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', paintThemeBtn);
}
function bindSeg(id, getter, setter) {
  const seg = $(id);
  const paint = () => $$('button', seg).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v) === String(getter())));
  $$('button', seg).forEach(b => b.addEventListener('click', () => { setter(b.dataset.v); paint(); }));
  paint();
}

/* ---------- 탭 ---------- */
function switchTab(t) {
  state.tab = t;
  $$('#tabs .tab').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === t));
  $$('main [data-panel]').forEach(p => { p.hidden = p.dataset.panel !== t; });
  ({ 'grow': renderGrow, 'timeline': renderTimeline, 'field': renderField, 'presets': renderPresets, 'tower-info': renderTowerInfo, 'roster': renderRoster, 'db': renderDB, 'tower-build': renderBuild }[t] || (() => { }))();
  save();
  if (typeof curView !== 'undefined' && curView === 'tools') { const u = BASE + 'tools/' + t; if (location.pathname !== u) try { history.replaceState(null, '', u); } catch (e) { } }
}
function copyText() {
  const lines = [`[띵조 AUTO TEAM MAKER Ver. ${APP_VERSION}] ` + seasonStripHTML().replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()];
  state.parties.forEach((p, i) => {
    const r = evalParty(p); const sl = SLOT[p.slot];
    const who = sl.type === 'solo' ? (p.ids[0] ? `단일 ${CH[p.ids[0]].name}` : '-') : p.ids.map((id, j) => id ? `${['메인', '서브', '서포터'][j]} ${CH[id].name}${r && r.modes[id] ? '(' + CH[id].modes[r.modes[id]].n + ')' : ''}` : '-').join(' / ');
    lines.push(`${i + 1}파티 [${sl.label} ${sl.fl}] ${who}${r ? ` · 1사이클 ${fmt(r.totalDmg)} (약 ${Math.round(r.rot)}초)` : ''}`);
  });
  copyStr(lines.join('\n'), '조합을 복사했습니다.');
}
function copyStr(txt, msg) {
  const fb = () => {
    const ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    (document.querySelector('dialog[open]') || document.body).appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(msg); } catch (e) { toast('복사하지 못했습니다. 직접 선택해서 복사해 주세요.'); }
    ta.remove();
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => toast(msg), fb); else fb();
}

/* =====================================================================
   사이트 셸: 화면 전환(#/주소) · 홈 · 소개 · 공명자 가이드 · 에코 계산기 · 튜닝 시뮬 · 자료실 · 공지사항
   파티 편성은 #/tools/<탭> 으로 씁니다.
   ===================================================================== */

/* ---------- 일러스트 (assets/, tools/build_assets.py가 자동으로 만듦) ---------- */
let ART = { card: new Set(), full: new Set(), bg: new Set() };
const artUrl = (kind, rid) => rid && ART[kind] && ART[kind].has(+rid) ? `${BASE}assets/${kind}/${rid}.webp` : '';
async function loadArt() {
  try {
    const r = await fetch(BASE + 'assets/art.json', { cache: 'no-cache' }); if (!r.ok) return;
    const d = await r.json(); ART = { card: new Set(d.card || []), full: new Set(d.full || []), bg: new Set(d.bg || []) };
    if (curView && curView !== 'tools') route(true);
  } catch (e) { /* 파일로 열었거나 오프라인 */ }
}
const charByRid = rid => CHARS.find(c => c.rid === +rid) || null;
const elColor = c => (EL[c.el] || {}).c || '#888';

/* ---------- 픽업 · 버전 일정 (tools/update_events.py → events.json) ---------- */
const LS_EVENTS = 'ddingjo-atm-events';
const EVENT_URLS = [BASE + 'events.json', 'https://raw.githubusercontent.com/Real-Sesame/-/HEAD/public/events.json'];
let EVENTS = (() => { try { const d = JSON.parse(lsGet(LS_EVENTS) || 'null'); return d && d.schema === 1 ? d : null; } catch (e) { return null; } })();
async function refreshEvents() {
  for (const u of EVENT_URLS) {
    if (location.protocol === 'file:' && !/^https:/.test(u)) continue;
    try {
      const res = await fetch(u + (u.includes('?') ? '&' : '?') + 'h=' + Math.floor(Date.now() / 18e5), { cache: 'no-cache' });
      if (!res.ok) continue;
      const txt = await res.text(); const d = JSON.parse(txt);
      if (!d || d.schema !== 1 || !Array.isArray(d.items)) continue;
      EVENTS = d; if (lsGet(LS_EVENTS) !== txt) lsSet(LS_EVENTS, txt);
      if (curView === 'home' || curView === 'sim') route(true);
      return;
    } catch (e) { /* 오프라인 */ }
  }
}
const evT = x => x ? Date.parse(x) : NaN;
function evItems() {
  return ((EVENTS && EVENTS.items) || []).filter(x => x && x.e && !isNaN(evT(x.e))).map(x => ({ ...x, S: isNaN(evT(x.s)) ? null : evT(x.s), E: evT(x.e) }));
}
function bannersNow(kind) {
  const now = Date.now();
  return evItems().filter(x => x.k === kind && (x.S ?? 0) <= now && now < x.E).sort((a, b) => (a.rr || 0) - (b.rr || 0) || a.E - b.E);
}
function currentVersion() {
  const vi = (EVENTS && EVENTS.vinfo) || {}; const now = Date.now();
  const list = Object.entries(vi).map(([v, x]) => ({ v, ...x, S: evT(x.s), E: evT(x.e) })).sort((a, b) => a.S - b.S);
  return list.find(x => x.S <= now && (isNaN(x.E) || now < x.E)) || list[list.length - 1] || null;
}
const ymdKo = t => { const d = new Date(t); return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`; };
const mdhm = t => { const d = new Date(t); return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
function leftParts(t) { const ms = Math.max(0, t - Date.now()); return { d: Math.floor(ms / DAY), h: Math.floor(ms % DAY / 3600000), m: Math.floor(ms % 3600000 / 60000) }; }
const cdHTML = t => { const p = leftParts(t); return `${p.d}<small>일</small>${p.h}<small>시간</small>${p.m}<small>분</small>`; };
// 다음 버전 예정 공명자(앱 데이터의 출시 예정)
const upcomingChars = () => CHARS.filter(c => isUpcoming(c) && c.release).sort((a, b) => a.release - b.release);

/* ---------- 공통 조각 ---------- */
function ccHTML(c, { tags = '' } = {}) {
  const art = artUrl('card', c.rid); const p = (IMG_CHAR[c.id]) || '';
  const img = art ? `<img class="art" src="${art}" alt="" loading="lazy">` : p ? `<img class="art" src="${p}" alt="" loading="lazy">` : `<span class="ini">${esc(c.name.replace('방랑자·', '').slice(0, 1))}</span>`;
  return `<a class="cc" href="#/character/${c.id}" style="--elc:${elColor(c)}" aria-label="${esc(c.name)} 가이드">${img}
    <div class="cc-top"><span style="display:flex;gap:4px;flex-wrap:wrap">${tags}</span><span class="stars ${c.q === 4 ? 'r4' : ''}">${'★'.repeat(c.q)}</span></div>
    <div class="cc-b"><div class="cc-n">${esc(c.name)}</div><div class="cc-s"><i class="el-i"></i>${EL[c.el] ? EL[c.el].n : ''} · ${WT[c.wt] || ''}${c.role ? ' · ' + ROLE_N[c.role].split('·')[0].replace(' 딜러', '') : ''}</div></div></a>`;
}
const pickTag = x => x ? (x.rr ? '<span class="tag re">복각</span>' : '<span class="tag new">NEW</span>') : '';
function secHead(title, sub, more) {
  return `<div class="sec-h"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${more ? `<a class="more" href="${more}">전체 보기</a>` : ''}</div>`;
}
function hscroll(id, inner) {
  return `<div class="hscroll"><button class="hs-btn l" data-hs="${id}" data-d="-1" aria-label="이전">‹</button><div class="hs-track" id="${id}">${inner}</div><button class="hs-btn r" data-hs="${id}" data-d="1" aria-label="다음">›</button></div>`;
}
function bindHscroll(root) { $$('[data-hs]', root).forEach(b => b.addEventListener('click', () => { const t = $('#' + b.dataset.hs); t.scrollBy({ left: b.dataset.d * t.clientWidth * .8, behavior: 'smooth' }); })); }

/* ---------- 홈 ---------- */
let homeBanner = 0, cdTimer = null;
function renderHome() {
  const el = $('[data-view="home"]'); const now = Date.now();
  const ver = currentVersion(); const cb = bannersNow('char'); const wb = bannersNow('weapon');
  const lead = cb[0]; const leadC = lead ? charByRid(lead.f5[0]) : CHARS.find(c => c.q === 5 && !isUpcoming(c));
  const heroRid = lead ? lead.f5[0] : leadC && leadC.rid;
  const t = (ver && ver.title) || ''; const parts = t.split(/,\s*/);
  const title = t ? (parts.length > 1 ? `${esc(parts[0])},<em>${esc(parts.slice(1).join(', '))}</em>` : `<em>${esc(t)}</em>`) : '내 캐릭터로 짜는<em>최적의 파티</em>';
  const sn = curSeason();
  const hero = `<section class="hero">
    ${artUrl('bg', heroRid) ? `<div class="hero-bg" style="background-image:url('${artUrl('bg', heroRid)}')"></div>` : ''}
    ${artUrl('full', heroRid) ? `<img class="hero-art" src="${artUrl('full', heroRid)}" alt="">` : ''}
    <div class="hero-in">
      <p class="eyebrow">명조: 워더링 웨이브${ver ? ` ${esc(ver.v)}버전` : ''}</p>
      <h1>${title}</h1>
      ${ver ? `<p class="period"><span>${ymdKo(ver.S)} 업데이트 후 ~ ${isNaN(ver.E) ? '' : ymdKo(ver.E)}</span>${lead && leadC ? `<span class="tag gold">PICK UP · ${esc(leadC.name)}</span>` : ''}</p>` : '<p class="period">명조 역경의 탑 · 필드 파티 자동 편성과 공명자 가이드</p>'}
      <div class="cta"><a class="btn lg solid-gold" href="#/characters">공명자 가이드</a><a class="btn lg glass" href="#/tools/tower-build">파티 편성</a></div>
      <div class="hero-meta"><div><b>${CHARS.filter(c => !isUpcoming(c)).length}명</b>수록 공명자</div><div><b>시즌 ${sn.n}</b>역경의 탑 · 초기화까지 ${leftParts(sn.end).d}일</div>${lead ? `<div><b>${leftParts(lead.E).d}일 ${leftParts(lead.E).h}시간</b>픽업 종료까지</div>` : ''}</div>
    </div></section>`;

  // 공명자 가이드: 픽업 → 최근 공명자 순
  const seen = new Set(); const cards = [];
  cb.forEach(x => { const c = charByRid(x.f5[0]); if (c && !seen.has(c.id)) { seen.add(c.id); cards.push(ccHTML(c, { tags: pickTag(x) + '<span class="tag gold">픽업</span>' })); } });
  CHARS.filter(c => c.q === 5 && !isUpcoming(c) && !c.id.startsWith('rover_')).forEach(c => { if (cards.length < 6 && !seen.has(c.id)) { seen.add(c.id); cards.push(ccHTML(c)); } });

  // 캐릭터 이벤트 튜닝
  const nexts = upcomingChars().slice(0, 2);
  const slides = cb.map(x => ({ x, c: charByRid(x.f5[0]) })).filter(s => s.c).concat(nexts.map(c => ({ c, next: true })));
  if (homeBanner >= slides.length) homeBanner = 0;
  const bnr = slides.length ? bannerMainHTML(slides[homeBanner]) + `<div class="bnr-thumbs">${slides.map((s, i) => `<button class="bnr-th ${s.next ? 'next' : ''}" data-bn="${i}" aria-pressed="${i === homeBanner}">
      ${artUrl('bg', s.c.rid) ? `<span class="bg" style="background-image:url('${artUrl('bg', s.c.rid)}')"></span>` : ''}
      <span class="tags">${s.next ? '<span class="tag next">NEXT</span>' : pickTag(s.x)}</span>
      <b>${esc(s.c.name)}</b><small>${s.next ? `${esc(releaseLabel(s.c))}` : `${mdhm(s.x.S)} ~ ${mdhm(s.x.E)}`}</small></button>`).join('')}</div>`
    : `<div class="empty-note">픽업 일정을 불러오는 중이거나 아직 공지가 없습니다. GitHub Pages 주소로 열면 공식 공지에서 자동으로 받아 옵니다.</div>`;
  const wline = wb.length ? `<p class="note" style="margin-top:12px">무기 이벤트 튜닝: ${wb.map(x => { const w = RAW_WEAPONS[x.f5[0]]; return `<b>${esc(w ? w.n : ((EVENTS.names || {})['weapon:' + x.f5[0]] || ''))}</b>`; }).join(' · ')} <span class="muted">(~ ${mdhm(wb[0].E)})</span></p>` : '';

  // 에코 계산기 맛보기
  const ex = { atk: 2152, cr: 71.4, cd: 241.2, er: 118 };
  const bar = (n, v, goal, unit = '') => `<div class="stat-bar"><div class="top"><span>${n}</span><b>${typeof v === 'number' && v > 999 ? fmt(v) : v}${unit} <span>/ 목표 ${goal > 999 ? fmt(goal) : goal}${unit}</span></b></div><div class="track"><div class="fill" style="width:${Math.min(100, v / goal * 100)}%"></div></div></div>`;
  const tower = TOWER_DB && TOWER_DB[sn.n];

  el.innerHTML = hero + `<div class="container">
    <section class="sec">${secHead('공명자 가이드', '이번 픽업과 최근 공명자의 무기 · 에코 · 추천 조합을 확인하세요.', '#/characters')}<div class="cc-grid">${cards.join('')}</div></section>
    <section class="sec">${secHead('캐릭터 이벤트 튜닝', '진행 중인 픽업과 남은 시간 · 다음 버전 예정 공명자', '')}${bnr}${wline}</section>
    <section class="sec">${secHead('시즌 콘텐츠', '28일마다 바뀌는 엔드 콘텐츠의 이번 시즌과 남은 시간', '#/season')}<div class="ss-grid" style="margin-top:0">${[['역경의 탑', '심경 구역', sn], ['죽음의 노래와 바닷속 폐허', '재생 해역 · 해곡 · 급류', wastesSeasonAt(now)]].map(([n, k, s]) => `<a class="ss-card" href="#/season"><span class="k">${k}</span><b>${n} <span class="tag gold">시즌 ${s.n}</span></b><span>${ymd(s.start)} ~ ${ymd(s.end)} 04:00 · 초기화까지 <b class="num">${leftTxt(s.end)}</b></span></a>`).join('')}</div></section>
    <section class="sec"><div class="feat"><div class="feat-tx"><p class="eyebrow">에코 계산기</p><h3>나의 에코,<br><em>어디까지 왔을까요?</em></h3><p>에코 5개의 주옵션 · 부옵션을 넣으면 속성 화면 스탯과 크리티컬 점수를 바로 계산하고, 목표치와 비교해 다음에 올릴 옵션을 알려 줍니다.</p><a class="btn solid-gold" href="#/echo">에코 계산기 열기</a></div>
      <div class="feat-vis">${bar('공격력', ex.atk, 2400)}${bar('크리티컬', ex.cr, 75, '%')}${bar('크리티컬 피해', ex.cd, 260, '%')}${bar('공명 효율', ex.er, 125, '%')}<p class="note" style="margin:4px 0 0">예시 화면</p></div></div></section>
    <section class="sec"><div class="feat"><div class="feat-tx"><p class="eyebrow">파티 편성</p><h3>보유 캐릭터로 짜는<br><em>역경의 탑 자동 편성</em></h3><p>심경 구역 시즌 ${sn.n}${tower ? '의 층별 버프와 적 속성' : ''}을 반영해 파티별 1사이클 예상 피해가 가장 높은 조합을 찾아 줍니다. 필드 파티, 딜 사이클, 육성 재료 계산도 함께 있어요.</p><a class="btn solid-gold" href="#/tools/tower-build">파티 편성 열기</a></div>
      <div class="feat-vis"><div class="feat-row" style="grid-template-columns:1fr">${['tower-build:역경의 탑 편성:시즌 버프 반영 자동 편성', 'timeline:딜 사이클:누가 언제 무엇을 하는지 순서대로', 'grow:육성 계산:돌파 · 스킬 재료와 필요한 파밍 횟수'].map(s => { const [k, n, d] = s.split(':'); return `<a class="mini-feat" href="#/tools/${k}"><b>${n}</b><span>${d}</span></a>`; }).join('')}</div></div></div></section>
    <section class="sec"><div class="feat"><div class="feat-tx"><p class="eyebrow">튜닝 시뮬레이터</p><h3>별의 소리를 쓰기 전에,<br><em>미리 돌려 보기</em></h3><p>공개된 확률 규칙(5성 0.8% · 80회 확정 · 캐릭터 픽업 50%)으로 진행 중인 픽업을 돌려 보고, 천장 · 평균 · 쓴 별의 소리를 기록합니다.</p><a class="btn solid-gold" href="#/sim">튜닝 시뮬 열기</a></div>
      <div class="feat-vis"><div class="feat-row" style="grid-template-columns:1fr">${cb.concat(wb).slice(0, 4).map(x => { const nm = x.k === 'char' ? ((charByRid(x.f5[0]) || {}).name || '') : ((RAW_WEAPONS[x.f5[0]] || {}).n || ''); return `<button class="mini-feat" data-simstart="${esc(`${x.k}:${x.f5[0]}:${x.E}`)}" style="text-align:left;font:inherit;cursor:pointer"><span class="k">${x.k === 'char' ? '캐릭터' : '무기'} 이벤트 튜닝</span><b>${esc(nm)}로 시작</b><span>~ ${mdhm(x.E)} · ${x.k === 'char' ? '픽업 50% · 놓치면 다음 확정' : '5성은 픽업 무기 확정'}</span></button>`; }).join('') || '<a class="mini-feat" href="#/sim"><b>튜닝 시뮬 열기</b><span>진행 중인 픽업을 불러오면 여기에 나옵니다.</span></a>'}</div></div></div></section>
    <section class="sec">${secHead('자료실', '공략과 자료를 찾을 때 함께 보면 좋은 곳', '#/links')}${hscroll('hs-links', LINKS.map(linkHTML).join(''))}</section>
    <section class="data-info" id="home-data" aria-label="데이터 기준"></section>
  </div>`;
  paintDataInfo();
  $$('[data-bn]', el).forEach(b => b.addEventListener('click', () => { homeBanner = +b.dataset.bn; renderHome(); }));
  $$('[data-simstart]', el).forEach(b => b.addEventListener('click', () => { state.sim = { key: b.dataset.simstart, p5: 0, p4: 0, g5: false, g4: false, n: 0, n5: 0, n4: 0, last: [], hist: [], pity5s: [] }; navigate('sim'); }));
  bindHscroll(el);
  clearInterval(cdTimer); cdTimer = setInterval(() => { if (curView !== 'home') return clearInterval(cdTimer); $$('[data-cd]').forEach(x => { x.innerHTML = cdHTML(+x.dataset.cd); }); }, 30000);
}
// 홈 맨 아래: 각 데이터가 언제 · 무엇을 기준으로 갱신됐는지
function paintDataInfo() {
  const el = $('#home-data'); if (!el) return;
  const sn = curSeason(); const ev = EVENTS && EVENTS.updated ? evT(EVENTS.updated) : NaN;
  const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 60 ? `${Math.max(1, m)}분 전` : m < 1440 ? `${Math.round(m / 60)}시간 전` : `${Math.round(m / 1440)}일 전`; };
  const row = (k, v, d) => `<div><span>${k}</span><b>${v}</b>${d ? `<small>${d}</small>` : ''}</div>`;
  el.innerHTML = `<h2>데이터 기준</h2><div class="di-grid">
    ${row('픽업 · 이벤트 일정', isNaN(ev) ? '불러오는 중' : `${mdhm(ev)} 마지막 변경`, isNaN(ev) ? '공식 공지 · 3시간마다 확인' : `${ago(ev)} 바뀜 · 공식 공지는 3시간마다 확인`)}
    ${row('게임 데이터', DATA_META.gameVer ? `${esc(DATA_META.gameVer)} 버전` : `${CHARS.filter(c => !isUpcoming(c)).length}명 수록`, '새 공명자 · 무기 · 재료를 매일 확인')}
    ${row('역경의 탑', `시즌 ${sn.n}`, `${mdhm(sn.end)} 초기화 · 층별 버프 · 적 속성`)}
    ${row('죽음의 노래와 바닷속 폐허', `시즌 ${wastesSeasonAt(Date.now()).n}`, `${mdhm(wastesSeasonAt(Date.now()).end)} 초기화 · 게임 데이터로 매일 확인`)}
    ${row('사이트', `Ver. ${esc(APP_VERSION)}`, `${esc(patchNotes()[0].d)} 업데이트 · <a href="#/notice">업데이트 내역</a>`)}</div>`;
  fixLinks(el);
}
function bannerMainHTML(s) {
  const c = s.c; const x = s.x;
  const bg = artUrl('bg', c.rid); const full = artUrl('full', c.rid);
  const f4 = x ? (x.f4 || []).map(r => charByRid(r)).filter(Boolean) : [];
  return `<article class="bnr-main">
    ${bg ? `<div class="bg" style="background-image:url('${bg}')"></div>` : `<div class="bg" style="background:radial-gradient(70% 90% at 75% 40%, color-mix(in srgb, ${elColor(c)} 50%, #0d0d0c), #0d0d0c 72%)"></div>`}
    ${full ? `<img class="art" src="${full}" alt="">` : ''}
    <div class="bnr-info">
      <div style="display:flex;gap:6px">${s.next ? '<span class="tag next">NEXT</span>' : pickTag(x) + '<span class="tag gold">PICK UP</span>'}</div>
      <h3>${esc(c.name)} ${s.next ? '' : '<span class="up">UP!</span>'}</h3>
      <div class="bnr-time">${s.next ? `${esc(releaseLabel(c))}` : `${mdhm(x.S)} — ${mdhm(x.E)}<small>KST</small>`}</div>
      <div class="bnr-chips"><span>${EL[c.el] ? EL[c.el].n : ''}</span><span>${WT[c.wt] || ''}</span><span>${ROLE_N[c.role] || ''}</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn sm solid-gold" href="#/character/${c.id}">육성 가이드</a>${x && x.url ? `<a class="btn sm glass" href="${esc(x.url)}" target="_blank" rel="noopener">공식 공지${/\/en\//.test(x.url) ? ' (영어)' : ''}</a>` : ''}</div>
      ${s.next ? '' : `<div class="cd"><span class="lbl">종료까지</span><div class="t" data-cd="${x.E}">${cdHTML(x.E)}</div></div>`}
    </div>
    ${f4.length ? `<div class="bnr-4"><span class="lbl">4성 UP</span><div class="row">${f4.map(c4 => `<a href="#/character/${c4.id}" title="${esc(c4.name)}">${portraitHTML(c4)}</a>`).join('')}</div></div>` : ''}
  </article>`;
}

/* ---------- 자료실 ---------- */
const LINKS = [
  { cat: '공식', n: '명조 공식 공지', d: '업데이트 · 픽업 · 이벤트 공지 원문', url: 'https://wutheringwaves.kurogames.com/kr/main/news/' },
  { cat: '커뮤니티', n: '아카라이브 명조 채널', d: '국내 명조 커뮤니티 · 공략 · 사이클 · 정보 글', url: 'https://arca.live/b/wutheringwaves' },
  { cat: '공략', n: '나무위키 명조', d: '게임 시스템 · 공명자 · 스토리 정리', url: 'https://namu.wiki/w/%EB%AA%85%EC%A1%B0:%20%EC%9B%8C%EB%8D%94%EB%A7%81%20%EC%9B%A8%EC%9D%B4%EB%B8%8C' },
  { cat: '지도', n: '명조 맵스', d: '수집품 · 몬스터 위치 인터랙티브 지도', url: 'https://maps.wuwa.moe/' },
  { cat: '도구', n: '명조 맵스 트래커', d: '게임 화면과 지도를 연동해 내 위치 표시', url: 'https://github.com/wuwamoe/wuma-tracker/releases' },
  { cat: '도구', n: 'WuWa Tracker', d: '튜닝 기록 · 천장 확인 (영어)', url: 'https://wuwatracker.com/' },
  { cat: '공략', n: 'Prydwen 명조 가이드', d: '캐릭터 공략 · 티어 · 조합 (영어)', url: 'https://www.prydwen.gg/wuthering-waves/' },
  { cat: '데이터', n: 'Encore.moe', d: '캐릭터 · 무기 · 에코 데이터베이스', url: 'https://encore.moe/' },
  { cat: '데이터', n: 'WutheringWaves_Data', d: '이 사이트가 쓰는 게임 데이터 원본', url: 'https://github.com/Arikatsu/WutheringWaves_Data' },
  { cat: '리소스', n: 'Wuthering Waves GameAssets', d: '게임 UI 이미지 리소스 (일러스트 출처)', url: 'https://github.com/555me/Wuthering-Waves-GameAssets' }
];
const hostOf = u => { try { return new URL(u).host.replace(/^www\./, ''); } catch (e) { return ''; } };
const linkHTML = l => `<a class="lk" href="${esc(l.url)}" target="_blank" rel="noopener"><span class="cat">${esc(l.cat)}</span><b>${esc(l.n)}</b><span>${esc(l.d)}</span><span class="host">${esc(hostOf(l.url))} ↗</span></a>`;
function renderLinks() {
  const el = $('[data-view="links"]'); const cats = ['전체', ...new Set(LINKS.map(l => l.cat))]; const f = state.linkCat || '전체';
  el.innerHTML = `<div class="container page"><p class="eyebrow">자료실</p><h1 class="ph-t">함께 보면 좋은 <em>공략과 자료</em></h1><p class="ph-d">공식 공지, 국내 커뮤니티, 지도, 데이터베이스, 공략 사이트를 모았습니다. 모두 외부 사이트로 새 창에서 열립니다.</p>
    <div class="fbar"><div class="grp">${cats.map(c => `<button class="fchip" data-lc="${esc(c)}" aria-pressed="${c === f}">${esc(c)}</button>`).join('')}</div></div>
    <div class="intro-grid">${LINKS.filter(l => f === '전체' || l.cat === f).map(linkHTML).join('')}</div></div>`;
  $$('[data-lc]', el).forEach(b => b.addEventListener('click', () => { state.linkCat = b.dataset.lc; renderLinks(); }));
}

/* ---------- 시즌 콘텐츠 (역경의 탑 · 죽음의 노래와 바닷속 폐허) ----------
   폐허 데이터: public/wastes.json (tools/build_wastes.py가 게임 데이터 BinData/ShipTower로 만듦)
   시즌: 28일마다 월요일 04:00(한국 시간) 초기화, 역경의 탑과 2주 엇갈림. 23시즌 = 2026-10-26 시작(인벤 공략 글로 확인) */
const WASTES_BASE = { n: 23, t: Date.UTC(2026, 9, 25, 19, 0, 0) };
function wastesSeasonAt(now) {
  const n = WASTES_BASE.n + Math.floor((now - WASTES_BASE.t) / (28 * DAY));
  const start = WASTES_BASE.t + (n - WASTES_BASE.n) * 28 * DAY;
  return { n, start, end: start + 28 * DAY };
}
let WASTES = null, WASTES_P = null;
function loadWastes() {
  if (!WASTES_P) WASTES_P = fetch(`${BASE}wastes.json?h=${Math.floor(Date.now() / 36e5)}`).then(r => r.ok ? r.json() : null).then(d => { WASTES = d; return d; }).catch(() => null);
  return WASTES_P;
}
const elIdTag = id => elTag(EL_BY_ID[id]);
const ymd = t => { const d = new Date(t); return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}`; };
const leftTxt = t => { const p = leftParts(t); return `${p.d}일 ${p.h}시간`; };
// 보유 캐릭터로 폐허 한 층(전반 · 후반 두 파티, 캐릭터 중복 없음)을 짬
// 전반 · 후반마다 저항(+20%)을 넣어 다시 계산하고, 두 파티 점수(로그 합 = 균형)가 가장 좋은 조합을 고름
function wastesTeams(cands, half) {
  const base = { settings: state.settings, ov: state.ov, forcedModes: state.forced, zone: null, season: null };
  const lists = half.map(h => {
    const res = {}; h.r.forEach(i => { res[EL_BY_ID[i]] = 20; });
    const ctx = { ...base, tz: { res, b: [], resEchoExempt: 0 } };
    const sc = cands.map(t => { const r = h.r.length ? bestTeam(t.ids, ctx) : t; return { ids: t.ids, r, raw: r.score * teamPenalty(r) * presetBias(t.ids) * tierBias(t.ids) }; });
    const best = Math.max(1, ...sc.map(x => x.raw));
    return sc.map(x => ({ ...x, _s: Math.log(Math.max(x.raw / best, 1e-4)) }));
  });
  const pick = pickDisjoint(lists, false, 120);
  return half.map((h, i) => pick[i] ? pick[i].r : null);
}
function renderSeason() {
  const el = $('[data-view="season"]'); const now = Date.now();
  const ts = curSeason(); const ws = wastesSeasonAt(now);
  const W = WASTES; const sel = state.wsSel && W && W.seasons[state.wsSel] ? state.wsSel : (W ? String(W.seasons[ws.n] ? ws.n : W.latest) : null);
  const S = W && sel ? W.seasons[sel] : null;
  const pool = availableIds(state);
  let ranked = null;
  if (S && pool.length >= 6) {
    const ctx = { settings: state.settings, ov: state.ov, forcedModes: state.forced, zone: null, season: null };
    const cs = candidateTeams(pool, ctx, { k: 7 }).slice(0, 160);
    const ps = new Set(pool); presetTeams().forEach(x => { if (x.m.every(id => ps.has(id)) && new Set(x.m.map(gk)).size === 3 && !cs.some(t => sameTeam(t.ids, x.m))) cs.push(bestTeam(x.m, ctx)); });
    ranked = cs.map(t => t.out ? t : bestTeam(t.ids, ctx));
  }
  const teamHTML = t => t ? `<div class="mini-team">${t.ids.filter(Boolean).map(id => `<div class="mini">${portraitHTML(CH[id])}<div>${esc(CH[id].name)}</div></div>`).join('')}</div>` : '<span class="note">겹치지 않는 파티가 부족합니다</span>';
  const card = (k, n, s, sub, href, btn) => `<a class="ss-card" href="${href}"><span class="k">${k}</span><b>${n} <span class="tag gold">시즌 ${s.n}</span></b><span>${ymd(s.start)} ~ ${ymd(s.end)} 04:00 · 초기화까지 <b class="num">${leftTxt(s.end)}</b></span><span class="note">${sub}</span><span class="more">${btn}</span></a>`;
  // 역경의 탑 요약
  const tower = ['L', 'C12', 'C34', 'R'].map(z => {
    const fs = zoneFloors(ts.n, z); if (!fs.length) return '';
    const rec = zoneRec(ts.n, z); const buffs = [...new Set(fs.flatMap(f => f.b))];
    return `<article class="tower"><div><h3>${esc(ZONES[z].n)}</h3><div class="note">${esc(ZONES[z].sub)}</div></div>${rec.length ? `<div>추천 속성 ${rec.map(elTag).join(' ')}</div>` : ''}${buffs.map(b => `<div class="bufftxt">${esc(b)}</div>`).join('')}
      <div class="stack" style="gap:4px">${fs.map(f => `<div class="floor-row"><b>${f.f}층</b><span class="mons">${esc(f.m.join(', '))}</span></div>`).join('')}</div></article>`;
  }).join('');
  // 폐허
  const lvHTML = l => {
    const tm = ranked ? wastesTeams(ranked, l.h) : null;
    return `<article class="tower ws-lv"><div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;flex-wrap:wrap"><h3>${l.end ? '' : `${l.o - 6}층 · `}${esc(l.n)}</h3><span class="tag ${l.end ? 'gold' : ''}">${esc(l.z)}${l.end ? ' · 끝없는 도전' : ''}</span></div>
      <div class="ws-sc">${l.sc.map((v, i) => `<span><small>${['B', 'A', 'S', 'SS', 'SSS'][i] || ''}</small>${fmt(v)}</span>`).join('')}<span class="note">목표 점수</span></div>
      <div class="ws-h">${l.h.map((h, i) => `<div><div class="lbl">${i ? '후반' : '전반'} 파티${h.r.length ? ` · <span class="res">${h.r.map(elIdTag).join(' ')} 저항 +20%</span>` : ''}</div><div class="mons">${esc(h.m.map(m => m[0]).join(', '))}</div>${tm ? `<div style="margin-top:8px">${teamHTML(tm[i])}</div>` : ''}</div>`).join('')}</div></article>`;
  };
  const lvs = S ? S.lv : [];
  el.innerHTML = `<div class="container page"><p class="eyebrow">시즌 콘텐츠</p><h1 class="ph-t">이번 시즌 <em>엔드 콘텐츠</em></h1><p class="ph-d">역경의 탑과 죽음의 노래와 바닷속 폐허는 28일마다 바뀝니다(서로 2주 엇갈림). 이번 시즌의 적 · 버프 · 증표와 남은 시간을 한곳에서 확인하세요.</p>
    <div class="ss-grid">${card('역경의 탑 · 심경 구역', '역경의 탑', ts, '층별 버프 · 적 속성 · 추천 속성', '#/tools/tower-info', '탑 정보 · 자동 편성')}${card('재생 해역 · 해곡 · 급류', '죽음의 노래와 바닷속 폐허', ws, '전반 · 후반 2파티 · 연소 · 타오르는 조수', '#ws', '이번 시즌 구성 보기')}</div>
    <section class="sec">${secHead('역경의 탑', `심경 구역 시즌 ${ts.n} · ${ymd(ts.start)} ~ ${ymd(ts.end)}`, '')}${tower ? `<div class="tower-grid">${tower}</div>` : '<div class="empty-note">이 시즌의 탑 구성이 아직 공개 데이터에 없습니다.</div>'}
      <p style="margin-top:12px"><a class="btn sm solid-gold" href="#/tools/tower-build">내 캐릭터로 역경의 탑 자동 편성</a></p></section>
    <section class="sec" id="ws">${secHead('죽음의 노래와 바닷속 폐허', S ? `재생 해역 시즌 ${sel}${+sel === ws.n ? ' · 진행 중' : +sel < ws.n ? ' · 지난 시즌' : ' · 다음 시즌'}` : '', '')}
      ${!W ? '<div class="empty-note">폐허 데이터를 불러오는 중입니다…</div>' : !S ? '<div class="empty-note">이 시즌 구성이 아직 공개 데이터에 없습니다.</div>' : `
      <div class="fbar"><div class="grp">${Object.keys(W.seasons).map(n => `<button class="fchip" data-ws="${n}" aria-pressed="${n === sel}">시즌 ${n}${+n === ws.n ? ' · 진행 중' : +n < ws.n ? ' · 지난' : ' · 다음'}</button>`).join('')}</div></div>
      ${+sel !== ws.n ? `<p class="note">게임 데이터에는 시즌 ${W.latest}까지 있습니다. ${+sel < ws.n ? '진행 중인 시즌 데이터가 아직 없어 지난 시즌을 보여 줍니다.' : ''}</p>` : ''}
      <div class="two ws-top"><div class="box"><h3>공통 규칙</h3><ul class="prose" style="margin:0">${[S.burn, S.hot].filter(Boolean).map(x => `<li>${esc(x)}</li>`).join('')}<li>층마다 파티 2개(전반 · 후반)가 필요하고, 같은 캐릭터는 한 층에서 한 번만 씁니다.</li><li>끝 없는 심연(급류)에서는 적이 받는 최종 피해가 30% 늘고, 증표를 제한 없이 씁니다.</li></ul></div>
        <div class="box"><h3>이번 시즌 증표</h3><div class="stack" style="gap:8px">${S.tok.map(([n, d]) => `<div class="ws-tok"><b>${esc(n)}</b><span>${esc(d).replace(/\n/g, '<br>')}</span></div>`).join('') || '<p class="note">이번 시즌 전용 증표 정보가 없습니다.</p>'}</div></div></div>
      ${ranked ? '<p class="note" style="margin:14px 0 0">각 층 아래의 파티는 내 보유 캐릭터로 짠 추천입니다. 전반 · 후반의 저항 증가를 넣어 계산하고, 캐릭터가 겹치지 않으면서 두 파티가 고르게 강한 조합을 고릅니다(파티 편성과 같은 계산 + 추천 조합 · 커뮤니티 평가 보정).</p>' : `<p class="note" style="margin:14px 0 0">보유 캐릭터를 6명 이상 등록하면 층마다 전반 · 후반 추천 파티가 나옵니다. <a href="#/tools/roster">보유 캐릭터 등록</a></p>`}
      <h3 class="ws-zone">재생 해역 - 해곡 <small>5층 · 시즌마다 초기화</small></h3><div class="tower-grid">${lvs.filter(l => !l.end).map(lvHTML).join('')}</div>
      <h3 class="ws-zone">재생 해역 - 급류 <small>끝 없는 심연 · 시즌마다 초기화</small></h3><div class="tower-grid">${lvs.filter(l => l.end).map(lvHTML).join('')}</div>
      <details class="nt" style="margin-top:20px"><summary><span class="tag">상시</span><b>금기의 해역</b><time>한 번만 클리어 · 초기화 없음</time></summary><div class="body"><div class="tower-grid" style="margin-top:10px">${W.perm.map(l => `<article class="tower"><h3>${l.o}층 · ${esc(l.n)}</h3><div class="ws-h">${l.h.map((h, i) => `<div><div class="lbl">${l.h.length > 1 ? (i ? '후반' : '전반') : '적'}</div><div class="mons">${esc(h.m.map(m => m[0]).join(', '))}</div></div>`).join('')}</div></article>`).join('')}</div></div></details>`}
    </section></div>`;
  $$('[data-ws]', el).forEach(b => b.addEventListener('click', () => { state.wsSel = b.dataset.ws; renderSeason(); }));
  const go = $('.ss-card[href="#ws"]', el); if (go) go.addEventListener('click', e => { e.preventDefault(); $('#ws').scrollIntoView({ behavior: 'smooth' }); });
  if (!W) loadWastes().then(d => { if (d && curView === 'season') renderSeason(); });
}

/* ---------- 공지사항 ---------- */
const NOTICES = [
  { d: '2026-10-26', t: '사이트 주소가 화면별로 바뀌었습니다', b: ['이제 화면마다 주소가 있습니다(예: /-/characters, /-/tools/grow). 예전 주소로 들어와도 자동으로 새 주소로 넘어가니 즐겨찾기는 그대로 쓰셔도 됩니다.', '사이트를 가볍게 나눠서 첫 화면이 더 빨리 열립니다.'] },
  { d: '2026-10-26', t: '사이트가 새 모습으로 바뀌었습니다', b: ['홈 · 공명자 가이드 · 에코 계산기 · 튜닝 시뮬 · 자료실 · 공지사항 메뉴가 생겼습니다.', '기존 역경의 탑 편성 · 필드 파티 · 딜 사이클 · 육성 계산은 위쪽 "파티 편성" 메뉴에 그대로 있습니다. 저장해 둔 보유 캐릭터와 파티도 그대로입니다.', '픽업 일정은 명조 공식 공지를 3시간마다 자동으로 읽어 갱신합니다.'] }
];
function renderNotice() {
  const el = $('[data-view="notice"]'); const pn = patchNotes();
  setTimeout(() => { const b = $('#nt-more'); if (b) b.addEventListener('click', () => { state.ntAll = true; renderNotice(); }); }, 0);
  el.innerHTML = `<div class="container page"><p class="eyebrow">공지사항</p><h1 class="ph-t">사이트 <em>소식</em></h1><p class="ph-d">사이트 안내와 업데이트 내역입니다. 게임 공지는 <a href="https://wutheringwaves.kurogames.com/kr/main/news/" target="_blank" rel="noopener">명조 공식 홈페이지</a>에서 확인해 주세요.</p>
    <section class="sec" style="margin-top:28px">${secHead('안내', '', '')}${NOTICES.map((n, i) => `<details class="nt" ${i === 0 ? 'open' : ''}><summary><span class="tag gold">공지</span><b>${esc(n.t)}</b><time>${esc(n.d)}</time></summary><div class="body"><ul>${n.b.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></details>`).join('')}</section>
    <section class="sec" id="updates">${secHead('업데이트 내역', `버전별 변경 사항 · 현재 Ver. ${esc(pn[0].v)}`, '')}${pn.map((p, i) => `<details class="nt" ${i === 0 ? 'open' : ''} ${i >= 8 && !state.ntAll ? 'hidden' : ''}><summary><span class="tag">Ver. ${esc(p.v)}</span><b>${esc(p.s)}</b><time>${esc(p.d)}</time></summary><div class="body">${(p.g || []).map(g => `<p style="margin:10px 0 4px"><b>${esc(g.h)}</b></p><ul>${g.i.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`).join('')}</div></details>`).join('')}
      ${pn.length > 8 && !state.ntAll ? `<p style="text-align:center;margin-top:14px"><button class="btn" id="nt-more">이전 버전 ${pn.length - 8}개 더 보기</button></p>` : ''}</section></div>`;
}

/* ---------- 소개 ---------- */
let HELP_NODE = null;
const scrollHelp = () => { const h = $('#intro-help-sec'); if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
function showHelp() { if (curView === 'intro') scrollHelp(); else { navigate('intro'); setTimeout(scrollHelp, 60); } }
function renderIntro() {
  const el = $('[data-view="intro"]');
  const F = [['#/characters', '공명자 가이드', '공명자마다 Lv.90 기본 스탯, 스킬, 공명 체인, 추천 무기 · 에코 세트, 추천 조합, 육성 재료를 한 페이지에.'],
    ['#/tools/tower-build', '역경의 탑 자동 편성', '보유 캐릭터와 이번 시즌 층별 버프로 파티 합산 1사이클 피해가 가장 높은 편성을 찾습니다.'],
    ['#/tools/timeline', '딜 사이클', '추천 조합이나 내 파티가 한 바퀴 도는 동안 누가 언제 무엇을 하는지 순서대로 보여 줍니다.'],
    ['#/echo', '에코 계산기', '에코 5개의 주옵션 · 부옵션으로 속성 화면 스탯과 크리티컬 점수를 계산합니다.'],
    ['#/season', '시즌 콘텐츠', '역경의 탑과 죽음의 노래와 바닷속 폐허의 이번 시즌 적 · 버프 · 증표, 초기화까지 남은 시간, 폐허 전반 · 후반 추천 파티.'],
    ['#/sim', '튜닝 시뮬레이터', '공개된 확률 규칙으로 캐릭터 · 무기 이벤트 튜닝을 미리 돌려 봅니다.'],
    ['#/tools/grow', '육성 계산', '돌파 · 스킬 · 공명 노드에 필요한 재료와 파밍 횟수, 결정 웨이브 플레이트를 계산합니다.']];
  el.innerHTML = `<div class="container page"><p class="eyebrow">소개</p><h1 class="ph-t">명조를 더 똑똑하게,<br><em>띵조 AUTO TEAM MAKER</em></h1>
    <p class="ph-d">명조: 워더링 웨이브를 즐기는 사람들을 위한 팬 사이트입니다. 게임 데이터로 공명자 정보를 정리하고, 보유 캐릭터로 짤 수 있는 최적의 파티를 계산합니다. 로그인 없이도 쓸 수 있고(설정은 이 브라우저에 저장), 위쪽 로그인 버튼으로 계정을 만들면 휴대폰과 컴퓨터에서 같은 설정을 씁니다.</p>
    <p style="margin-top:16px"><button class="btn sm" id="intro-to-help">사용 설명 바로 보기 ↓</button></p>
    <section class="sec">${secHead('이런 걸 할 수 있어요', '', '')}<div class="intro-grid">${F.map(([h, n, d]) => `<a class="mini-feat" href="${h}"><b>${n}</b><span>${d}</span></a>`).join('')}</div></section>
    <section class="sec">${secHead('데이터는 이렇게 갱신돼요', '', '')}<div class="intro-grid">
      <div class="box"><h3>게임 데이터</h3><p class="note">공명자 · 무기 · 재료 · 역경의 탑 구성은 공개 게임 데이터 저장소(Arikatsu/WutheringWaves_Data)를 씁니다. 새 공명자는 매일 자동으로 확인해 추가합니다.</p></div>
      <div class="box"><h3>픽업 · 버전 일정</h3><p class="note">명조 공식 홈페이지 공지를 3시간마다 읽어 픽업 기간과 버전 정보를 갱신합니다. 공지에 빠진 배너는 게임 데이터의 튜닝 화면 정보로 채웁니다.</p></div>
      <div class="box"><h3>일러스트</h3><p class="note">캐릭터 카드 · 전신 · 픽업 배너 그림은 게임 UI 리소스 저장소에서 받아 작게 줄여 씁니다. 새 공명자가 생기면 함께 만들어집니다.</p></div></div></section>
    <section class="sec" id="intro-help-sec">${secHead('사용 설명', '파티 편성 · 캐릭터 설정 · 계산 방식 · 자주 묻는 질문', '')}<div id="intro-help"></div></section>
    <section class="sec">${secHead('알아 두세요', '', '')}<div class="box"><ul class="prose" style="margin:0">
      <li>예상 피해 · 튜닝 확률은 비교를 위한 추정치이며, 실제 게임 결과와 다를 수 있습니다.</li>
      <li>팬이 만든 비공식 사이트로, KURO GAMES와 관련이 없습니다. 게임 이미지와 이름의 권리는 KURO GAMES에 있습니다.</li>
      <li>스킬 레벨, 에코 옵션, 속성 화면 스탯은 공명자의 무기 · 체인 설정 창에서 입력하면 파티 편성 계산에 바로 반영됩니다.</li></ul></div></section></div>`;
  const help = HELP_NODE || (HELP_NODE = $('#help-src .help')); if (help) $('#intro-help').appendChild(help);
  $('#intro-to-help').addEventListener('click', scrollHelp);
}

/* ---------- 공명자 가이드 (목록) ---------- */
function renderCharacters() {
  const el = $('[data-view="characters"]');
  const f = state.cgF || (state.cgF = { el: 'all', wt: 'all', q: 'all', role: 'all', own: false, s: '' });
  const pick = new Map(bannersNow('char').map(x => [x.f5[0], x]));
  const chip = (g, v, n, extra = '') => `<button class="fchip" data-cf="${g}" data-v="${v}" aria-pressed="${f[g] === v}">${extra}${n}</button>`;
  const s = f.s.trim().replace(/[\s·]/g, '');
  const list = CHARS.filter(c => (f.el === 'all' || c.el === f.el) && (f.wt === 'all' || String(c.wt) === f.wt) && (f.q === 'all' || String(c.q) === f.q) && (f.role === 'all' || c.role === f.role) && (!f.own || state.owned.has(c.id)) && (!s || c.name.replace(/[\s·]/g, '').includes(s)));
  el.innerHTML = `<div class="container page"><p class="eyebrow">공명자 가이드</p><h1 class="ph-t">공명자 <em>육성 가이드</em></h1><p class="ph-d">공명자를 눌러 기본 스탯, 스킬 · 공명 체인, 추천 무기와 에코 세트, 추천 조합, 육성 재료를 확인하세요.</p>
    <div class="fbar">
      <div class="grp"><span class="lbl">속성</span>${chip('el', 'all', '전체')}${Object.entries(EL).map(([k, v]) => chip('el', k, v.n, `<i class="el-i" style="--elc:${v.c}"></i>`)).join('')}</div>
      <div class="grp"><span class="lbl">무기</span>${chip('wt', 'all', '전체')}${Object.entries(WT).map(([k, v]) => chip('wt', k, v)).join('')}</div>
      <div class="grp"><span class="lbl">등급</span>${chip('q', 'all', '전체')}${chip('q', '5', '5성')}${chip('q', '4', '4성')}</div>
      <div class="grp"><span class="lbl">역할</span>${chip('role', 'all', '전체')}${Object.entries(ROLE_N).map(([k, v]) => chip('role', k, v.split('·')[0])).join('')}</div>
      <label class="chk"><input type="checkbox" id="cg-own" ${f.own ? 'checked' : ''}> 보유만</label>
      <input type="search" id="cg-s" placeholder="공명자 이름 검색" value="${esc(f.s)}" aria-label="공명자 이름 검색">
    </div>
    <p class="note" style="margin:0 0 12px">${list.length}명</p>
    ${list.length ? `<div class="cc-grid wide">${list.map(c => ccHTML(c, { tags: (pick.has(c.rid) ? pickTag(pick.get(c.rid)) : '') + (isUpcoming(c) ? `<span class="tag next">${esc(releaseLabel(c))}</span>` : '') + (c.auto ? '<span class="tag">자동 추가</span>' : '') })).join('')}</div>` : '<div class="empty-note">조건에 맞는 공명자가 없습니다.</div>'}</div>`;
  $$('[data-cf]', el).forEach(b => b.addEventListener('click', () => { f[b.dataset.cf] = b.dataset.v; renderCharacters(); }));
  $('#cg-own').addEventListener('change', e => { f.own = e.target.checked; renderCharacters(); });
  let tm; $('#cg-s').addEventListener('input', e => { clearTimeout(tm); tm = setTimeout(() => { f.s = e.target.value; renderCharacters(); const i = $('#cg-s'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250); });
}

/* ---------- 공명자 가이드 (상세) ---------- */
const SK_N = { n: '일반 공격', s: '공명 스킬', f: '공명 회로', l: '공명 해방', i: '변주 스킬', o: '반주 스킬' };
function renderCharacter(id) {
  const el = $('[data-view="character"]'); const c = CH[id]; if (!c) return;
  const rid = c.rid; const bs = (RAW_BASE[rid]) || c.base || null;
  const nd = (RAW_NODE[rid]) || c.node || {};
  const skn = (RAW_SKILLN[rid]) || {};
  const chain = (RAW_CHAIN[rid]) || {};
  const pk = bannersNow('char').find(x => x.f5[0] === rid);
  const bg = artUrl('bg', rid), full = artUrl('full', rid);
  const presets = PRESETS.filter(p => p.m.includes(c.id) && p.m.every(i => CH[i]));
  const alts = PRESETS.flatMap(p => (p.v || []).filter(v => v.m.includes(c.id) && !p.m.includes(c.id) && v.m.every(i => CH[i])).map(v => ({ ...v, t: p.t })));
  const wpHTML = (wid, label) => { const w = RAW_WEAPONS[wid]; if (!w) return ''; return `<div class="wp">${IMG_WEAPON[wid] ? `<img src="${IMG_WEAPON[wid]}" alt="">` : '<img alt="">'}<div><div><span class="tag">${label}</span> <b class="r${w.q}">★${w.q} ${esc(w.n)}</b></div><div class="note">${esc(WT[w.wt])} · 공격력 ${w.atk} · ${esc(STAT_N[w.sub[0]] || w.sub[0])} ${w.sub[1]}%</div><div class="d">${esc(w.d)}</div></div></div>`; };
  const setHTML = (sid, label) => { const st = RAW_SETS[sid]; if (!st) return ''; return `<div class="wp">${IMG_SET[sid] ? `<img src="${IMG_SET[sid]}" alt="">` : '<img alt="">'}<div><div><span class="tag">${label}</span> <b>${esc(st.n)}</b></div>${st.e.map(([n, d]) => `<div class="d"><b>${n}세트</b> ${esc(d)}</div>`).join('')}</div></div>`; };
  const G = RAW_GROW.chars[rid];
  const mats = G && G.cat ? [['boss', '보스 재료'], ['spec', '특산물'], ['weekly', '주간 보스']].filter(([k]) => G.cat[k]).map(([k, n]) => [G.cat[k], n])
    .concat([[G.cat.forte && G.cat.forte[3], '스킬 재료(최고 등급)'], [G.cat.common && G.cat.common[3], '공용 재료(최고 등급)']].filter(x => x[0])) : [];
  const teamRow = (m, t, d, tag) => `<div class="team-row"><div class="mems">${m.map(i => `<a href="#/character/${i}">${portraitHTML(CH[i])}<div>${esc(CH[i].name)}</div></a>`).join('')}</div><div class="tt">${tag || ''}<b>${esc(t)}</b><span>${esc(d || '')}</span></div></div>`;
  el.innerHTML = `<section class="ch-hero" style="--elc:${elColor(c)}">
      ${bg ? `<div class="bg" style="background-image:url('${bg}')"></div>` : '<div class="elbg"></div>'}
      ${full ? `<img class="art" src="${full}" alt="">` : ''}
      <div class="ch-hero-in">
        <div class="crumb"><a href="#/characters">공명자 가이드</a> › ${esc(c.name)}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:auto">${pk ? pickTag(pk) + '<span class="tag gold">지금 픽업</span>' : ''}${isUpcoming(c) ? `<span class="tag next">${esc(releaseLabel(c))}</span>` : ''}${c.auto ? '<span class="tag">자동 추가 · 추정</span>' : ''}<span class="stars ${c.q === 4 ? 'r4' : ''}" style="font-size:15px">${'★'.repeat(c.q)}</span></div>
        <h1 style="margin:0">${esc(c.name)}</h1>
        <div class="ch-attr"><span><i class="el-i"></i>${EL[c.el] ? EL[c.el].n : ''}</span><span>${WT[c.wt] || ''}</span><span>${ROLE_N[c.role] || ''}</span>${(c.tags || []).slice(0, 3).map(t => `<span>${esc(t)}</span>`).join('')}</div>
        ${c.outro ? `<p class="ch-outro"><b style="color:var(--gold)">반주 · ${esc(c.outro.n)}</b> ${esc(c.outro.d)}</p>` : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm ${state.owned.has(c.id) ? 'glass' : 'solid-gold'}" id="ch-own">${state.owned.has(c.id) ? '보유 중 · 빼기' : '보유 캐릭터에 추가'}</button>${G ? '<button class="btn sm glass" id="ch-grow">육성 재료 계산</button>' : ''}<button class="btn sm glass" id="ch-cfg">무기 · 체인 설정</button></div>
      </div></section>
    <div class="container ch-body">
      <div>
        ${bs ? `<div class="box"><h3>Lv.90 기본 스탯 <small>게임 데이터 · 무기 · 에코 제외</small></h3><div class="kv"><div><span>공격력</span><b>${fmt(bs[0])}</b></div><div><span>HP</span><b>${fmt(bs[1])}</b></div><div><span>방어력</span><b>${fmt(bs[2])}</b></div><div><span>크리티컬</span><b>${bs[3]}%</b></div><div><span>크리티컬 피해</span><b>${bs[4]}%</b></div>${Object.entries(nd).map(([k, v]) => `<div><span>공명 노드 · ${esc({ cr: '크리티컬', cd: '크리티컬 피해', el: '속성 피해', atk: '공격력', hp: 'HP', def: '방어력', heal: '치료 효과' }[k] || k)}</span><b>+${v}%</b></div>`).join('')}</div></div>` : ''}
        <div class="box" id="ch-skills"><h3>스킬 <small>게임 데이터 · 눌러서 설명 보기</small></h3><div class="sk">${Object.entries(SK_N).filter(([k]) => skn[k]).map(([k, n]) => `<div><span>${n}</span>${esc(skn[k])}</div>`).join('')}</div></div>
        ${rotBoxHTML(c, presets)}
        ${Object.keys(chain).length ? `<div class="box"><h3>공명 체인</h3><div class="chain">${[1, 2, 3, 4, 5, 6].filter(i => chain[i]).map(i => `<details><summary><span class="s">S${i}</span>${esc(chain[i].n)}</summary><p>${esc(chain[i].d)}</p></details>`).join('')}</div></div>` : ''}
        ${presets.length || alts.length ? `<div class="box"><h3>추천 조합 <small><a href="#/tools/presets">추천 조합 전체</a></small></h3>${presets.map(p => teamRow(p.m, p.t, p.d, `<span class="tag gold">${esc(p.tag)}</span> `)).join('')}${alts.slice(0, 4).map(v => teamRow(v.m, v.t, v.n, `<span class="tag">${v.k === 'f2p' ? '입문' : '대체'}</span> `)).join('')}</div>` : ''}
      </div>
      <aside>
        <div class="box"><h3>추천 무기</h3>${wpHTML(c.w, c.q === 5 ? '전용 · 5성' : '5성')}${c.w4 && c.w4 !== c.w ? wpHTML(c.w4, '4성') : ''}</div>
        <div class="box" id="ch-echo"><h3>추천 메인 에코</h3><p class="note" style="margin:0">불러오는 중…</p></div>
        ${c.set ? `<div class="box"><h3>추천 에코 세트</h3>${setHTML(c.set, '5세트')}${(c.set2 || []).map(s => setHTML(s, '2세트')).join('')}</div>` : ''}
        ${mats.length ? `<div class="box"><h3>육성 재료</h3><div class="mats">${mats.map(([k, n]) => `<div class="mat">${itemIcon(k, 36)}<div><div style="font-size:11px;color:var(--muted)">${n}</div>${esc(itemName(k))}</div></div>`).join('')}</div></div>` : ''}
      </aside>
    </div>`;
  $('#ch-own').addEventListener('click', () => { if (state.owned.has(c.id)) state.owned.delete(c.id); else state.owned.add(c.id); save(); paintOwnedChip(); toast(state.owned.has(c.id) ? `${c.name}을(를) 보유 캐릭터에 넣었습니다.` : `${c.name}을(를) 보유 캐릭터에서 뺐습니다.`); renderCharacter(id); });
  if ($('#ch-grow')) $('#ch-grow').addEventListener('click', () => { state.grow = growDefault(c.id); save(); navigate('tools/grow'); });
  $('#ch-cfg').addEventListener('click', () => openCharCfg(c.id));
  $$('[data-tlgo]', el).forEach(b => b.addEventListener('click', () => { state.tlSel = b.dataset.tlgo; navigate('tools/timeline'); window.scrollTo(0, 0); }));
  loadEchoes().then(d => { const box = $('#ch-echo'); if (box && curView === 'character' && CH[id] === c) box.innerHTML = mainEchoHTML(c, d); });
  loadSkills(rid).then(rows => { const box = $('#ch-skills'); if (rows && box && curView === 'character' && CH[id] && CH[id].rid === rid) box.innerHTML = skillsHTML(rows); });
}
// 추천 메인 에코: public/echoes.json (tools/build_echoes.py — 공략 사이트 추천 + 게임 데이터)
let ECHOES_P = null;
const loadEchoes = () => ECHOES_P || (ECHOES_P = fetch(`${BASE}echoes.json?h=${Math.floor(Date.now() / 864e5)}`).then(r => r.ok ? r.json() : null).catch(() => null));
function mainEchoHTML(c, d) {
  const x = d && d.chars && d.chars[c.id];
  if (!x || !x.m.length) return '<h3>추천 메인 에코</h3><p class="note" style="margin:0">이 공명자의 메인 에코 정보가 아직 없습니다.</p>';
  const row = (eid, i) => {
    const e = d.echoes[eid]; if (!e) return '';
    const img = `${BASE}assets/echo/${eid}.webp`; // 아이콘은 echoes.json과 함께 만들어짐
    const sets = (e.sets || []).map(sid => `<span class="tag ${sid === c.set ? 'gold' : ''}" title="${sid === c.set ? '이 공명자의 추천 세트' : ''}">${esc((RAW_SETS[sid] || {}).n || `세트 ${sid}`)}</span>`).join(' ');
    return `<div class="wp me-row"><img src="${img}" alt="" loading="lazy" onerror="this.style.visibility='hidden'"><div><div><span class="tag ${i ? '' : 'gold'}">${i ? '대안' : '1순위'}</span> <b>${esc(e.n)}</b> <span class="note">4코스트${e.cd ? ` · 쿨타임 ${e.cd}초` : ''}</span></div>
      <div class="me-sets">${sets}</div><div class="d">${esc(e.d).replace(/\n/g, '<br>')}</div></div></div>`;
  };
  return `<h3>추천 메인 에코 <small>${x.src === 'guide' ? '공략 사이트 추천' : '게임 데이터로 추정'}</small></h3>${x.m.map((eid, i) => row(String(eid), i)).join('')}
    <p class="note" style="margin:8px 0 0">${x.src === 'guide' ? '출처: wuwabuild.com 공명자 빌드(3.7) · ldshop.gg 에코 가이드. 이름 · 효과는 게임 데이터 기준입니다.' : '공략 정보가 아직 없어, 추천 세트에 속하고 속성 · 주력 공격 유형과 맞는 4코스트 에코를 골랐습니다.'} 금색 세트 표시는 이 공명자의 추천 세트와 같은 세트입니다.</p>`;
}
// 스킬 설명: public/skills/<rid>.json (tools/build_skills.py가 게임 데이터로 만듦) — 이 화면을 열 때만 받아 옴
const SKILL_CACHE = {};
function loadSkills(rid) {
  if (!SKILL_CACHE[rid]) SKILL_CACHE[rid] = fetch(`${BASE}skills/${rid}.json`).then(r => r.ok ? r.json() : null).catch(() => null);
  return SKILL_CACHE[rid];
}
const SK_KIND = { ...SK_N, p: '고유 스킬' };
const hlText = t => esc(t).replace(/⟦(.*?)⟧/g, '<b class="hl">$1</b>').replace(/\n/g, '<br>');
function skillsHTML(rows) {
  return `<h3>스킬 <small>게임 데이터 · 눌러서 설명 보기</small></h3><div class="chain skd">${rows.map(([k, n, sec]) => `<details><summary><span class="s">${esc(SK_KIND[k] || '')}</span>${esc(n)}</summary>${sec.map(([h, b]) => `${h ? `<h4>${esc(h)}</h4>` : ''}<p>${hlText(b)}</p>`).join('')}</details>`).join('')}</div>`;
}
// 딜 사이클: ROT 데이터(공명 모드별) + 추천 조합의 딜 사이클 탭 바로 가기
function rotBoxHTML(c, presets) {
  const r = ROT[c.id]; if (!r && !presets.length) return '';
  const modes = r ? (r.modes ? Object.keys(r.modes).map(k => [(c.modes && c.modes[k] && c.modes[k].n) || k, rotOf(c, k)]) : [['', r]]) : [];
  const one = (lbl, x) => x && x.loop ? `<div class="rot">${lbl ? `<p style="margin:0 0 6px"><span class="tag">${esc(lbl)} 모드</span></p>` : ''}<ol class="rot-l">${x.loop.map(st => `<li>${esc(st)}</li>`).join('')}</ol>
    <p class="note" style="margin:6px 0 0">필드 시간 약 ${x.ft || '?'}초${x.full ? ' · 사이클을 끝까지 돌린 뒤 교체' : ''}</p>${x.tip ? `<p class="note" style="margin:4px 0 0">${esc(x.tip)}</p>` : ''}</div>` : '';
  const body = modes.map(([l, x]) => one(l, x)).join('');
  const go = presets.slice(0, 3).map(p => `<button class="btn sm" data-tlgo="k${esc(p.id)}">${esc(p.t)} 딜 사이클</button>`).join('');
  return `<div class="box"><h3>딜 사이클 <small>${r ? '혼자 필드에 있을 때의 순서' : ''}</small></h3>${body || '<p class="note" style="margin:0">이 공명자의 단독 사이클 정보는 아직 없습니다. 추천 조합의 사이클을 확인해 보세요.</p>'}${go ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">${go}</div><p class="note" style="margin:6px 0 0">파티 3명이 한 바퀴 도는 순서를 파티 편성의 딜 사이클 탭에서 보여 줍니다.</p>` : ''}</div>`;
}
function paintOwnedChip() { const c = $('#owned-chip'); if (c) c.textContent = `보유 ${state.owned.size}명`; }

/* ---------- 에코 계산기 ---------- */
const LS_ECHO_CALC = 'ddingjo-atm-echo-calc';
// 목표치(참고값): 역할별 크리티컬 · 공명 효율, 주 스탯은 공명자가 쓰는 스탯(공격력 · HP · 방어력) 기준
const ECHO_GOALS = {
  main: { n: '메인 딜러', cr: 75, cd: 260, er: 120, d: '크리티컬 1 : 크리티컬 피해 2 비율 + 해방을 제때 쓸 정도의 공명 효율' },
  sub: { n: '서브 딜러 · 버퍼', cr: 65, cd: 220, er: 140, d: '해방을 사이클마다 쓰는 것이 먼저, 그다음 크리티컬' },
  sup: { n: '서포터', cr: 0, cd: 0, er: 160, d: '공명 효율로 해방 · 반주를 빨리 돌리고, 주 스탯(치유 · 버프 기준)을 올리기' }
};
function echoMainGoal(c, sc) {
  const bs = (RAW_BASE[c.rid]) || null;
  if (sc === 'hp' && bs) return Math.round((bs[1] * 2.1 + 4560) / 500) * 500;   // HP% 약 +110% + 1코스트 고정 HP
  if (sc === 'def' && bs) return Math.round((bs[2] * 2.3) / 100) * 100;          // 방어력% 약 +130%
  return Math.round(ATK_REF / 100) * 100;
}
function echoCalcState() {
  if (!state.ec) { try { state.ec = JSON.parse(lsGet(LS_ECHO_CALC) || 'null'); } catch (e) { state.ec = null; } }
  if (!state.ec || !CH[state.ec.id]) { const c0 = CHARS.find(c => c.q === 5 && c.role === 'main' && !isUpcoming(c)); state.ec = { id: c0.id, echo: null, w: 0 }; }
  const c = CH[state.ec.id];
  if (!state.ec.echo) { const o = state.ov[c.id] || {}; state.ec.echo = (o.echo && Array.isArray(o.echo.e)) ? JSON.parse(JSON.stringify(o.echo)) : ECHO_DEFAULT(scaleOf(c)); }
  return state.ec;
}
function echoGrade(cv) { return cv >= 200 ? ['SS', '종결급'] : cv >= 170 ? ['S', '준종결'] : cv >= 140 ? ['A', '훌륭함'] : cv >= 110 ? ['B', '쓸 만함'] : cv >= 70 ? ['C', '육성 중'] : ['D', '시작 단계']; }
function renderEcho() {
  const el = $('[data-view="echo"]'); const E = echoCalcState(); const c = CH[E.id];
  const ws = weaponsForType(c.wt); const wid = E.w && RAW_WEAPONS[E.w] ? E.w : ((state.ov[c.id] || {}).w || c.w);
  const gk = ECHO_GOALS[E.goal] ? E.goal : (ECHO_GOALS[c.role] ? c.role : 'main');
  const opts = Object.entries(EL).map(([k, v]) => `<optgroup label="${v.n}">${CHARS.filter(x => x.el === k).map(x => `<option value="${x.id}" ${x.id === c.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</optgroup>`).join('');
  el.innerHTML = `<div class="container page"><p class="eyebrow">에코 계산기</p><h1 class="ph-t">나의 에코,<em> 어디까지 강해질까요?</em></h1><p class="ph-d">에코 5개의 코스트 · 주옵션 · 부옵션을 넣으면 속성 화면 스탯(무기 · 에코 세트 상시 효과 포함)과 크리티컬 점수를 계산합니다. 입력은 이 브라우저에 저장됩니다.</p>
    <div class="two" style="margin-top:24px">
      <div class="box"><div class="ec-pick"><label class="lbl" for="ec-char">공명자</label><select id="ec-char">${opts}</select><label class="lbl" for="ec-w">무기</label><select id="ec-w">${ws.map(w => `<option value="${w.id}" ${+w.id === +wid ? 'selected' : ''}>★${w.q} ${esc(w.n)}</option>`).join('')}</select><label class="lbl" for="ec-goal">목표 기준</label><select id="ec-goal">${Object.entries(ECHO_GOALS).map(([k, g]) => `<option value="${k}" ${k === gk ? 'selected' : ''}>${g.n}${k === c.role ? ' (이 공명자 역할)' : ''}</option>`).join('')}</select></div>
        <div class="ec-grid" id="ec-slots">${E.echo.e.map((x, i) => echoSlotHTML(c, x, i)).join('')}</div>
        ${Object.entries(ECHO_SUB).map(([k, d]) => `<datalist id="ec-dl-${k}">${d[1].map(v => `<option value="${v}">`).join('')}</datalist>`).join('')}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn sm" id="ec-std">기본 주옵션으로</button><button class="btn sm" id="ec-clear">부옵션 모두 지우기</button></div></div>
      <div><div class="box" id="ec-out"></div></div>
    </div></div>`;
  const read = () => ({ on: true, e: $$('#ec-slots .ec-slot').map(sl => ({ c: +$('.ec-c', sl).value, m: $('.ec-m', sl).value,
    sub: $$('.ec-sub', sl).map(r => [$('.ec-sk', r).value, $('.ec-sv', r).value === '' ? 0 : +$('.ec-sv', r).value]).filter(([k, v]) => k && v > 0) })) });
  const paint = () => {
    $$('#ec-slots .ec-slot').forEach(sl => { const cst = +$('.ec-c', sl).value; const cur = $('.ec-m', sl).value; $('.ec-m', sl).innerHTML = echoMainOpts(c, cst, cur); const M = ECHO_MAIN[cst]; $('.ec-sec', sl).textContent = M && M._sec ? `+ ${M._sec[0] === 'hp' ? 'HP' : '공격력'} ${M._sec[1]}` : ''; });
    const e = read(); E.echo = e; E.w = +$('#ec-w').value; lsSet(LS_ECHO_CALC, JSON.stringify(E));
    const t = echoSum(e); const subCr = e.e.reduce((a, x) => a + x.sub.filter(s => s[0] === 'cr').reduce((b, s) => b + s[1], 0), 0); const subCd = e.e.reduce((a, x) => a + x.sub.filter(s => s[0] === 'cd').reduce((b, s) => b + s[1], 0), 0);
    const cv = subCr * 2 + subCd; const [g, gn] = echoGrade(cv);
    const ov = { ...state.ov, [c.id]: { ...(state.ov[c.id] || {}), st: null, w: E.w, r: (RAW_WEAPONS[E.w] || {}).q === 5 ? 1 : 5, echo: { ...e, on: true } } };
    const pe = panelEstimate(c.id, state.settings, ov);
    const G = ECHO_GOALS[gk]; const sc = pe.scale; const main = sc !== 'atk' && pe[sc] ? [sc === 'hp' ? 'HP' : '방어력', pe[sc], gk === 'sup' ? null : echoMainGoal(c, sc)] : ['공격력', pe.atk, gk === 'sup' ? null : echoMainGoal(c, 'atk')];
    const bar = (n, v, goal, unit = '') => `<div class="stat-bar"><div class="top"><span>${n}</span><b>${v > 999 ? fmt(v) : v}${unit}${goal ? ` <span>/ 목표 ${goal > 999 ? fmt(goal) : goal}${unit}</span>` : ''}</b></div>${goal ? `<div class="track"><div class="fill" style="width:${Math.min(100, v / goal * 100)}%"></div></div>` : ''}</div>`;
    const tips = []; if (gk === 'sup') { if ((pe.er || 100) < G.er) tips.push('서포터는 공명 효율이 먼저예요. 3코스트 주옵션 공명 효율이나 부옵션 공명 효율을 노려 보세요.'); if (sc !== 'atk') tips.push(`${sc === 'hp' ? 'HP' : '방어력'}에 비례하는 공명자라 1 · 3 · 4코스트 주옵션을 ${sc === 'hp' ? 'HP' : '방어력'}%로 맞추면 좋아요.`); }
    else if (pe.cr < G.cr - 15) tips.push('크리티컬이 낮아요. 4코스트 주옵션 크리티컬이나 부옵션 크리티컬을 먼저 올려 보세요.');
    if (gk !== 'sup' && (pe.er || 100) < G.er - 10) tips.push(`공명 효율이 목표(${G.er}%)보다 낮아요. 해방을 사이클마다 못 쓸 수 있어요.`);
    if (gk !== 'sup' && pe.cr > 0 && pe.cd / Math.max(pe.cr, 1) < 2.8 && pe.cr >= 60) tips.push('크리티컬 대비 크리티컬 피해가 낮아요. 크리티컬 피해 부옵션을 노려 보세요.');
    if (pe.cr >= 95) tips.push('크리티컬이 100%에 가까워요. 이제 크리티컬 피해 · 공격력이 더 효율적입니다.');
    if (t.cost > 12) tips.push('코스트 합이 12를 넘었습니다. 게임에서는 장착할 수 없어요.');
    $('#ec-out').innerHTML = `<div class="score"><div class="g">${g}</div><div class="v">크리티컬 점수 <b class="num">${cv.toFixed(1)}</b> · ${gn}<br><span class="note">부옵션의 크리티컬×2 + 크리티컬 피해</span></div></div>
      <div style="display:grid;gap:12px">${bar(main[0], main[1], main[2])}${bar('크리티컬', pe.cr, G.cr, '%')}${bar('크리티컬 피해', pe.cd, G.cd, '%')}${bar(`${EL[c.el].n} 피해 보너스`, pe.el, null, '%')}${bar('공명 효율', +(pe.er || 100).toFixed(1), G.er, '%')}</div>
      <p class="note" style="margin:12px 0 0">코스트 <b class="num ${t.cost > 12 ? 'bad' : ''}">${t.cost}</b> / 12 · 목표치는 <b>${esc(G.n)}</b> 기준 참고값입니다(${esc(G.d)}). 크리티컬 기대 배율 ${(1 + Math.min(pe.cr, 100) / 100 * (pe.cd / 100 - 1)).toFixed(3)}배</p>
      ${tips.length ? `<ul class="prose" style="margin:10px 0 0">${tips.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm solid-gold" id="ec-apply">파티 편성 계산에 이 에코 쓰기</button><a class="btn sm" href="#/character/${c.id}">${esc(c.name)} 가이드</a></div>
      <p class="note" style="margin:8px 0 0">누르면 이 에코가 파티 편성 · 딜 계산에 반영됩니다(그 공명자의 무기 · 체인 설정 창에서도 바꿀 수 있어요).</p>`;
    $('#ec-apply').addEventListener('click', () => {
      state.ov[c.id] = { ...(state.ov[c.id] || {}), w: E.w, r: (state.ov[c.id] || {}).r || ((RAW_WEAPONS[E.w] || {}).q === 5 ? 1 : 5), st: { on: false }, echo: { ...read(), on: true } };
      save(); toast(`${c.name}의 에코를 파티 편성 계산에 반영했습니다.`);
    });
  };
  $('#ec-char').addEventListener('change', e => { state.ec = { id: e.target.value, echo: null, w: 0 }; renderEcho(); });
  $('#ec-w').addEventListener('change', paint);
  $('#ec-goal').addEventListener('change', e => { E.goal = e.target.value; lsSet(LS_ECHO_CALC, JSON.stringify(E)); renderEcho(); });
  $('#ec-slots').addEventListener('change', e => {
    if (e.target.classList.contains('ec-sk')) { const inp = e.target.parentElement.querySelector('.ec-sv'); inp.setAttribute('list', 'ec-dl-' + e.target.value); const d = ECHO_SUB[e.target.value]; inp.max = d ? d[1][d[1].length - 1] : ''; inp.placeholder = d ? `${d[1][0]}~${d[1][d[1].length - 1]}` : ''; if (!e.target.value) inp.value = ''; }
    paint();
  });
  $('#ec-slots').addEventListener('input', e => { if (e.target.classList.contains('ec-sv')) paint(); });
  $('#ec-std').addEventListener('click', () => { const keep = read(); const d = ECHO_DEFAULT(scaleOf(c)); $('#ec-slots').innerHTML = d.e.map((x, i) => echoSlotHTML(c, { ...x, sub: (keep.e[i] || {}).sub || [] }, i)).join(''); paint(); });
  $('#ec-clear').addEventListener('click', () => { $$('#ec-slots .ec-sk').forEach(x => { x.value = ''; }); $$('#ec-slots .ec-sv').forEach(x => { x.value = ''; }); paint(); });
  paint();
}

/* ---------- 튜닝 시뮬레이터 ----------
   공개 규칙: 5성 기본 0.8% · 4성 6% · 80회 안에 5성 확정 · 10회마다 4성 이상 확정
   캐릭터 이벤트: 5성 픽업 50%, 놓치면 다음 5성은 픽업 확정 / 4성은 픽업 50%
   무기 이벤트: 5성은 픽업 무기 확정
   66회째부터 확률이 오르는 정도(1회당 +3%p)는 공식 발표가 없어, 종합 확률 1.8%에 맞춘 추정치입니다. */
const SIM_STD5 = ['verina', 'encore', 'calcharo', 'lingyang', 'jianxin'];
const SIM_SOFT = 66, SIM_STEP = 0.03;
function simBanners() {
  const out = []; const now = Date.now();
  evItems().filter(x => (x.k === 'char' || x.k === 'weapon') && x.E > now).forEach(x => out.push({ key: `${x.k}:${x.f5[0]}:${x.E}`, type: x.k, f5: x.f5[0], f4: x.f4 || [], label: `${x.k === 'char' ? '캐릭터' : '무기'} · ${x.k === 'char' ? ((charByRid(x.f5[0]) || {}).name || '') : ((RAW_WEAPONS[x.f5[0]] || {}).n || '')}${x.S > now ? ' (예정)' : ''}` }));
  if (!out.some(b => b.type === 'char')) { const c = CHARS.find(c => c.q === 5 && !isUpcoming(c) && !SIM_STD5.includes(c.id)); if (c) out.push({ key: `char:${c.rid}`, type: 'char', f5: c.rid, f4: [], label: `캐릭터 · ${c.name}` }); }
  if (!out.some(b => b.type === 'weapon')) { const c = CHARS.find(c => c.q === 5 && !isUpcoming(c) && RAW_WEAPONS[c.w]); if (c) out.push({ key: `weapon:${c.w}`, type: 'weapon', f5: c.w, f4: [], label: `무기 · ${RAW_WEAPONS[c.w].n}` }); }
  return out;
}
function simState() {
  const bs = simBanners();
  if (!state.sim || !bs.some(b => b.key === state.sim.key)) state.sim = { key: bs[0] && bs[0].key, p5: 0, p4: 0, g5: false, g4: false, n: 0, n5: 0, n4: 0, last: [], hist: [], pity5s: [] };
  return { S: state.sim, B: bs.find(b => b.key === state.sim.key) || bs[0], bs };
}
function simPull(B, S) {
  S.n++; S.p5++; S.p4++;
  const p5 = S.p5 >= 80 ? 1 : S.p5 >= SIM_SOFT ? Math.min(1, 0.008 + (S.p5 - SIM_SOFT + 1) * SIM_STEP) : 0.008;
  const r = Math.random(); let res;
  if (r < p5) {
    let feat = B.type === 'weapon' || S.g5 || Math.random() < 0.5;
    if (B.type === 'char') S.g5 = !feat;
    if (feat) res = B.type === 'char' ? { q: 5, k: 'char', id: (charByRid(B.f5) || {}).id, rid: B.f5, feat: true } : { q: 5, k: 'weapon', wid: B.f5, feat: true };
    else { const id = SIM_STD5[Math.floor(Math.random() * SIM_STD5.length)]; res = { q: 5, k: 'char', id, rid: (CH[id] || {}).rid, feat: false }; }
    S.n5++; S.pity5s.push(S.p5); S.p5 = 0; S.p4 = 0;
  } else if (S.p4 >= 10 || r < p5 + 0.06) {
    const f4 = (B.f4 || []).filter(x => B.type === 'char' ? charByRid(x) : RAW_WEAPONS[x]);
    const feat = f4.length && (S.g4 || Math.random() < 0.5); S.g4 = !feat && f4.length > 0;
    if (feat) { const x = f4[Math.floor(Math.random() * f4.length)]; res = B.type === 'char' ? { q: 4, k: 'char', id: charByRid(x).id, feat: true } : { q: 4, k: 'weapon', wid: x, feat: true }; }
    else {
      const pool = CHARS.filter(c => c.q === 4 && !isUpcoming(c) && !c.id.startsWith('rover_')).map(c => ({ k: 'char', id: c.id })).concat(Object.entries(RAW_WEAPONS).filter(([, w]) => w.q === 4).map(([id]) => ({ k: 'weapon', wid: +id })));
      res = { q: 4, ...pool[Math.floor(Math.random() * pool.length)], feat: false };
    }
    S.n4++; S.p4 = 0;
  } else {
    const p3 = Object.entries(RAW_WEAPONS).filter(([, w]) => w.q === 3); const [wid] = p3[Math.floor(Math.random() * p3.length)] || [0];
    res = { q: 3, k: 'weapon', wid: +wid };
  }
  res.at = S.n; if (res.q >= 4) S.hist.unshift({ ...res, pity: res.q === 5 ? S.pity5s[S.pity5s.length - 1] : null }); if (S.hist.length > 200) S.hist.length = 200;
  return res;
}
const simName = x => x.k === 'char' ? ((CH[x.id] || {}).name || '?') : ((RAW_WEAPONS[x.wid] || {}).n || '3성 무기');
function simCard(x) {
  const img = x.k === 'char' ? (artUrl('card', (CH[x.id] || {}).rid) || IMG_CHAR[x.id] || '') : (IMG_WEAPON[x.wid] || '');
  return `<div class="pull r${x.q}">${img ? `<img class="${x.k === 'weapon' ? 'w' : ''}" src="${img}" alt="">` : ''}<span class="n">${x.q === 5 && !x.feat ? '⚑ ' : ''}${esc(simName(x))}</span></div>`;
}
function renderSim() {
  const el = $('[data-view="sim"]'); const { S, B, bs } = simState();
  if (!B) { el.innerHTML = '<div class="container page"><div class="empty-note">시뮬레이션할 배너가 없습니다.</div></div>'; return; }
  const avg = S.pity5s.length ? (S.pity5s.reduce((a, b) => a + b, 0) / S.pity5s.length).toFixed(1) : '-';
  el.innerHTML = `<div class="container page"><p class="eyebrow">튜닝 시뮬레이터</p><h1 class="ph-t">별의 소리를 쓰기 전에,<em> 미리 돌려 보기</em></h1><p class="ph-d">공개된 확률 규칙(5성 0.8% · 4성 6% · 80회 확정 · 10회마다 4성 이상)으로 계산합니다. 66회부터 확률이 오르는 정도는 공식 발표가 없어 종합 확률 1.8%에 맞춘 추정치입니다. 실제 게임과는 아무 관련이 없습니다.</p>
    <div class="two" style="margin-top:24px">
      <div class="box"><div class="sim-ctrl"><select id="sim-b" aria-label="배너">${bs.map(b => `<option value="${esc(b.key)}" ${b.key === S.key ? 'selected' : ''}>${esc(b.label)}</option>`).join('')}</select>
        <button class="btn solid-gold" data-pull="1">1회 튜닝</button><button class="btn solid-gold" data-pull="10">10회 튜닝</button><button class="btn sm" data-pull="80">80회</button><button class="btn sm ghost" id="sim-reset">처음부터</button></div>
        <div class="sim-pity"><div><span>5성 천장까지</span><b>${80 - S.p5}</b></div><div><span>4성 확정까지</span><b>${10 - S.p4}</b></div><div><span>${B.type === 'char' ? '다음 5성' : '5성'}</span><b style="font-size:16px">${B.type === 'weapon' ? '픽업 무기 확정' : S.g5 ? '픽업 확정' : '픽업 50%'}</b></div></div>
        ${S.last.length ? `<div class="pulls">${S.last.map(simCard).join('')}</div>` : '<div class="empty-note">튜닝 버튼을 눌러 보세요.</div>'}
      </div>
      <div class="box"><h3>기록</h3><div class="kv" style="margin-bottom:12px"><div><span>전체 튜닝</span><b>${fmt(S.n)}회</b></div><div><span>5성</span><b>${S.n5}개</b></div><div><span>4성</span><b>${S.n4}개</b></div><div><span>5성 평균</span><b>${avg}회</b></div><div><span>쓴 별의 소리</span><b>${fmt(S.n * 160)}</b></div></div>
        <div class="hist">${S.hist.length ? S.hist.map(h => `<div class="r${h.q}"><span>${h.q === 5 ? '★5' : '★4'} ${esc(simName(h))}${h.q === 5 && !h.feat ? ' <span class="muted">(픽업 놓침)</span>' : ''}</span><span class="num muted">${h.at}회째${h.pity ? ` · ${h.pity}뽑` : ''}</span></div>`).join('') : '<p class="note">4성 이상이 나오면 여기에 기록됩니다.</p>'}</div>
        <p class="note" style="margin:10px 0 0">⚑ 표시는 픽업이 아닌 상설 5성입니다. 튜닝 1회 = 별의 소리 160.</p></div>
    </div></div>`;
  $('#sim-b').addEventListener('change', e => { state.sim = { key: e.target.value, p5: 0, p4: 0, g5: false, g4: false, n: 0, n5: 0, n4: 0, last: [], hist: [], pity5s: [] }; renderSim(); });
  $$('[data-pull]', el).forEach(b => b.addEventListener('click', () => { const n = +b.dataset.pull; const res = []; for (let i = 0; i < n; i++) res.push(simPull(B, S)); S.last = n > 10 ? res.filter(x => x.q >= 4).slice(-10) : res; renderSim(); }));
  $('#sim-reset').addEventListener('click', () => { state.sim = null; renderSim(); });
}

/* ---------- 화면 전환 ---------- */
const VIEWS = ['home', 'intro', 'characters', 'character', 'tools', 'season', 'echo', 'sim', 'links', 'notice'];
const VIEW_T = { home: '', intro: '소개', characters: '공명자 가이드', character: '공명자 가이드', tools: '파티 편성', season: '시즌 콘텐츠', echo: '에코 계산기', sim: '튜닝 시뮬레이터', links: '자료실', notice: '공지사항' };
let curView = null;
// 주소: /-/ (홈), /-/characters, /-/character/<id>, /-/tools/<탭> … 예전 #/주소도 받아서 새 주소로 바꿈
function parseRoute() {
  const h = location.hash || '';
  if (/^#share=/.test(h)) return { v: 'tools', a: '' };
  if (h.startsWith('#/')) { try { history.replaceState(null, '', BASE + h.slice(2)); } catch (e) { } }
  let p = location.pathname;
  p = p.startsWith(BASE) ? p.slice(BASE.length) : p.replace(/^\/+/, '');
  p = p.replace(/^(index|Index)\.html$/, '').replace(/\/+$/, '');
  if (!p) return { v: 'home', a: '' };
  const [v, a] = p.split('/');
  return { v, a: a ? decodeURIComponent(a) : '' };
}
const pathOf = href => href.startsWith('#/') ? href.slice(2) : href.startsWith(BASE) ? href.slice(BASE.length) : null;
function navigate(path, replace) {
  const url = BASE + String(path || '').replace(/^\/+/, '');
  try { if (replace) history.replaceState(null, '', url); else history.pushState(null, '', url); } catch (e) { location.href = url; return; }
  route();
}
// 화면 안의 #/주소 링크를 실제 주소로 바꿔 둠(새 탭으로 열기 · 주소 복사도 되도록)
function fixLinks(root = document) { $$('a[href^="#/"]', root).forEach(a => a.setAttribute('href', BASE + a.getAttribute('href').slice(2))); }
function route(keepScroll) {
  showView(parseRoute(), keepScroll);
}
function showView(r, keepScroll) {
  let v = VIEWS.includes(r.v) ? r.v : 'home';
  if (v === 'character' && !CH[r.a]) v = 'characters';
  const prev = curView; curView = v;
  $$('#main > .view').forEach(x => { x.hidden = x.dataset.view !== v; });
  const navKey = v === 'character' ? 'characters' : v;
  $$('#gnb a, #drawer a').forEach(a => { if (a.dataset.nav === navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  closeDrawer();
  if (v === 'tools' && (r.a === 'help' || r.a === 'patch')) { navigate(r.a === 'help' ? 'intro' : 'notice', true); if (r.a === 'help') setTimeout(scrollHelp, 60); return; }
  if (v === 'tools') { const t = r.a && $(`#tabs .tab[data-tab="${r.a}"]`) ? r.a : (state.tab || 'tower-build'); switchTab(t); paintOwnedChip(); }
  else ({ home: renderHome, intro: renderIntro, characters: renderCharacters, character: renderCharacter, season: renderSeason, echo: renderEcho, sim: renderSim, links: renderLinks, notice: renderNotice }[v])(r.a);
  const ct = v === 'character' && CH[r.a] ? CH[r.a].name + ' · ' : '';
  document.title = `${ct}${VIEW_T[v] ? VIEW_T[v] + ' · ' : ''}띵조 AUTO TEAM MAKER`;
  if (!keepScroll && (prev !== v || v === 'character')) window.scrollTo(0, 0);
  fixLinks();
}
// 시즌이 바뀌는 순간(역경의 탑 · 폐허 초기화) 열어 둔 화면도 새 시즌 데이터로 바꿈
function watchSeasons() {
  const next = Math.min(curSeason().end, wastesSeasonAt(Date.now()).end);
  const wait = Math.min(Math.max(next - Date.now() + 60000, 5000), DAY); // 최대 하루마다 다시 확인
  setTimeout(() => {
    if (Date.now() >= next) { WASTES = null; WASTES_P = null; refreshTower(true); if (['home', 'season'].includes(curView)) route(true); }
    watchSeasons();
  }, wait);
}
function closeDrawer() { const d = $('#drawer'); if (d) { d.hidden = true; $('#btn-menu').setAttribute('aria-expanded', 'false'); } }
function initSite() {
  $('#btn-menu').addEventListener('click', () => { const d = $('#drawer'); d.hidden = !d.hidden; $('#btn-menu').setAttribute('aria-expanded', String(!d.hidden)); });
  window.addEventListener('popstate', () => route());
  window.addEventListener('hashchange', () => { if ((location.hash || '').startsWith('#/')) route(); });
  // 사이트 안 링크는 페이지를 다시 불러오지 않고 화면만 바꿈
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return; if (a.hasAttribute('download')) return;
    const path = pathOf(a.getAttribute('href')); if (path === null) return;
    e.preventDefault(); navigate(path);
  });
  loadArt(); refreshEvents(); watchSeasons();
}

/* ---------- 시작 ---------- */
function init() {
  const fromShare = /share=/.test(location.hash || '');
  const had = load();
  paintVersion();
  initTheme();
  // 저장된 탑 캐시를 먼저 반영
  try { const c = JSON.parse(lsGet(LS_TOWER) || 'null'); if (c && c.db) setTowerDB({ ...RAW_TOWER, ...c.db }); } catch (e) { }
  $$('#tabs .tab').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  $('#btn-optimize').addEventListener('click', () => { $('#btn-optimize').textContent = '계산 중…'; setTimeout(() => { optimize(); $('#btn-optimize').textContent = '자동 편성'; switchTab('tower-build'); }, 30); });
  bindShare();
  bindGrow();
  $('#btn-img').addEventListener('click', savePartyImage);
  $('#share-img').addEventListener('click', () => { closeDlg('#dlg-share'); savePartyImage(); });
  $('#tl-sel').addEventListener('change', e => { state.tlSel = e.target.value; renderTimeline(); });
  $('#swap-close').addEventListener('click', closeSwap);
  $('#char-close').addEventListener('click', () => closeDlg('#dlg-char'));
  $('#dlg-char').addEventListener('click', e => { if (e.target.id === 'dlg-char') closeDlg('#dlg-char'); });
  $('#data-export').addEventListener('click', exportData);
  $('#data-import').addEventListener('change', e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; });
  $('#data-reset').addEventListener('click', () => {
    const btn = $('#data-reset');
    if (btn.dataset.confirm !== '1') { btn.dataset.confirm = '1'; btn.textContent = '한 번 더 누르면 모두 지웁니다'; setTimeout(() => { btn.dataset.confirm = ''; btn.textContent = '처음 상태로 되돌리기'; }, 4000); return; }
    [LS_KEY, LS_TOWER, LS_TOWER_TXT, 'ddingjo-atm-license', LS_EXTRA, 'ddingjo-atm-patch'].forEach(k => { try { localStorage.removeItem(k); } catch (e) { } });
    location.reload();
  });
  $('#dlg-swap').addEventListener('click', e => { if (e.target.id === 'dlg-swap') closeSwap(); });
  $('#guide-more').addEventListener('click', () => showHelp());
  $$('.help-toc a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = document.querySelector(a.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  $('#guide-close').addEventListener('click', () => { state.guideHidden = true; save(); renderBuild(); });
  $('#own-all').addEventListener('click', () => { CHARS.forEach(c => state.owned.add(c.id)); save(); renderRoster(); toast('전체 보유로 바꿨습니다. 자동 편성을 다시 눌러 주세요.'); });
  $('#own-none').addEventListener('click', () => { state.owned.clear(); save(); renderRoster(); });
  $('#own-free').addEventListener('click', () => { state.owned = new Set(FREE_IDS); save(); renderRoster(); toast('배포 캐릭터만 남겼습니다.'); });
  $('#roster-search').addEventListener('input', e => { state.rosterQuery = e.target.value; renderRoster(); });
  bindSeg('#seg-solo', () => state.settings.solo ? '1' : '0', v => { state.settings.solo = v === '1'; state.settings.parties = state.settings.solo ? Math.max(4, Math.min(7, state.settings.parties === 3 ? 4 : state.settings.parties)) : Math.min(4, state.settings.parties); state.parties.forEach(p => p.locked = false); optimize(true); toast(state.settings.solo ? '1~3층 단일 캐릭터 추천을 켰습니다.' : '단일 캐릭터 추천을 껐습니다.'); });
  bindSeg('#seg-tower', () => state.settings.towerMode ? '1' : '0', v => { state.settings.towerMode = v === '1'; optimize(true); });
  bindSeg('#seg-weapon', () => state.settings.weapon, v => { state.settings.weapon = v; optimize(true); toast(v === 'sig' ? '무기를 따로 정하지 않은 캐릭터는 전용 5성 무기로 계산합니다.' : '무기를 따로 정하지 않은 캐릭터는 4성 무기로 계산합니다.'); });
  bindSeg('#seg-fheal', () => state.fieldHeal, v => { state.fieldHeal = v; renderField(); });
  bindSeg('#seg-fpref', () => state.fieldPref, v => { state.fieldPref = v; renderField(); });
  $$('#seg-db button').forEach(b => b.addEventListener('click', () => { state.dbView = b.dataset.v; renderDB(); }));
  bindSettings();
  ensureParties();
  if (!had || !state.parties.some(p => p.ids.some(Boolean))) optimize(true);
  switchTab(state.tab || 'tower-build');
  refreshTower(false);
  initSite();
  if (fromShare) navigate('tools/' + (state.tab || 'tower-build'), true); else route();
}


/* ---------- 편성 결과 이미지 저장 ---------- */
function loadImg(src) { return new Promise(res => { if (!src) return res(null); const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
async function makePartyImage() {
  try { await document.fonts.ready; } catch (e) { }
  const parties = state.parties.map(p => ({ p, r: evalParty(p) })).filter(x => x.r);
  const W = 1080, PAD = 40, ROW = 250, H = 210 + parties.length * (ROW + 20) + 70;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const F = (w, s) => `${w} ${s}px "IBM Plex Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`;
  const M = s => `600 ${s}px "IBM Plex Mono", ui-monospace, monospace`;
  // 배경: 검정 + 노란 성운 + 별
  g.fillStyle = '#05060b'; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(W * .85, -40, 10, W * .85, -40, 700); gr.addColorStop(0, 'rgba(255,190,40,.22)'); gr.addColorStop(1, 'rgba(255,190,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 160; i++) { g.fillStyle = rnd() < .3 ? 'rgba(255,214,90,.9)' : 'rgba(255,255,255,.75)'; const r = rnd() * 1.6 + .3; g.beginPath(); g.arc(rnd() * W, rnd() * H, r, 0, 7); g.fill(); }
  // 제목
  g.fillStyle = '#ffcd3c'; g.font = F(700, 44); g.fillText('✦ 띵조 AUTO TEAM MAKER', PAD, 78);
  const sn = curSeason(); const total = parties.reduce((a, x) => a + x.r.totalDmg, 0);
  g.fillStyle = '#aab1bf'; g.font = F(500, 22);
  g.fillText(`심경 구역 시즌 ${sn.n} · ${parties.length}파티 · Ver. ${APP_VERSION}${state.settings.towerMode ? ' · 탑 버프 반영' : ''}`, PAD, 118);
  g.fillStyle = '#f2f0e8'; g.font = F(600, 24); g.fillText('파티 합산 1사이클 피해', PAD, 170);
  g.fillStyle = '#ffcd3c'; g.font = M(40); g.textAlign = 'right'; g.fillText(fmt(total), W - PAD, 172); g.textAlign = 'left';
  let y = 200;
  for (let i = 0; i < parties.length; i++) {
    const { p, r } = parties[i]; const sl = SLOT[p.slot];
    rr(g, PAD, y, W - PAD * 2, ROW, 22); g.fillStyle = '#0e1119'; g.fill(); g.strokeStyle = 'rgba(255,205,60,.35)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#f2f0e8'; g.font = F(700, 30); g.fillText(`${i + 1}파티`, PAD + 26, y + 48);
    g.fillStyle = '#aab1bf'; g.font = F(500, 21); g.fillText(`${sl.label} · ${sl.fl}`, PAD + 26, y + 80);
    g.textAlign = 'right'; g.fillStyle = '#ffcd3c'; g.font = M(34); g.fillText(fmt(r.totalDmg), W - PAD - 26, y + 50);
    g.fillStyle = '#aab1bf'; g.font = F(500, 18); g.fillText(`1사이클 피해 · 약 ${Math.round(r.rot)}초`, W - PAD - 26, y + 80); g.textAlign = 'left';
    const pm = presetMatch(p.ids); if (pm) { g.fillStyle = '#ffcd3c'; g.font = F(600, 18); g.fillText(`★ 추천 조합 · ${pm.p.t}`, PAD + 26, y + 108); }
    const ids = p.ids; const roles = ['메인', '서브', '서포터']; const S = 108, gap = 26;
    for (let k = 0; k < 3; k++) {
      const id = ids[k]; const x = PAD + 26 + k * (S + 150 + gap); const yy = y + 122;
      rr(g, x, yy, S, S, 18); g.fillStyle = id ? (EL[CH[id].el] ? EL[CH[id].el].c : '#333') : '#1b2230'; g.fill();
      if (id) { const im = await loadImg(IMG_CHAR[id]); if (im) { g.save(); rr(g, x, yy, S, S, 18); g.clip(); g.drawImage(im, x, yy, S, S); g.restore(); } }
      g.fillStyle = '#f2f0e8'; g.font = F(700, 23); g.fillText(id ? CH[id].name : '-', x + S + 14, yy + 42);
      g.fillStyle = '#aab1bf'; g.font = F(500, 18); const mk = id && r.modes && r.modes[id] && CH[id].modes ? ` · ${CH[id].modes[r.modes[id]].n}` : '';
      g.fillText(id ? `${sl.type === 'solo' ? '단일' : roles[k]}${mk}` : '', x + S + 14, yy + 70);
      if (sl.type === 'solo') break;
    }
    y += ROW + 20;
  }
  g.fillStyle = '#75808f'; g.font = F(500, 18); g.fillText('예상 피해는 비교용 추정치입니다 · 띵조 AUTO TEAM MAKER', PAD, H - 30);
  return cv;
}
async function savePartyImage() {
  toast('이미지를 만드는 중…');
  const cv = await makePartyImage();
  const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
  const d0 = new Date(); const fname = `ddingjo-party-${d0.getMonth() + 1}${String(d0.getDate()).padStart(2, '0')}.png`;
  if (IN_ARTIFACT) {
    const dl = await window.claude.use('downloads').catch(() => null);
    if (dl) { try { await dl.save({ filename: fname, data: blob }); toast('이미지를 저장했습니다.'); } catch (e) { toast(e && e.code === 'declined' ? '저장을 취소했습니다.' : '이미지를 저장하지 못했습니다.'); } return; }
  }
  const file = new File([blob], fname, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] }) && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    try { await navigator.share({ files: [file], title: '띵조 AUTO TEAM MAKER 편성' }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fname;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  toast('편성 이미지를 저장했습니다.');
}

/* ---------- 육성 계산 ----------
   비용은 게임 데이터(돌파·레벨 경험치·스킬 레벨·공명 노드) 그대로. 고유 스킬 비용과 레벨업 코인, 플레이트 1회 획득량은 추정치. */
const GROW_SK = [['a', '일반 공격'], ['s', '공명 스킬'], ['f', '공명 회로'], ['l', '공명 해방'], ['i', '변주 스킬']];
const LV_COIN_PER_EXP = 0.2; // 레벨업 클램 코인(경험치 1당, 추정)
const GROW_YIELD_DEF = { // 솔라리스 랭크 1~8, 플레이트 1회 기대 획득량(추정 기본값)
  boss: [1.2, 1.6, 2, 2.4, 2.9, 3.4, 4, 4.6],
  forge: [9, 13, 18, 24, 31, 39, 48, 58],
  weekly: [1, 1, 1.5, 1.5, 2, 2.5, 3, 3],
  exp: [16000, 22000, 30000, 38000, 48000, 58000, 68000, 80000],
  coin: [10000, 13000, 17000, 21000, 25000, 30000, 35000, 40000] };
const GROW_SRC = { boss: { n: '강적 토벌(보스)', wp: 60 }, forge: { n: '단조 도전', wp: 40 }, weekly: { n: '주간 보스(군가의 중주)', wp: 60, cap: 3 }, exp: { n: '시뮬레이션 훈련(공명 촉진제)', wp: 40 }, coin: { n: '시뮬레이션 훈련(클램 코인)', wp: 40 } };
function growDefault(id) {
  return { id, lv0: 1, a0: false, lv1: 90, a1: false, sk0: { a: 1, s: 1, f: 1, l: 1, i: 1 }, sk1: { a: 10, s: 10, f: 10, l: 10, i: 10 }, ih0: [false, false], ih1: [true, true], n10: 0, n11: 4, n20: 0, n21: 4, rank: 8, synth: true };
}
function growChars() { return CHARS.filter(c => c.rid && RAW_GROW.chars[c.rid]); }
function itemName(k) { return k === 'exp' ? '공명자 경험치' : ((RAW_GROW.items[k] || {}).n || k); }
function itemIcon(k, size = 40) { const u = IMG_ITEM[k]; const q = (RAW_GROW.items[k] || {}).q || 1; return `<span class="it-ic q${q}" style="width:${size}px;height:${size}px">${u ? `<img src="${u}" alt="" loading="lazy">` : ''}</span>`; }
// 레벨 + 돌파 여부 → 돌파 단계
function growRank(asc, lv, ascended) { let r = 0; while (r < asc.length - 1 && asc[r].cap < lv) r++; if (ascended && asc[r].cap === lv && r < asc.length - 1) r++; return r; }
function growNeed(G) {
  const d = RAW_GROW.chars[CH[G.id].rid]; const need = {}; const add = (arr, m = 1) => arr.forEach(([k, v]) => { need[k] = (need[k] || 0) + v * m; });
  const r0 = growRank(d.asc, G.lv0, G.a0), r1 = growRank(d.asc, G.lv1, G.a1);
  for (let r = r0 + 1; r <= r1; r++) add(d.asc[r].c);
  const ex = RAW_GROW.exp[d.g] || []; let exp = 0;
  for (let L = G.lv0 + 1; L <= G.lv1; L++) exp += ex[L - 1] || 0;
  if (exp) { need.exp = exp; need[2] = (need[2] || 0) + Math.round(exp * LV_COIN_PER_EXP); }
  GROW_SK.forEach(([k]) => { const lvls = d.sk[k] || []; for (let L = (G.sk0[k] || 1) + 1; L <= (G.sk1[k] || 1); L++) add(lvls[L - 1] || []); });
  [0, 1].forEach(i => { if (G.ih1[i] && !G.ih0[i]) add(d.inh[i]); });
  add(d.n1, Math.max(0, G.n11 - G.n10)); add(d.n2, Math.max(0, G.n21 - G.n20));
  return { need, d, r0, r1 };
}
// 3:1 합성을 고려한 단계별 부족량
function tierShort(ids, need, inv, synth) {
  let carry = 0; const out = {};
  ids.forEach(k => { const n = need[k] || 0; const have = (+inv[k] || 0) + carry; if (have >= n) { out[k] = 0; carry = synth ? Math.floor((have - n) / 3) : 0; } else { out[k] = n - have; carry = 0; } });
  return out;
}
function renderGrow() {
  const list = growChars();
  if (!state.grow || !CH[state.grow.id] || !RAW_GROW.chars[CH[state.grow.id].rid]) state.grow = growDefault((list.find(c => c.id === 'hsin') || list[0]).id);
  state.inv = state.inv || {}; state.growYield = state.growYield || JSON.parse(JSON.stringify(GROW_YIELD_DEF));
  const G = state.grow; const c = CH[G.id];
  const { need, d, r0, r1 } = growNeed(G);
  const cat = d.cat; const inv = state.inv;
  const lvOpts = (v) => Array.from({ length: d.max }, (_, i) => i + 1).map(L => `<option value="${L}" ${L === v ? 'selected' : ''}>Lv.${L}</option>`).join('');
  const skOpts = (v) => Array.from({ length: 10 }, (_, i) => i + 1).map(L => `<option value="${L}" ${L === v ? 'selected' : ''}>${L}</option>`).join('');
  const capAt = L => d.asc.some(a => a.cap === L && a.cap < d.max);
  $('#grow-form').innerHTML = `
    <div class="grow-who">${portraitHTML(c)}<label class="field" style="flex:1;min-width:0"><span class="lbl">공명자</span><select id="gr-id">${list.map(x => `<option value="${x.id}" ${x.id === G.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label></div>
    <div class="grow-sec"><h4>공명자 레벨</h4>
      <div class="grow-row"><span class="gl">현재</span><select id="gr-lv0">${lvOpts(G.lv0)}</select><label class="chk ${capAt(G.lv0) ? '' : 'dim'}"><input type="checkbox" id="gr-a0" ${G.a0 ? 'checked' : ''} ${capAt(G.lv0) ? '' : 'disabled'}> 돌파 완료</label></div>
      <div class="grow-row"><span class="gl">목표</span><select id="gr-lv1">${lvOpts(G.lv1)}</select><label class="chk ${capAt(G.lv1) ? '' : 'dim'}"><input type="checkbox" id="gr-a1" ${G.a1 ? 'checked' : ''} ${capAt(G.lv1) ? '' : 'disabled'}> 돌파 완료</label></div>
      <p class="note">돌파 ${r0}단계 → ${r1}단계 · 20·40·50·60·70·80레벨에서 돌파했으면 "돌파 완료"에 체크하세요.</p></div>
    <div class="grow-sec"><h4 style="display:flex;justify-content:space-between;align-items:center">스킬 레벨 <span><button class="btn sm ghost" type="button" id="gr-skmax">목표 모두 10</button></span></h4>
      <div class="grow-sk"><span></span><span class="gl">현재</span><span class="gl">목표</span>
      ${GROW_SK.map(([k, n]) => `<span class="sk-n">${n}</span><select data-sk0="${k}">${skOpts(G.sk0[k])}</select><select data-sk1="${k}">${skOpts(G.sk1[k])}</select>`).join('')}</div></div>
    <div class="grow-sec"><h4>공명 노드</h4>
      <div class="grow-sk"><span></span><span class="gl">현재</span><span class="gl">목표</span>
        ${[0, 1].map(i => `<span class="sk-n">고유 스킬 ${i + 1}</span><label class="chk"><input type="checkbox" data-ih0="${i}" ${G.ih0[i] ? 'checked' : ''}> 해금</label><label class="chk"><input type="checkbox" data-ih1="${i}" ${G.ih1[i] ? 'checked' : ''}> 해금</label>`).join('')}
        <span class="sk-n">능력치 노드 1단</span><select id="gr-n10">${[0, 1, 2, 3, 4].map(v => `<option ${v === G.n10 ? 'selected' : ''}>${v}</option>`).join('')}</select><select id="gr-n11">${[0, 1, 2, 3, 4].map(v => `<option ${v === G.n11 ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <span class="sk-n">능력치 노드 2단</span><select id="gr-n20">${[0, 1, 2, 3, 4].map(v => `<option ${v === G.n20 ? 'selected' : ''}>${v}</option>`).join('')}</select><select id="gr-n21">${[0, 1, 2, 3, 4].map(v => `<option ${v === G.n21 ? 'selected' : ''}>${v}</option>`).join('')}</select>
      </div><p class="note">능력치 노드는 1단·2단 각각 4개(공격력·크리티컬 등)입니다. 해금한 개수를 고르세요.</p></div>`;

  // 결과 표
  const ascCommon = cat.ascCommon, skCommon = cat.common;
  const fam = [...new Set([...ascCommon, ...skCommon])];
  const commonFams = [ascCommon, skCommon].filter((f, i, a) => i === 0 || f.join() !== a[0].join());
  const shortC = {}; commonFams.forEach(f => Object.assign(shortC, tierShort(f, need, inv, G.synth)));
  const shortF = tierShort(cat.forte, need, inv, G.synth);
  const expOwned = Object.entries(RAW_GROW.expItems).reduce((a, [k, e]) => a + (+inv[k] || 0) * e, 0);
  const shortOf = k => k === 'exp' ? Math.max(0, (need.exp || 0) - expOwned) : (k in shortC ? shortC[k] : k in shortF ? shortF[k] : Math.max(0, (need[k] || 0) - (+inv[k] || 0)));
  const row = (k) => { const n = need[k] || 0; const sh = shortOf(k); return `<div class="g-item ${n ? '' : 'zero'}">${itemIcon(k)}<div class="g-nm">${esc(itemName(k))}</div>
      <div class="g-num"><span class="k">필요</span><b class="num">${fmt(n)}</b></div>
      <label class="g-num"><span class="k">보유</span><input type="number" min="0" inputmode="numeric" data-inv="${k}" value="${inv[k] ?? ''}" placeholder="0"></label>
      <div class="g-num ${sh ? 'bad' : 'ok'}"><span class="k">부족</span><b class="num">${sh ? fmt(sh) : '충분'}</b></div></div>`; };
  const groups = [
    ['돌파 재료', [cat.boss, cat.spec].filter(k => need[k])],
    ['몬스터 재료', fam.filter(k => need[k])],
    ['스킬 재료 (단조 도전)', cat.forte.filter(k => need[k])],
    ['주간 보스 재료', [cat.weekly].filter(k => need[k])],
    ['클램 코인', [2].filter(k => need[k])]];
  const expBlock = need.exp ? `<div class="g-group"><h4>경험치</h4>
      <div class="g-item">${itemIcon(43010004)}<div class="g-nm">공명자 경험치<div class="note">특급 공명 촉진제 약 ${fmt(Math.ceil(need.exp / 20000))}개 분량</div></div>
        <div class="g-num"><span class="k">필요</span><b class="num">${fmt(need.exp)}</b></div><div class="g-num"><span class="k">보유</span><b class="num">${fmt(expOwned)}</b></div>
        <div class="g-num ${shortOf('exp') ? 'bad' : 'ok'}"><span class="k">부족</span><b class="num">${shortOf('exp') ? fmt(shortOf('exp')) : '충분'}</b></div></div>
      <div class="g-exp">${Object.entries(RAW_GROW.expItems).map(([k, e]) => `<label class="g-expi">${itemIcon(k, 32)}<span>${esc(itemName(+k))}<small class="muted"> (${fmt(e)})</small></span><input type="number" min="0" data-inv="${k}" value="${inv[k] ?? ''}" placeholder="보유"></label>`).join('')}</div></div>` : '';
  $('#grow-need').innerHTML = `<div class="g-head"><h3 style="margin:0">필요 재화 · ${esc(c.name)}</h3><label class="chk"><input type="checkbox" id="gr-synth" ${G.synth ? 'checked' : ''}> 하위 재료 3개 → 상위 1개 합성 반영</label></div>
    ${groups.filter(([, ks]) => ks.length).map(([h, ks]) => `<div class="g-group"><h4>${h}</h4>${ks.map(row).join('')}</div>`).join('')}${expBlock}
    ${Object.keys(need).length ? '' : '<p class="note">현재와 목표가 같아서 필요한 재화가 없습니다.</p>'}
    <p class="note">보유 개수는 모든 공명자가 함께 씁니다(이 브라우저에 저장). 레벨업 클램 코인은 경험치 1당 ${LV_COIN_PER_EXP}개로 추정해 더했고, 고유 스킬 비용은 게임 데이터에 값이 없어 커뮤니티 기준(1: 2단계 재료 3+3·코인 1만, 2: 3단계 재료 3+3·주간 보스 1·코인 2만)을 썼습니다.</p>`;

  // 파밍 계산
  const Y = state.growYield; const rk = G.rank - 1;
  const fShortUnits = cat.forte.reduce((a, k, t) => a + (shortF[k] || 0) * Math.pow(3, t), 0);
  const rows = [
    ['boss', shortOf(cat.boss), cat.boss, '개'],
    ['forge', fShortUnits, cat.forte[0], `개 (${esc(itemName(cat.forte[0]))} 환산)`],
    ['weekly', shortOf(cat.weekly), cat.weekly, '개'],
    ['exp', shortOf('exp'), 43010004, 'EXP'],
    ['coin', shortOf(2), 2, '개']].filter(r => r[1] > 0);
  let wp = 0, weeks = 0;
  const frows = rows.map(([key, def, icon, unit]) => {
    const y = +Y[key][rk] || 1; const runs = Math.ceil(def / y); const src = GROW_SRC[key]; wp += runs * src.wp; if (src.cap) weeks = Math.max(weeks, Math.ceil(runs / src.cap));
    return `<div class="g-farm">${itemIcon(icon, 32)}<div class="g-nm">${src.n}<div class="note">부족 ${fmt(def)} ${unit}</div></div>
      <label class="g-num"><span class="k">1회 획득</span><input type="number" min="0.1" step="any" data-yield="${key}" value="${Y[key][rk]}"></label>
      <div class="g-num"><span class="k">횟수</span><b class="num">${fmt(runs)}회</b></div>
      <div class="g-num"><span class="k">플레이트</span><b class="num">${fmt(runs * src.wp)}</b></div></div>`; }).join('');
  const field = [cat.spec, ...fam].filter(k => shortOf(k) > 0);
  $('#grow-farm').innerHTML = `<div class="g-head"><h3 style="margin:0">파밍 예상 (결정 웨이브 플레이트)</h3>
      <label class="field" style="margin:0"><span class="lbl">솔라리스 랭크</span><select id="gr-rank">${[1, 2, 3, 4, 5, 6, 7, 8].map(v => `<option value="${v}" ${v === G.rank ? 'selected' : ''}>${v}단계</option>`).join('')}</select></label></div>
    ${rows.length ? frows : '<p class="note">플레이트로 파밍할 부족 재화가 없습니다.</p>'}
    ${rows.length ? `<div class="g-total">${itemIcon(5, 40)}<div><div class="k">필요한 결정 웨이브 플레이트</div><b class="num">${fmt(wp)}</b> <span class="muted">· 자연 회복(하루 240) 기준 약 ${Math.ceil(wp / 240)}일${weeks ? ` · 주간 보스는 주 3회 제한이라 최소 ${weeks}주` : ''}</span></div></div>` : ''}
    ${field.length ? `<p class="note">${field.map(k => esc(itemName(k))).join(', ')}은(는) 필드 몬스터·채집·상점에서 얻어 플레이트 계산에서 뺐습니다.</p>` : ''}
    <p class="note warn-note">1회 획득량은 랭크별 <b>추정 기본값</b>입니다. 게임 보상 화면의 숫자로 고치면 이 브라우저에 저장되고 그대로 계산합니다. 단조 도전은 여러 등급이 섞여 나오므로 가장 낮은 등급 기준(상위 1개 = 하위 3개)으로 환산한 값입니다. <button class="btn sm ghost" type="button" id="gr-yreset">기본값으로</button></p>`;
}
function bindGrow() {
  const root = $('[data-panel="grow"]'); if (!root) return;
  const upd = (fn) => { fn(state.grow); const G = state.grow; if (G.lv1 < G.lv0) G.lv1 = G.lv0; GROW_SK.forEach(([k]) => { if (G.sk1[k] < G.sk0[k]) G.sk1[k] = G.sk0[k]; }); if (G.n11 < G.n10) G.n11 = G.n10; if (G.n21 < G.n20) G.n21 = G.n20; [0, 1].forEach(i => { if (G.ih0[i]) G.ih1[i] = true; }); save(); renderGrow(); };
  root.addEventListener('change', e => {
    const t = e.target; const v = t.type === 'checkbox' ? t.checked : t.value;
    if (t.id === 'gr-id') { const keep = state.grow; state.grow = { ...growDefault(v), rank: keep.rank, synth: keep.synth }; save(); renderGrow(); return; }
    if (t.dataset.inv) { const n = Math.max(0, Math.floor(+t.value || 0)); if (n) state.inv[t.dataset.inv] = n; else delete state.inv[t.dataset.inv]; save(); renderGrow(); const el = $(`[data-inv="${t.dataset.inv}"]`); return; }
    if (t.dataset.yield) { const y = Math.max(0.1, +t.value || 0.1); state.growYield[t.dataset.yield][state.grow.rank - 1] = y; save(); renderGrow(); return; }
    const map = { 'gr-lv0': G => { G.lv0 = +v; G.a0 = false; }, 'gr-lv1': G => { G.lv1 = +v; G.a1 = false; }, 'gr-a0': G => { G.a0 = v; }, 'gr-a1': G => { G.a1 = v; }, 'gr-n10': G => { G.n10 = +v; }, 'gr-n11': G => { G.n11 = +v; }, 'gr-n20': G => { G.n20 = +v; }, 'gr-n21': G => { G.n21 = +v; }, 'gr-synth': G => { G.synth = v; }, 'gr-rank': G => { G.rank = +v; } };
    if (map[t.id]) return upd(map[t.id]);
    if (t.dataset.sk0) return upd(G => { G.sk0[t.dataset.sk0] = +v; });
    if (t.dataset.sk1) return upd(G => { G.sk1[t.dataset.sk1] = +v; });
    if (t.dataset.ih0) return upd(G => { G.ih0[+t.dataset.ih0] = v; });
    if (t.dataset.ih1) return upd(G => { G.ih1[+t.dataset.ih1] = v; if (!v) G.ih0[+t.dataset.ih1] = false; });
  });
  root.addEventListener('click', e => {
    if (e.target.id === 'gr-skmax') upd(G => { GROW_SK.forEach(([k]) => { G.sk1[k] = 10; }); });
    if (e.target.id === 'gr-yreset') { state.growYield = JSON.parse(JSON.stringify(GROW_YIELD_DEF)); save(); renderGrow(); toast('1회 획득량을 기본값으로 되돌렸습니다.'); }
  });
}

/* ---------- 딜 사이클 탭 (큰 타임라인) ---------- */
function tlSources() {
  const out = [];
  state.parties.forEach((p, i) => { if (p.ids.filter(Boolean).length >= 2) out.push({ key: 'p' + i, label: `${i + 1}파티 · ${p.ids.filter(Boolean).map(id => CH[id].name).join(' · ')}`, get: () => evalParty(p) }); });
  PRESETS.filter(p => p.m.every(id => CH[id])).forEach(p => out.push({ key: 'k' + p.id, label: `추천 · ${p.t}`, get: () => bestTeam(p.m, { ...ctxFor(null), zone: null }) }));
  return out;
}
function renderTimeline() {
  const src = tlSources();
  if (!src.find(x => x.key === state.tlSel)) state.tlSel = src.length ? src[0].key : '';
  $('#tl-sel').innerHTML = src.map(x => `<option value="${x.key}" ${x.key === state.tlSel ? 'selected' : ''}>${esc(x.label)}</option>`).join('');
  const cur = src.find(x => x.key === state.tlSel);
  const r = cur ? cur.get() : null;
  if (!r || r.team.filter(Boolean).length < 2) { $('#tl-body').innerHTML = '<div class="card note">2명 이상인 파티를 골라 주세요.</div>'; return; }
  const [M, Sb, P] = r.team;
  const seq = (r.ord === 1 ? [Sb, P, M] : [P, Sb, M]).filter(Boolean);
  const ids = seq.map(m => m.id);
  const pcOf = {}; seq.forEach((m, i) => { pcOf[m.id] = 'p' + (i + 1); });
  const nm = {}; seq.forEach(m => { nm[m.id] = m.c.name; });
  const { steps, total } = cycleSteps(seq, ids);
  const T = Math.max(total, r.rot);
  // 같은 캐릭터가 연속으로 하는 동작은 한 덩어리로
  const runs = []; steps.forEach(x => { const l = runs[runs.length - 1]; if (l && l.id === x.id && l.qs === x.qs) { l.d += x.d; } else runs.push({ id: x.id, s: x.s, d: x.d, qs: x.qs }); });
  const legend = `<div class="seq-legend" style="margin:0"><span class="muted">색 구분</span>${seq.map((m, i) => `<span class="lg p${i + 1}">${portraitHTML(m.c)}<span class="ord">${i + 1}</span>${esc(m.c.name)} <span class="num muted" style="font-weight:500">약 ${m.ft}초</span></span>`).join('')}</div>`;
  const bar = `<div class="tl-bar">${runs.map(x => `<span class="tl-seg ${pcOf[x.id]}${x.qs ? ' hand' : ''}" style="flex:${x.d.toFixed(2)} 1 0" title="${esc(nm[x.id])} ${x.s.toFixed(1)}~${(x.s + x.d).toFixed(1)}초${x.qs ? ' (퀵스왑)' : ''}">${x.d / T > 0.1 ? esc(nm[x.id]) : ''}</span>`).join('')}${total < T - 0.2 ? `<span class="tl-seg idle" style="flex:${(T - total).toFixed(2)} 1 0" title="공명 해방 쿨타임 대기">대기</span>` : ''}</div>`;
  const ticks = []; for (let v = 0; v <= T + 0.01; v += 5) ticks.push(`<span style="left:${(v / T * 100).toFixed(2)}%">${v}초</span>`);
  const rows = []; let prev = null;
  steps.forEach(x => {
    if (prev && prev.id !== x.id) rows.push(`<li class="tl-swap"><span></span><span>↓ ${esc(nm[prev.id])} → <b>${esc(nm[x.id])}</b> ${x.qs ? '<span class="sw">퀵스왑</span>' : /반주/.test(prev.t) ? '반주 → 변주로 교체' : '교체'}</span></li>`);
    rows.push(`<li class="tl-row ${pcOf[x.id]}${x.qs ? ' hand' : ''}${/해방/.test(x.t) ? ' lib' : ''}"><span class="tl-t num">${x.s.toFixed(1)}초</span><span class="tl-who"><i class="dot"></i>${esc(nm[x.id])}</span><span class="tl-act">${esc(x.t)}${x.sub ? ` <small>${esc(x.sub)}</small>` : ''}${x.qs ? ' <span class="sw">퀵스왑</span>' : ''}</span></li>`);
    prev = x;
  });
  const notes = TEAM_ROT.filter(t => t.has.every(id => ids.includes(id))).map(t => `<div class="note team-note">${esc(t.t)}${t.src ? ` <span class="muted">출처: ${esc(t.src)}</span>` : ''}</div>`).join('');
  $('#tl-body').innerHTML = `<div class="card tl-card">
      <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline"><h2 style="margin:0">${esc(seq.map(m => m.c.name).join(' → '))}</h2><span class="num"><b style="font-size:18px">약 ${Math.round(T)}초</b> <span class="muted">· 1사이클 ${fmt(r.totalDmg)}</span></span></div>
      ${legend}${bar}<div class="tl-ticks">${ticks.join('')}</div>${notes}</div>
    <div class="card"><h3 style="margin:0 0 8px">순서대로 따라 하기</h3><ol class="tl-list">${rows.join('')}</ol>
      <p class="note">시간은 각 캐릭터의 필드 시간을 동작 종류(평타·강공·해방 등)에 맞게 나눈 추정치입니다. 점선 테두리는 퀵스왑으로 잠깐 꺼내는 구간, 굵은 줄은 공명 해방입니다.</p></div>`;
}

/* ---------- 패치 노트 ----------
   내용은 src/data/patch-notes.json (맨 위 버전이 사이트 버전). GitHub에서 그 파일을 고치면 자동으로 다시 배포됩니다. */
function patchNotes() { return PATCH_NOTES; }
function paintVersion() { const v = patchNotes()[0].v; const c = $('#ver-chip'); if (c) c.textContent = `Ver. ${v}`; }

/* ---------- 로그인 · 설정 동기화 ----------
   서버: server/worker.js (Cloudflare Workers + D1). 아이디 · 비밀번호로 가입하면 위 SYNC_KEYS 설정을 계정에 저장하고,
   다른 기기에서 같은 아이디로 로그인하면 그대로 불러옵니다. 비밀번호는 이 브라우저에서 PBKDF2로 늘린 값만 서버로 보냅니다. */
const SYNC_URL = (DEBUG && lsGet('ddingjo-atm-sync-url')) || 'https://ddingjo-sync.ddingjo-atm.workers.dev';
const LS_AUTH = 'ddingjo-atm-auth';      // {id, token, base: 마지막으로 맞춘 서버 시각, snap: 그때의 설정 내용}
let AUTH = (() => { try { const a = JSON.parse(lsGet(LS_AUTH) || 'null'); return a && a.token ? a : null; } catch (e) { return null; } })();
const sync = { busy: false, timer: null, status: '', err: '' };
const saveAuth = () => { try { if (AUTH) localStorage.setItem(LS_AUTH, JSON.stringify(AUTH)); else localStorage.removeItem(LS_AUTH); } catch (e) { } };
const payloadStr = () => JSON.stringify(localPayload());
const isDirty = () => !!AUTH && payloadStr() !== AUTH.snap; // 마지막으로 맞춘 뒤 이 기기에서 바뀐 게 있는지(내용으로 비교)
let syncApplying = false;
function syncDirty() {
  if (syncApplying || !AUTH) return;
  clearTimeout(sync.timer); sync.timer = setTimeout(() => syncPush(), 2500); paintAcct();
}
async function deriveKey(id, pw) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode('ddingjo-atm:' + id), iterations: 150000 }, k, 256);
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}
async function api(path, { method = 'GET', body, token = AUTH && AUTH.token } = {}) {
  let r;
  try { r = await fetch(SYNC_URL + path, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined }); }
  catch (e) { const err = new Error('서버에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요.'); err.offline = true; throw err; }
  let d = {}; try { d = await r.json(); } catch (e) { }
  if (!r.ok) { const err = new Error(d.error || `서버 오류 (${r.status})`); err.status = r.status; err.data = d; if (d.relogin) { AUTH = null; saveAuth(); paintAcct(); } throw err; }
  return d;
}
function localPayload() {
  const get = k => { try { return JSON.parse(lsGet(k) || 'null'); } catch (e) { return null; } };
  const main = get(SYNC_KEYS[0]); if (main) delete main.tab; // 마지막으로 연 탭은 기기마다 따로
  return { v: 1, main, echo: get(SYNC_KEYS[1]) };
}
const localIsEmpty = () => !lsGet(LS_TOUCHED);
function applyRemote(data, updated) {
  syncApplying = true;
  try {
    if (data && data.main) { const cur = (() => { try { return JSON.parse(lsGet(SYNC_KEYS[0]) || '{}'); } catch (e) { return {}; } })(); lsSet(SYNC_KEYS[0], JSON.stringify({ ...data.main, tab: cur.tab || data.main.tab })); }
    if (data && data.echo) lsSet(SYNC_KEYS[1], JSON.stringify(data.echo));
  } finally { syncApplying = false; }
  load(); state.ec = null; ensureParties();
  AUTH.base = updated; AUTH.snap = payloadStr(); saveAuth();
  paintOwnedChip(); route(true);
}
async function syncPush(force) {
  if (!AUTH || sync.busy || (!force && !isDirty())) return; sync.busy = true; sync.err = ''; paintAcct();
  const snap = payloadStr();
  try {
    const r = await api('/data', { method: 'PUT', body: { data: JSON.parse(snap), base: AUTH.base || 0, force: !!force } });
    AUTH.base = r.updated; AUTH.snap = snap; saveAuth(); sync.status = `저장됨 ${mdhm(r.updated)}`;
  } catch (e) {
    if (e.status === 409) { sync.busy = false; return syncPull(true); }
    sync.err = e.message;
  } finally { sync.busy = false; paintAcct(); }
}
// 서버에 더 새 설정이 있으면: 이 기기에서 바꾼 게 없으면 바로 불러오고, 양쪽 다 바뀌었으면 고르게 함
async function syncPull(conflictOnly) {
  if (!AUTH || sync.busy) return; sync.busy = true; paintAcct();
  try {
    const r = await api('/data');
    if (r.updated && r.updated !== AUTH.base) {
      if (!isDirty()) { applyRemote(r.data, r.updated); toast('다른 기기에서 저장한 설정을 불러왔습니다.'); }
      else { sync.busy = false; return askConflict(r); }
    } else if (isDirty() && !conflictOnly) { sync.busy = false; return syncPush(); }
    sync.status = r.updated ? `최신 상태 · ${mdhm(r.updated)}` : '아직 저장된 설정 없음';
  } catch (e) { sync.err = e.message; } finally { sync.busy = false; paintAcct(); }
}
function askConflict(r) {
  openAcct(`<div class="acct-q"><p><b>다른 기기에서 저장한 설정(${mdhm(r.updated)})</b>과 이 기기에서 바꾼 설정이 다릅니다. 어느 쪽을 쓸까요?</p>
    <div class="acct-row"><button class="btn solid-gold" id="cf-remote">저장된 설정 불러오기</button><button class="btn" id="cf-local">이 기기 설정으로 덮어쓰기</button></div>
    <p class="note">불러오면 이 기기에서 바꾼 내용이, 덮어쓰면 계정에 저장된 내용이 사라집니다.</p></div>`, '설정 맞추기');
  $('#cf-remote').addEventListener('click', () => { applyRemote(r.data, r.updated); closeDlg('#dlg-acct'); toast('저장된 설정을 불러왔습니다.'); });
  $('#cf-local').addEventListener('click', () => { AUTH.base = r.updated; saveAuth(); closeDlg('#dlg-acct'); syncPush(true); toast('이 기기 설정을 계정에 저장했습니다.'); });
}
function paintAcct() {
  const l = $('#acct-label'); const b = $('#btn-acct'); if (!l) return;
  l.textContent = AUTH ? AUTH.id : '로그인';
  b.classList.toggle('on', !!AUTH); b.classList.toggle('err', !!(AUTH && sync.err)); b.classList.toggle('busy', !!(AUTH && (sync.busy || isDirty())));
  b.setAttribute('aria-label', AUTH ? `계정 ${AUTH.id} · ${sync.err ? '동기화 오류' : isDirty() || sync.busy ? '저장 중' : '동기화됨'}` : '로그인 · 회원가입');
  if ($('#dlg-acct').open && AUTH && $('#acct-st')) $('#acct-st').innerHTML = acctStatusHTML();
}
const acctStatusHTML = () => sync.err ? `<span class="bad">${esc(sync.err)}</span>` : sync.busy || isDirty() ? '저장하는 중…' : esc(sync.status || '동기화됨');
function openAcct(html, title) {
  $('#acct-title').textContent = title || (AUTH ? '내 계정' : '로그인');
  $('#acct-body').innerHTML = html;
  const d = $('#dlg-acct'); if (!d.open) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }
}
function acctForm(mode) {
  const su = mode === 'signup';
  openAcct(`<div class="seg acct-tabs" role="tablist"><button data-am="login" aria-pressed="${!su}">로그인</button><button data-am="signup" aria-pressed="${su}">회원가입</button></div>
    <form id="acct-form" class="acct-form" autocomplete="on">
      <label>아이디<input name="id" autocomplete="username" inputmode="latin" autocapitalize="none" spellcheck="false" required minlength="3" maxlength="20" pattern="[a-z0-9_]{3,20}" placeholder="영어 소문자 · 숫자 · _ 3~20자"></label>
      <label>비밀번호<input name="pw" type="password" autocomplete="${su ? 'new-password' : 'current-password'}" required minlength="${su ? 8 : 1}" maxlength="128" placeholder="${su ? '8자 이상' : ''}"></label>
      ${su ? '<label>비밀번호 확인<input name="pw2" type="password" autocomplete="new-password" required minlength="8" maxlength="128"></label>' : ''}
      <p class="acct-msg" id="acct-msg" role="alert"></p>
      <button class="btn solid-gold lg" type="submit">${su ? '가입하고 이 기기 설정 저장' : '로그인'}</button>
    </form>
    <ul class="prose note acct-info">
      <li>로그인하면 보유 캐릭터 · 파티 · 캐릭터 설정 · 육성 계산 · 에코 계산기 입력이 계정에 저장되어, 휴대폰과 컴퓨터에서 똑같이 쓸 수 있습니다.</li>
      <li>이메일 없이 아이디 · 비밀번호만 씁니다. <b>비밀번호를 잊으면 찾을 수 없으니</b> 잘 기억해 두세요.</li>
      <li>비밀번호는 이 기기에서 암호화한 값만 보내며, 서버에는 원래 비밀번호가 남지 않습니다.</li></ul>`, su ? '회원가입' : '로그인');
  $$('[data-am]').forEach(b => b.addEventListener('click', () => acctForm(b.dataset.am)));
  const f = $('#acct-form');
  f.addEventListener('submit', async e => {
    e.preventDefault(); const msg = $('#acct-msg'); const btn = f.querySelector('button[type=submit]');
    const id = f.elements.id.value.trim().toLowerCase(); const pw = f.elements.pw.value;
    if (!/^[a-z0-9_]{3,20}$/.test(id)) { msg.textContent = '아이디는 영어 소문자 · 숫자 · 밑줄(_) 3~20자입니다.'; return; }
    if (su && pw.length < 8) { msg.textContent = '비밀번호는 8자 이상으로 정해 주세요.'; return; }
    if (su && pw !== f.elements.pw2.value) { msg.textContent = '비밀번호 확인이 다릅니다.'; return; }
    btn.disabled = true; msg.textContent = su ? '가입하는 중…' : '로그인하는 중…';
    try {
      const key = await deriveKey(id, pw);
      const r = await api(su ? '/signup' : '/login', { method: 'POST', body: { id, key }, token: null });
      AUTH = { id: r.id, token: r.token, base: 0, snap: '' }; saveAuth();
      if (!r.updated) { await syncPush(true); closeDlg('#dlg-acct'); toast(su ? `${r.id} 계정을 만들고 이 기기 설정을 저장했습니다.` : '로그인했습니다. 이 기기 설정을 계정에 저장했습니다.'); }
      else {
        const d = await api('/data');
        if (JSON.stringify(d.data) === payloadStr()) { AUTH.base = d.updated; AUTH.snap = payloadStr(); saveAuth(); closeDlg('#dlg-acct'); toast('로그인했습니다. 설정이 이미 같습니다.'); }
        else if (localIsEmpty()) { applyRemote(d.data, d.updated); closeDlg('#dlg-acct'); toast(`${r.id} 계정의 설정을 불러왔습니다.`); }
        else askConflict({ ...d, updated: d.updated });
      }
      paintAcct();
    } catch (err) { msg.textContent = err.message; btn.disabled = false; }
  });
}
function acctPanel() {
  openAcct(`<div class="acct-me"><div class="acct-av" aria-hidden="true">${esc(AUTH.id.slice(0, 1).toUpperCase())}</div><div><b>${esc(AUTH.id)}</b><div class="note" id="acct-st">${acctStatusHTML()}</div></div></div>
    <div class="acct-row"><button class="btn" id="acct-sync">지금 동기화</button><button class="btn" id="acct-logout">로그아웃</button></div>
    <p class="note">설정을 바꾸면 몇 초 안에 자동으로 저장되고, 다른 기기에서 사이트를 열거나 화면으로 돌아오면 최신 설정을 불러옵니다.</p>
    <details class="nt"><summary><b>비밀번호 바꾸기</b></summary><form class="acct-form" id="acct-pwf"><label>지금 비밀번호<input name="pw" type="password" autocomplete="current-password" required></label><label>새 비밀번호<input name="np" type="password" autocomplete="new-password" required minlength="8"></label><p class="acct-msg" id="pw-msg" role="alert"></p><button class="btn sm" type="submit">바꾸기</button></form></details>
    <details class="nt"><summary><b>계정 삭제</b></summary><form class="acct-form" id="acct-delf"><p class="note">계정과 저장된 설정이 서버에서 지워집니다. 이 기기의 설정은 그대로 남습니다.</p><label>비밀번호<input name="pw" type="password" autocomplete="current-password" required></label><p class="acct-msg" id="del-msg" role="alert"></p><button class="btn sm danger" type="submit">계정 삭제</button></form></details>`, '내 계정');
  $('#acct-sync').addEventListener('click', () => syncPull());
  $('#acct-logout').addEventListener('click', async () => { try { await api('/logout', { method: 'POST' }); } catch (e) { } AUTH = null; saveAuth(); sync.status = ''; sync.err = ''; paintAcct(); closeDlg('#dlg-acct'); toast('로그아웃했습니다. 이 기기의 설정은 그대로 남아 있습니다.'); });
  $('#acct-pwf').addEventListener('submit', async e => { e.preventDefault(); const f = e.target; const m = $('#pw-msg'); if (f.np.value.length < 8) { m.textContent = '새 비밀번호는 8자 이상입니다.'; return; }
    m.textContent = '바꾸는 중…'; try { const r = await api('/password', { method: 'POST', body: { key: await deriveKey(AUTH.id, f.pw.value), newKey: await deriveKey(AUTH.id, f.np.value) } }); AUTH.token = r.token; saveAuth(); f.reset(); m.textContent = '비밀번호를 바꿨습니다. 다른 기기에서는 다시 로그인해 주세요.'; } catch (err) { m.textContent = err.message; } });
  $('#acct-delf').addEventListener('submit', async e => { e.preventDefault(); const m = $('#del-msg');
    m.textContent = '삭제하는 중…'; try { await api('/delete', { method: 'POST', body: { key: await deriveKey(AUTH.id, e.target.pw.value) } }); AUTH = null; saveAuth(); paintAcct(); closeDlg('#dlg-acct'); toast('계정을 삭제했습니다.'); } catch (err) { m.textContent = err.message; } });
}
function initAcct() {
  $('#btn-acct').addEventListener('click', () => AUTH ? acctPanel() : acctForm('login'));
  $('#acct-close').addEventListener('click', () => closeDlg('#dlg-acct'));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncPull(); else if (isDirty()) syncPush(); });
  paintAcct(); if (AUTH) syncPull();
}

init();
initAcct();
refreshExtra();

// 점검 · 테스트용(읽기 전용): 주소 끝에 ?debug를 붙여 열었을 때만 브라우저 콘솔에서 ATM_DEBUG()로 현재 상태를 볼 수 있음
if (DEBUG) window.ATM_DEBUG = () => ({ curView, state, CHARS, APP_VERSION, evalParty, optimize });
