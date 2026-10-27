#!/usr/bin/env python3
"""
띵조 AUTO TEAM MAKER — 공명자별 추천 메인 에코 만들기

1) src/data/main-echo-picks.json(공략 사이트에서 모은 추천, 게임 영어 이름)을 게임 데이터의 에코와 맞춰 한국어 이름 · 코스트 · 세트 · 효과로 바꾸고
2) 거기 없는 공명자(새 공명자 포함)는 게임 데이터로 고릅니다:
   4코스트 에코 중 추천 세트(게임의 추천 세트 · 앱의 세트)에 속하고, 메인 슬롯 효과가 그 공명자의 속성 · 주력 피해 유형과 맞는 것.
   이름이 들어간 전용 에코(예: 「에이메스가 메인 슬롯에…」)는 가장 먼저 고릅니다.
결과: public/echoes.json (공명자 화면을 열 때만 받아 옴) — 아이콘은 tools/build_assets.py가 public/assets/echo/에 만듭니다.

  python tools/build_echoes.py <게임데이터 폴더> <저장소 폴더>
"""
import argparse, json, os, re

ap = argparse.ArgumentParser()
ap.add_argument('data'); ap.add_argument('repo')
args = ap.parse_args()
R = args.repo


def load(p):
    return json.load(open(os.path.join(args.data, p), encoding='utf-8'))


tko = {x['Id']: x['Content'] for x in load('Textmaps/ko/multi_text/MultiText.json')}
ten = {x['Id']: x['Content'] for x in load('Textmaps/en/multi_text/MultiText.json')}
clean = lambda s: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s or '')).strip()
EL = {1: '응결', 2: '용융', 3: '전도', 4: '기류', 5: '회절', 6: '인멸'}
EL_KEY = {'glacio': 1, 'fusion': 2, 'electro': 3, 'aero': 4, 'spectro': 5, 'havoc': 6}
DT = {'n': '일반 공격', 'h': '강공격', 's': '공명 스킬', 'l': '공명 해방', 'e': '에코 어빌리티'}
COST = {0: 1, 1: 3, 2: 4, 3: 4}

skills = {s['PhantomSkillId']: s for s in load('BinData/phantom/phantomskill.json')}
# 4코스트 · 기본형(PhantomType 1) · 가장 높은 품질만, 이름마다 하나
echoes = {}
for x in load('BinData/phantom/phantomitem.json'):
    if COST.get(x.get('Rarity')) != 4 or x.get('PhantomType') != 1:
        continue
    ko = clean(tko.get(x.get('MonsterName'), '')); en = clean(ten.get(x.get('MonsterName'), ''))
    if not ko:
        continue
    cur = echoes.get(en or ko)
    if cur and cur['_q'] >= x.get('QualityId', 0):
        continue
    sk = skills.get(x.get('SkillId')) or {}
    d = clean(tko.get(sk.get('SimplyDescription'), ''))
    icon = (x.get('IconMiddle') or x.get('Icon') or '').split('.')[0]
    icon = re.sub(r'^/Game/Aki/', '', icon) + '.png' if icon.startswith('/Game/') else ''
    echoes[en or ko] = {'id': x['MonsterId'], 'n': ko, 'en': en, 'c': 4, 'sets': x.get('FetterGroup') or [], 'el': (x.get('ElementType') or [0])[0], 'd': d, 'cd': sk.get('SkillCD'), 'icon': icon, '_q': x.get('QualityId', 0)}
by_en = {e['en']: e for e in echoes.values() if e['en']}
try:
    official = {r['RoleId']: r.get('RecommendFetterGroups') or [] for r in load('BinData/VisionRecommend/phantomrecommend.json')}
except Exception:
    official = {}

# 앱의 공명자 목록(vite.config.js와 같은 방식으로 src/app.js에서 읽음)
src = open(os.path.join(R, 'src/app.js'), encoding='utf-8').read()
roles = json.load(open(os.path.join(R, 'src/data/raw-roles.json'), encoding='utf-8'))
chars = []
for line in src.split('\n'):
    a = re.match(r"\s*\{ id: '([a-z0-9_]+)', rid: (\d+)", line)
    if not a:
        continue
    cid, rid = a.group(1), int(a.group(2))
    r = roles.get(str(rid)) or {}
    el = EL_KEY.get((re.search(r"\bel: '([a-z]+)'", line) or [None, ''])[1]) or r.get('el') or 0
    role = (re.search(r"role: '(\w+)'", line) or [None, ''])[1]
    st = int((re.search(r'\bset: (\d+)', line) or [None, 0])[1] or 0)
    p = dict((k, int(v)) for k, v in re.findall(r'\b([nhsle]): (\d+)', (re.search(r'\bp: \{([^}]*)\}', line) or [None, ''])[1]))
    name = (re.search(r"name: '([^']+)'", line) or [None, ''])[1] or r.get('n') or cid
    chars.append({'id': cid, 'rid': rid, 'el': el, 'role': role, 'set': st, 'p': p, 'name': name})

picks = json.load(open(os.path.join(R, 'src/data/main-echo-picks.json'), encoding='utf-8'))


def auto(c):
    top = max(c['p'], key=c['p'].get) if c['p'] else None
    sets = {c['set']} | set(official.get(c['rid'], []))
    nm = re.sub(r'[·\s]', '', c['name'])
    out = []
    for e in echoes.values():
        d = e['d']; s = 0; why = []
        if nm and nm in re.sub(r'[·\s]', '', d): s += 8; why.append('전용 에코')
        if c['set'] in e['sets']: s += 5; why.append('추천 세트')
        elif sets & set(e['sets']): s += 3; why.append('게임 추천 세트')
        if c['el'] and (e['el'] == c['el'] or f"{EL[c['el']]} 피해" in d): s += 4
        if top and DT.get(top, '#') in d: s += 2
        other = [v for k, v in EL.items() if k != c['el'] and re.search(f'자신의 {v} 피해|{v} 피해(가|와|를) 증가|{v} 및', d)]
        if other: s -= 5  # 다른 속성 피해를 올리는 메인 효과
        if c['role'] == 'sup' and re.search(r'파티|다음|등장하는 캐릭터|치료|실드', d): s += 2
        if re.search(r'메인 슬롯에 장착 시|메인 슬롯에 해당', d): s += 1
        if re.search(r'방랑자|루시 혹은|이 메인 슬롯', d) and 'nm' not in why and not (nm and nm in d): s -= 6  # 다른 공명자 전용
        out.append((s, e['en'] or e['n'], why))
    out.sort(key=lambda x: -x[0])
    return [x[1] for x in out[:2] if x[0] >= 7], (out[0][2] if out else [])


res = {'chars': {}, 'echoes': {}}
miss = []
for c in chars:
    names = [n for n in picks.get(c['id'], []) if n in by_en]
    bad = [n for n in picks.get(c['id'], []) if n not in by_en]
    if bad:
        miss.append(f"{c['id']}: {bad}")
    srcs = 'guide'
    if not names:
        names, _ = auto(c); srcs = 'auto'
    if not names:
        continue
    ids = []
    for n in names:
        e = by_en.get(n) or next((x for x in echoes.values() if x['n'] == n), None)
        if e:
            ids.append(e['id']); res['echoes'][str(e['id'])] = {k: v for k, v in e.items() if k != '_q'}
    insets = [bool(c['set'] and c['set'] in res['echoes'][str(i)]['sets']) for i in ids]
    res['chars'][c['id']] = {'m': ids, 'src': srcs, 'inset': insets}
if miss:
    print('게임 데이터에서 못 찾은(또는 4코스트가 아닌) 추천 에코:', '; '.join(miss))
out = os.path.join(R, 'public/echoes.json')
new = json.dumps(res, ensure_ascii=False, separators=(',', ':'))
try:
    if open(out, encoding='utf-8').read() == new:
        print('메인 에코: 변경 없음'); raise SystemExit
except FileNotFoundError:
    pass
open(out, 'w', encoding='utf-8').write(new)
print(f"메인 에코 저장: 공명자 {len(res['chars'])}명(공략 {sum(v['src'] == 'guide' for v in res['chars'].values())} · 자동 {sum(v['src'] == 'auto' for v in res['chars'].values())}) · 에코 {len(res['echoes'])}종")
