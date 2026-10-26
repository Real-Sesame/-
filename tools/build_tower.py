#!/usr/bin/env python3
"""
띵조 AUTO TEAM MAKER — 역경의 탑(심경 구역) 시즌 구성 만들기

게임 데이터(Arikatsu/WutheringWaves_Data)의 BinData/tower와 한국어 텍스트로
public/tower.json을 만듭니다. 사이트는 이 파일을 먼저 읽고, 없을 때만 예전처럼 게임 데이터를 직접 받습니다
(한국어 텍스트가 이미 들어 있어 새 시즌에 55MB짜리 텍스트를 따로 받을 필요가 없음).

  {"at": "<만든 시각>", "latest": 42, "db": {"41": [{a 구역, f 층, c 피로도, rec 추천 속성, m 적, b 버프}, ...]}}

  python tools/build_tower.py <게임데이터 폴더> public/tower.json
"""
import argparse, datetime as dt, json, os, re

ap = argparse.ArgumentParser()
ap.add_argument('data'); ap.add_argument('out')
ap.add_argument('--keep', type=int, default=4, help='최근 몇 시즌을 넣을지')
args = ap.parse_args()


def load(p):
    return json.load(open(os.path.join(args.data, p), encoding='utf-8'))


tm = {x['Id']: x['Content'] for x in load('Textmaps/ko/multi_text/MultiText.json')}
T = lambda k: tm.get(k, '') if k else ''
clean = lambda s: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s or '')).strip()

cfg = [c for c in load('BinData/tower/towerconfig.json') if c.get('Difficulty') == 3]
buff = {b['Id']: b.get('Desc') for b in load('BinData/tower/towerbuff.json')}
mons = {m['Id']: m.get('Name') for m in load('BinData/monster_Info/monsterinfo.json')}
latest = max(c['Season'] for c in cfg)
AREA = {1: '잔향의 탑', 2: '심연의 탑', 3: '울림의 탑'}
db = {}
for c in sorted(cfg, key=lambda c: (c['Season'], c['AreaNum'], c['Floor'])):
    if c['Season'] <= latest - args.keep:
        continue
    b = [clean(T(buff.get(i))) for i in c.get('ShowBuffs') or []]
    m = [clean(T(mons.get(i))) or '신규 적' for i in c.get('ShowMonsters') or []]
    db.setdefault(str(c['Season']), []).append({'a': c['AreaNum'], 'f': c['Floor'], 'n': AREA.get(c['AreaNum'], ''), 'c': c.get('Cost'), 'rec': c.get('RecommendElement') or [],
                                                'm': m, 'b': [x for x in b if x]})
body = {'latest': latest, 'db': db}
try:
    old = json.load(open(args.out, encoding='utf-8'))
    if {k: old.get(k) for k in body} == body:
        print(f'역경의 탑: 변경 없음 (최신 시즌 {latest})'); raise SystemExit
except (FileNotFoundError, ValueError):
    pass
body['at'] = dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
os.makedirs(os.path.dirname(args.out) or '.', exist_ok=True)
json.dump(body, open(args.out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(f'역경의 탑 저장: 시즌 {list(db)}')
