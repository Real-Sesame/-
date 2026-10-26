#!/usr/bin/env python3
"""
띵조 AUTO TEAM MAKER — 죽음의 노래와 바닷속 폐허 시즌 정보 만들기

게임 데이터(Arikatsu/WutheringWaves_Data)의 BinData/ShipTower(게임 안 이름 SlashAndTower)를 읽어
시즌 콘텐츠 화면에서 쓰는 public/wastes.json을 만듭니다(그 화면을 열 때만 받아 옴).

  {"seasons": {"23": {"lv": [...], "tok": [...], "burn": "...", "hot": "..."}}, "perm": [...], "latest": 23}
  lv  : 층 하나 = {o 순서, n 이름, z 구역(해곡 · 급류), sc 목표 점수, end 끝없는 심연 여부, d 설명,
                   h: [전반 · 후반] 각각 {m: [[적 이름, [속성 번호]]], r: [저항이 오른 속성 번호]}}
  tok : 이번 시즌 증표 = [이름, 효과]

  python tools/build_wastes.py <게임데이터 폴더> public/wastes.json
"""
import argparse, json, os, re

ap = argparse.ArgumentParser()
ap.add_argument('data'); ap.add_argument('out')
ap.add_argument('--keep', type=int, default=2, help='최근 몇 시즌을 넣을지')
args = ap.parse_args()


def load(p):
    return json.load(open(os.path.join(args.data, p), encoding='utf-8'))


tm = {x['Id']: x['Content'] for x in load('Textmaps/ko/multi_text/MultiText.json')}
T = lambda k: tm.get(k, '') if k else ''
clean = lambda s: re.sub(r'[ \t]+', ' ', re.sub(r'<[^>]+>', '', s or '')).strip()
EL_KO = {'응결': 1, '용융': 2, '전도': 3, '기류': 4, '회절': 5, '인멸': 6}

D = 'BinData/ShipTower/'
cfg = load(D + 'slashandtowercfg.json')
stage = {x['InstId']: x for x in load(D + 'slashtowerstageinfo.json')}
seasons = {x['Id']: x for x in load(D + 'slashandtowerseason.json')}
tags = {}
for t in load(D + 'slashtowertaginfo.json'):
    m = re.match(r'(응결|용융|전도|기류|회절|인멸)', T(t['Name']))
    if m:
        tags[t['Id']] = EL_KO[m.group(1)]
tok_rows = load(D + 'slashbufftoitem.json')
items = {x['Id']: x for x in load('BinData/item/iteminfo.json')}
try:
    mons = {m['Id']: m for m in load('BinData/monster_Info/monsterinfo.json')}
except Exception:
    mons = {}


def monster(mid):
    m = mons.get(mid)
    if not m:
        return None
    n = clean(T(m.get('Name')))
    if not n:
        return None
    return [n, [e for e in (m.get('ElementIdArray') or []) if e in range(1, 7)]]


def level(c):
    halves = []
    for inst in c.get('InstIds') or []:
        s = stage.get(inst) or {}
        ms, seen = [], set()
        for mid in s.get('MonsterId') or []:
            x = monster(mid)
            if x and x[0] not in seen:
                seen.add(x[0]); ms.append(x)
        halves.append({'m': ms, 'r': sorted({tags[b] for b in (s.get('BuffId') or []) if b in tags})})
    return {'o': c.get('OrderIndex'), 'n': clean(T(c.get('Title'))), 'z': '급류' if c.get('EndLess') else ('해곡' if c['Season'] else '금기의 해역'),
            'sc': c.get('TargetScore') or [], 'end': bool(c.get('EndLess')), 'd': clean(T(c.get('Desc'))), 'h': halves}


def token(row):
    it = items.get(row.get('ItemId')) or {}
    n = clean(T(it.get('Name')))
    d = clean(T(it.get('AttributesDescription')))
    d = re.sub(r'\s*해당 증표는 죽음의 노래와 바닷속 폐허에서 최대 (\d+)회 사용 가능하다\.?', r' (최대 \1회)', d).strip()
    return [n, d] if n else None


latest = max(c['Season'] for c in cfg)
perm = {}
for c in sorted((c for c in cfg if c['Season'] == 0), key=lambda c: (c['OrderIndex'], c['Id'])):
    perm[c['OrderIndex']] = level(c)  # 같은 층이 여러 번 있으면 마지막(최신) 것
out = {'latest': latest, 'seasons': {}, 'perm': [perm[k] for k in sorted(perm)]}
for n in range(max(1, latest - args.keep + 1), latest + 1):
    lv = [level(c) for c in sorted((c for c in cfg if c['Season'] == n), key=lambda c: c['OrderIndex'])]
    if not lv:
        continue
    sz = seasons.get(n) or {}
    out['seasons'][str(n)] = {
        'lv': lv,
        'tok': [t for t in (token(r) for r in tok_rows if r.get('Season') == n) if t],
        'burn': clean(T(sz.get('BuringTideDesc'))), 'hot': clean(T(sz.get('HotDesc')))}

new = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
try:
    if open(args.out, encoding='utf-8').read() == new:
        print(f'죽음의 노래와 바닷속 폐허: 변경 없음 (최신 시즌 {latest})'); raise SystemExit
except FileNotFoundError:
    pass
os.makedirs(os.path.dirname(args.out) or '.', exist_ok=True)
open(args.out, 'w', encoding='utf-8').write(new)
print(f'죽음의 노래와 바닷속 폐허 저장: 시즌 {list(out["seasons"])} · 상시 {len(out["perm"])}층 · {len(new):,} bytes')
