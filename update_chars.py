#!/usr/bin/env python3
"""
띵조 AUTO TEAM MAKER — 신규 공명자 자동 감지 스크립트

명조 게임 데이터(Arikatsu/WutheringWaves_Data)와 Index.html에 내장된 캐릭터 목록을 비교해
아직 앱에 없는 플레이어블 공명자를 찾아 chars-extra.json으로 내보냅니다.
사이트(Index.html)는 열릴 때 이 파일을 읽어 뽑기 추천·보유 캐릭터·육성 계산 등에 자동으로 추가합니다.

  python tools/update_chars.py <게임데이터 폴더> <Index.html> <출력 chars-extra.json> [--version 3.8] [--commit abc123]

· 전투 수치(필드 비중·버프)는 게임 공식 역할 태그와 반주 스킬 설명으로 '추정'합니다.
· 돌파·스킬·공명 노드 재화, 공명 체인, 전용 무기 후보는 게임 데이터 그대로입니다.
· 아이콘은 555me/Wuthering-Waves-GameAssets에서 받아 작은 WebP로 넣습니다(실패해도 계속 진행).
"""
import argparse, base64, io, json, os, re, sys, urllib.request

ASSET_BASE = 'https://raw.githubusercontent.com/555me/Wuthering-Waves-GameAssets/HEAD/'

ap = argparse.ArgumentParser()
ap.add_argument('data'); ap.add_argument('index'); ap.add_argument('out')
ap.add_argument('--version', default=''); ap.add_argument('--commit', default='')
ap.add_argument('--pretend-new', default='', help='테스트용: 이미 있는 rid를 신규로 취급 (쉼표 구분)')
ap.add_argument('--no-icons', action='store_true')
args = ap.parse_args()
A = args.data


def load(p):
    return json.load(open(os.path.join(A, p), encoding='utf-8'))


tm = {x['Id']: x['Content'] for x in load('Textmaps/ko/multi_text/MultiText.json')}
T = lambda k: tm.get(k, '') if k else ''
clean = lambda s: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s or '')).strip()
norm = lambda s: re.sub(r'[\s·・]', '', s or '')

# ---------------------------------------------------------------- 앱에 이미 있는 것
html = open(args.index, encoding='utf-8').read()


def js_const(name):
    m = re.search(r'const ' + name + r'=(\{.*?\});\n', html)
    try:
        return json.loads(m.group(1)) if m else {}
    except Exception:
        return {}


known_rids = set(int(x) for x in re.findall(r"\brid:\s*(\d+)", html) if int(x))
pretend = set(int(x) for x in args.pretend_new.split(',') if x.strip())
known_rids -= pretend
raw_roles = js_const('RAW_ROLES')
known_names = {norm(v.get('n', '')) for k, v in raw_roles.items() if int(k) in known_rids}
placeholder = {}  # 출시 전이라 rid 0으로 넣어 둔 캐릭터(예: 릴리) → 데이터가 생기면 이름으로 연결
for m in re.finditer(r"\{ id: '([a-z0-9_]+)', rid: (\d+)[^\n]*?name: '([^']+)'", html):
    if int(m.group(2)) == 0:
        placeholder[norm(m.group(3))] = m.group(1)
    elif int(m.group(2)) in known_rids:
        known_names.add(norm(m.group(3)))
known_weapons = set(js_const('RAW_WEAPONS').keys())
grow_known = js_const('RAW_GROW')
known_items = set((grow_known.get('items') or {}).keys())
known_exp = set((grow_known.get('exp') or {}).keys())

# ---------------------------------------------------------------- 게임 데이터
roles_all = [r for r in load('BinData/role/roleinfo.json') if r.get('RoleType') == 1 and not r.get('IsTrial')]
items = {x['Id']: x for x in load('BinData/item/iteminfo.json')}
breach = load('BinData/role_level/rolebreach.json')
lvc = load('BinData/role_level/rolelevelconsume.json')
skills = load('BinData/skill/skill.json')
slv = load('BinData/skill/skilllevel.json')
tree = load('BinData/skillTree/skilltree.json')
chains = load('BinData/resonate_chain/resonantchain.json')
weapons = load('BinData/weapon/weaponconf.json')
try:
    tags = {t['Id']: T(t['TagName']) for t in load('BinData/role/roletag.json')}
except Exception:
    tags = {}

EL_BY_ID = {1: 'glacio', 2: 'fusion', 3: 'electro', 4: 'aero', 5: 'spectro', 6: 'havoc'}
EL_KO = {'응결': 'glacio', '용융': 'fusion', '전도': 'electro', '기류': 'aero', '회절': 'spectro', '인멸': 'havoc'}
DT_KO = {'일반 공격': 'n', '강공격': 'h', '공명 스킬': 's', '공명 해방': 'l', '에코 스킬': 'e', '에코 어빌리티': 'e', '협동 공격': 'c', '변주 스킬': 'i'}
# 게임 공식 역할 태그(roletag.json) → 앱의 능력 키
TAG_AP = {1: 'heal', 9: 'coord', 24: 'erosion', 25: 'flare', 26: 'chafe', 27: 'fusionBurst', 28: 'frazzle', 29: 'bane',
          33: 'tuneRupture', 34: 'tuneRupture', 35: 'tuneStrain', 36: 'tuneStrain', 37: 'echo', 38: 'hack', 39: 'unison'}
TAG_DT = {4: 'n', 5: 'h', 6: 's', 7: 'l', 9: 'c', 37: 'e'}
TAG_ELAMP = {14: 'havoc', 15: 'aero', 16: 'electro', 17: 'fusion', 18: 'glacio', 19: 'spectro'}
TAG_DTAMP = {20: 'n', 21: 'h', 22: 's', 23: 'l', 31: 'c', 32: 'e'}
ANOM = {'erosion', 'flare', 'chafe', 'fusionBurst', 'frazzle', 'bane'}


def fill(desc, nums):
    return re.sub(r'\{(\d+)\}', lambda m: nums[int(m.group(1))] if int(m.group(1)) < len(nums) else '?', desc)


def icon_uri(game_path, size):
    """게임 경로(/Game/Aki/UI/...) → 555me 저장소 PNG → 작은 WebP data URI"""
    if args.no_icons or not game_path:
        return ''
    rel = game_path.split('.')[0].lstrip('/')
    rel = re.sub(r'^Game/Aki/', '', rel) + '.png'
    try:
        from PIL import Image
        with urllib.request.urlopen(ASSET_BASE + rel, timeout=60) as r:
            im = Image.open(io.BytesIO(r.read())).convert('RGBA')
        im.thumbnail((size, size), Image.LANCZOS)
        b = io.BytesIO(); im.save(b, 'WEBP', quality=80, method=6)
        return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
    except Exception as e:  # 아이콘이 없어도 데이터는 계속 만든다
        print('  아이콘 실패', rel, e, file=sys.stderr)
        return ''


def parse_outro(text, name):
    """반주 스킬 설명에서 파티 버프를 읽어 앱 버프 형식으로 (추정)"""
    out = []
    pat = re.compile(r'(다음 등장 캐릭터|파티 내 (?:모든 )?(?:등장 )?캐릭터|주변의 모든 파티 내 캐릭터|파티 전원|모든 캐릭터)(?:의|가|는)? ?'
                     r'([가-힣 ]{0,16}?)\s?피해(?:가|를|는)? ?(\d+(?:\.\d+)?)% ?(부스트|증가|심화)')
    for m in pat.finditer(text):
        who, what, v, kind = m.group(1), m.group(2).strip(), float(m.group(3)), m.group(4)
        b = {'s': 'amp' if kind in ('부스트', '심화') else 'bonus', 'v': v, 'to': 'next' if '다음' in who else 'team'}
        for k, e in EL_KO.items():
            if k in what: b['el'] = e
        for k, d in DT_KO.items():
            if k in what: b['dt'] = d
        if b['to'] == 'next': b['up'] = .9
        b['src'] = f'{name} 반주(자동 추정): ' + m.group(0)[:60]
        out.append(b)
    m = re.search(r'(다음 등장 캐릭터|파티 내 (?:모든 )?캐릭터|파티 전원)(?:의)? ?공격력(?:이|을)? ?(\d+(?:\.\d+)?)% ?증가', text)
    if m:
        out.append({'s': 'atk', 'v': float(m.group(2)), 'to': 'next' if '다음' in m.group(1) else 'team', 'src': f'{name} 반주(자동 추정): 공격력 {m.group(2)}%'})
    return out[:3]


def guess_combat(r, name, tag_ids, outro_txt, el):
    ap_ = []
    for t in tag_ids:
        k = TAG_AP.get(t)
        if k and k not in ap_: ap_.append(k)
    if '실드' in outro_txt and 'shield' not in ap_: ap_.append('shield')
    q = r['QualityId']
    if 2 in tag_ids:
        role = 'main'
    elif 1 in tag_ids:
        role = 'sup'
    elif q == 4:
        role = 'sub'
    elif any(t in tag_ids for t in list(TAG_ELAMP) + list(TAG_DTAMP) + [13]):
        role = 'sub'
    else:
        role = 'main'
    dts = [TAG_DT[t] for t in tag_ids if t in TAG_DT]
    if role == 'main':
        p = {d: 0 for d in (dts or ['n', 's', 'l'])}
        base = 70 if (set(ap_) & ANOM) else 100
        for d in p: p[d] = round(base / len(p))
        if set(ap_) & ANOM: p['st'] = 30
        pw = 100
    elif role == 'sub':
        p = {d: 0 for d in (dts or ['s', 'l'])}
        for d in p: p[d] = round(100 / len(p))
        pw = 40 if q == 5 else 30
    else:
        p = {'s': 40, 'l': 40, 'n': 20}
        pw = 16
    b = parse_outro(outro_txt, name)
    if not b and role != 'main':
        # 설명에서 못 읽으면 공식 태그(○○ 피해 부스트)로 대략 잡는다
        el_amp = [TAG_ELAMP[t] for t in tag_ids if t in TAG_ELAMP]
        dt_amp = [TAG_DTAMP[t] for t in tag_ids if t in TAG_DTAMP]
        if el_amp or dt_amp or 13 in tag_ids:
            x = {'s': 'amp', 'v': 20 if role == 'sup' else 15, 'to': 'team', 'up': .8, 'src': f'{name}(자동 추정): 공식 태그 「피해 부스트」 기준'}
            if el_amp: x['el'] = el_amp[0]
            if dt_amp: x['dt'] = dt_amp[0]
            b.append(x)
    return role, pw, p, ap_, b


def grow_of(r):
    C = lambda arr: [[c['Key'], c['Value']] for c in arr]
    bb = sorted([x for x in breach if x['BreachGroupId'] == r['BreachId']], key=lambda x: x['BreachLevel'])
    asc = [{'cap': x['MaxLevel'], 'c': C(x['BreachConsume'])} for x in bb]
    sk = {s['SkillType']: s for s in skills if s['SkillGroupId'] == r['SkillId'] and s['SkillType'] in (1, 2, 3, 5, 6)}
    sl = {}
    for t, key in [(1, 'a'), (2, 's'), (6, 'f'), (3, 'l'), (5, 'i')]:
        s = sk.get(t)
        if not s: continue
        lv = sorted([x for x in slv if x['SkillLevelGroupId'] == s['SkillLevelGroupId']], key=lambda x: x['SkillId'])
        sl[key] = [C(x['Consume']) for x in lv]
    if len(asc) < 7 or not sl:
        return None
    nodes = [n for n in tree if n['NodeGroup'] == r['SkillTreeGroupId']]
    stat1 = [C(n['Consume']) for n in nodes if n['NodeType'] == 4 and n['Coordinate'] == 1]
    stat2 = [C(n['Consume']) for n in nodes if n['NodeType'] == 4 and n['Coordinate'] == 2]
    s_ref = sl.get('s') or next(iter(sl.values()))
    first = lambda lvl, idx: s_ref[lvl][idx][0]
    forte = [first(1, 0), first(3, 0), first(5, 0), first(7, 0)]
    common = [first(1, 1), first(3, 1), first(5, 1), first(7, 1)]
    weekly = [k for k, v in s_ref[6] if k not in forte + common and k != 2][0]
    inh = [[[forte[1], 3], [common[1], 3], [2, 10000]], [[forte[2], 3], [common[2], 3], [weekly, 1], [2, 20000]]]
    cat = {'boss': asc[2]['c'][0][0], 'spec': asc[2]['c'][1][0], 'forte': forte, 'common': common,
           'ascCommon': [asc[1]['c'][0][0], asc[2]['c'][2][0], asc[4]['c'][2][0], asc[6]['c'][2][0]], 'weekly': weekly}
    g = {'g': r['LevelConsumeId'], 'max': r['MaxLevel'], 'asc': asc, 'sk': sl, 'n1': stat1[0] if stat1 else [],
         'n2': stat2[0] if stat2 else [], 'inh': inh, 'cat': cat}
    used = set()
    for a in asc: used.update(k for k, _ in a['c'])
    for v in sl.values():
        for lv in v: used.update(k for k, _ in lv)
    for arr in stat1 + stat2 + inh: used.update(k for k, _ in arr)
    return g, used


SUB = {8: 'cr', 9: 'cd', 10007: 'atk', 11: 'er', 10002: 'hp', 10010: 'def'}


def weapon_entry(w):
    def filld(desc, params):
        return re.sub(r'\{(\d+)\}', lambda m: (params[int(m.group(1))].get('ArrayString') or ['?'])[0] if int(m.group(1)) < len(params) else '?', desc)
    p2 = w['SecondPropId']; k = SUB.get(p2['Id'], str(p2['Id']))
    v = round(p2['Value'] * 4.5 * 100, 1) if p2.get('IsRatio') else round(p2['Value'] * 0.045, 1)
    return {'n': T(w['WeaponName']), 'q': w['QualityId'], 'wt': w['WeaponType'], 'atk': round(w['FirstPropId']['Value'] * 12.4894),
            'sub': [k, v], 'd': clean(filld(T(w['Desc']), w.get('DescParams', [])))}


# ---------------------------------------------------------------- 신규 감지
new_weapons = [w for w in weapons if w.get('QualityId') == 5 and str(w['ItemId']) not in known_weapons and T(w.get('WeaponName'))]
out_roles, out_items, out_exp, out_weapons, used_all = [], {}, {}, {}, set()
for r in roles_all:
    if r['Id'] in known_rids: continue
    name = clean(T(r['Name']))
    if not name: continue
    key = norm(name)
    merge = placeholder.get(key)
    if not merge and key in known_names: continue  # 이미 있는 캐릭터
    if key.startswith('방랑자'): continue  # 방랑자는 성별·속성 변형이 많아 직접 반영
    print('신규 공명자:', r['Id'], name, '(자리 채우기: ' + merge + ')' if merge else '')
    el = EL_BY_ID.get(r['ElementId'], 'spectro')
    outro = next((s for s in skills if s['SkillGroupId'] == r['SkillId'] and s['SkillType'] == 11), None)
    outro_txt = clean(fill(T(outro['SkillDescribe']), outro.get('SkillDetailNum', []))) if outro else ''
    tag_ids = list(r.get('Tag') or [])
    role, pw, p, ap_, b = guess_combat(r, name, tag_ids, outro_txt, el)
    ent = {'rid': r['Id'], 'n': name, 'q': r['QualityId'], 'el': el, 'wt': r['WeaponType'], 'role': role, 'pw': pw, 'p': p,
           'ap': ap_, 'b': b, 'tags': [tags.get(t, str(t)) for t in tag_ids],
           'outro': {'n': T(outro['SkillName']) if outro else '', 'd': outro_txt}, 'prio': r.get('Priority', 0)}
    if merge: ent['merge'] = merge
    ws = sorted([w for w in new_weapons if w['WeaponType'] == r['WeaponType']], key=lambda w: -w['ItemId'])
    if ws:
        w = ws[0]; ent['w'] = w['ItemId']
        out_weapons[str(w['ItemId'])] = {**weapon_entry(w), 'img': icon_uri(w.get('Icon'), 72)}
    ent['img'] = icon_uri(r.get('RoleHeadIconLarge') or r.get('RoleHeadIconBig'), 112)
    ch = {}
    for c in chains:
        if c['GroupId'] != r['ResonantChainGroupId'] and c['GroupId'] != r['Id']: continue
        d = T(c['AttributesDescription'])
        for i, prm in enumerate(c.get('AttributesDescriptionParams', [])): d = d.replace('{%d}' % i, prm)
        ch[str(c['GroupIndex'])] = {'n': T(c['NodeName']), 'd': clean(d)}
    if ch: ent['chain'] = ch
    gu = grow_of(r)
    if gu:
        ent['grow'] = gu[0]; used_all |= gu[1]
        if str(r['LevelConsumeId']) not in known_exp:
            out_exp[str(r['LevelConsumeId'])] = [x['ExpCount'] for x in sorted([y for y in lvc if y['ConsumeGroupId'] == r['LevelConsumeId']], key=lambda y: y['Level'])]
    out_roles.append(ent)

for k in sorted(used_all):
    if str(k) in known_items: continue
    x = items.get(k)
    if not x: continue
    out_items[str(k)] = {'n': T(x['Name']), 'q': x.get('QualityId', 1), 'img': icon_uri(x.get('IconMiddle') or x.get('Icon'), 72)}

doc = {'schema': 1, 'gameVer': args.version, 'dataCommit': args.commit, 'roles': out_roles, 'weapons': out_weapons, 'items': out_items, 'exp': out_exp}
old = None
if os.path.exists(args.out):
    try:
        old = json.load(open(args.out, encoding='utf-8'))
    except Exception:
        old = None
strip = lambda d: {k: v for k, v in (d or {}).items() if k not in ('updated', 'dataCommit')}
if old and strip(old) == strip(doc):
    print('변경 없음 — 파일을 그대로 둡니다.')
    sys.exit(0)
import datetime
doc['updated'] = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
with open(args.out, 'w', encoding='utf-8') as f:
    json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))
print(f'저장: {args.out} · 신규 {len(out_roles)}명 · 무기 {len(out_weapons)} · 재화 {len(out_items)} · {os.path.getsize(args.out):,} bytes')
