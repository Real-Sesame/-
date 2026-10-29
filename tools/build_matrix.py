#!/usr/bin/env python3
"""
띵조 AUTO TEAM MAKER — 종말 매트릭스 정보 만들기

게임 데이터(Arikatsu/WutheringWaves_Data)의 BinData/NewTower(게임 안 이름 WheelBattle · MowingTower)를 읽어
시즌 콘텐츠 화면에서 쓰는 public/matrix.json을 만듭니다(그 화면을 열 때만 받아 옴).

  {"season": {id, n 이름, tag "S2", from "3.5", to "3.8"},
   "stages": [{c 주기 번호, n "S2 단계3", v 버전, s · e 기간(public/events.json의 버전 일정),
               crisis [위기 특수 요원 rid], enh [[rid, 강화 설명]], buffs [[증폭 회로 이름, 설명]],
               stab {teams 3, sc [B, A, S 목표 점수], rounds [R]}, sing {sc [7단계], rounds [R, R, R]}}],
   "ranks": [...], "rules": [...]}
  R = {m 득점 배율, e: [{n 적 이름, el 속성, res [저항 속성], b [[기믹 이름, 설명]], f 공략 포인트, k 격파 보너스}]}

  python tools/build_matrix.py <게임데이터 폴더> <저장소 폴더>
"""
import argparse, json, os, re

ap = argparse.ArgumentParser()
ap.add_argument('data'); ap.add_argument('repo')
args = ap.parse_args()
R = args.repo


def load(p):
    return json.load(open(os.path.join(args.data, p), encoding='utf-8'))


tm = {x['Id']: x['Content'] for x in load('Textmaps/ko/multi_text/MultiText.json')}
T = lambda k: tm.get(k, '') if k else ''
clean = lambda s: re.sub(r'[ \t]+', ' ', re.sub(r'<[^>]+>', '', s or '')).strip()


def fill(s, params):
    s = T(s) if s and not re.search(r'\s', s) and s in tm else (s or '')
    for i, p in enumerate(params or []):
        s = s.replace('{%d}' % i, str(p))
    return clean(s)


D = 'BinData/NewTower/'
params = load(D + 'newtowerparam.json')
seasons = {x['Id']: x for x in load(D + 'newtowerseason.json')}
levels = load(D + 'newtowerlevel.json')
waves = load(D + 'newtowerwave.json')
buffs = {x['Id']: x for x in load(D + 'newtowerbuff.json')}
bossbuff = {x['Id']: x for x in load(D + 'newtowerbossbuff.json')}
feats = {x['Id']: x for x in load(D + 'newtowerteamfeature.json')}
tags = {x['Id']: x for x in load(D + 'newtowertag.json')}
roles = {x['Id']: x for x in load(D + 'newtowerrole.json')}
EL_KO = {'응결': 1, '용융': 2, '전도': 3, '기류': 4, '회절': 5, '인멸': 6}
tag_el = {}
for t in tags.values():
    m = re.match(r'(응결|용융|전도|기류|회절|인멸)', T(t['Name']))
    if m:
        tag_el[t['Id']] = EL_KO[m.group(1)]
try:
    vinfo = json.load(open(os.path.join(R, 'public/events.json'), encoding='utf-8')).get('vinfo', {})
except Exception:
    vinfo = {}

season = seasons[max(seasons)]
cycles = [p for p in params if p['SeasonId'] == season['Id']]
if not cycles:  # 새 시즌 정보만 있고 단계가 아직 없으면 지난 시즌
    season = seasons[max(k for k in seasons if any(p['SeasonId'] == k for p in params))]
    cycles = [p for p in params if p['SeasonId'] == season['Id']]
cycles.sort(key=lambda p: p['CycleId'])
v0 = float(season.get('StartVersionId') or 0)


def feature(fid):
    f = feats.get(fid)
    s = clean(T(f['Name'])) if f else ''
    return s if ':' in s else ''  # 「이상 효과 시스템: …」처럼 설명이 있는 것만


def rounds(lv_id):
    out = {}
    for w in sorted((w for w in waves if w['Level'] == lv_id), key=lambda w: w['Wave']):
        r = out.setdefault(w['Round'], {'m': round(float(w.get('DamegaRateShow') or 1) or 1, 2), 'e': []})
        b = []
        for bid in w.get('ShowBuffIds') or []:
            x = bossbuff.get(bid)
            if x:
                b.append([clean(T(x['SkillTitle'])), clean(T(x['SkillDesc']) or x['SkillDesc'])])
        f = ' '.join(filter(None, (feature(i) for i in w.get('RecommendTeamFeature') or [])))
        r['e'].append({'n': clean(T(w['Name'])), 'el': w.get('ElementId') or 0,
                       'res': [tag_el[t] for t in w.get('TagIdList') or [] if t in tag_el],
                       'b': b, 'f': f, 'k': w.get('KillScore') or 0})
    return [out[k] for k in sorted(out)]


stages = []
for i, p in enumerate(cycles):
    v = f'{v0 + i * 0.1:.1f}' if v0 else ''
    lv = {x['Diff']: x for x in levels if x['Param'] == p['CycleId']}
    if 0 not in lv:
        continue
    enh = []
    for rid in p.get('EnhanceRoleIds') or []:
        r = roles.get(rid) or {}
        ps = {e['Key']: (e['Value'] or {}).get('ArrayString') or [] for e in r.get('EnhanceSkillDescParam') or []}
        d = ' '.join(fill(e['Value'], ps.get(e['Key'])) for e in r.get('EnhanceSkillDesc') or [])
        enh.append([rid, d])
    sc = lambda x: [kv['Value'] for kv in sorted(x.get('ScoreLevelRule') or [], key=lambda kv: kv['Key']) if kv['Key'] > 0]
    st = {'c': p['CycleId'], 'n': clean(T(p.get('CycleName'))) or f'{season.get("SeasonTag", "")} 단계{i + 1}', 'v': v,
          's': (vinfo.get(v) or {}).get('s'), 'e': (vinfo.get(v) or {}).get('e'),
          'crisis': [kv['Key'] for kv in p.get('SpecialUpRoleIds') or []], 'enh': enh,
          'buffs': [[clean(T(buffs[b]['Name'])), fill(buffs[b]['Desc'], buffs[b].get('DescParam'))] for b in lv[0].get('NewTowerBuffs') or [] if b in buffs],
          'stab': {'teams': lv[0].get('TeamLimit') or 3, 'sc': sc(lv[0]), 'rounds': rounds(lv[0]['Id'])}}
    if 1 in lv:
        st['sing'] = {'sc': sc(lv[1]), 'rounds': rounds(lv[1]['Id'])}
    stages.append(st)

help_txt = T('HelpText_530_Content')
cond = re.search(r'『이벤트 조건』\s*(.+?)\n', help_txt)
out = {'season': {'id': season['Id'], 'n': clean(T(season['Name'])), 'tag': season.get('SeasonTag', ''),
                  'from': season.get('StartVersionId', ''), 'to': season.get('EndVersionId', '')},
       'stages': stages, 'cond': clean(cond.group(1)) if cond else ''}
path = os.path.join(R, 'public/matrix.json')
new = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
try:
    if open(path, encoding='utf-8').read() == new:
        print('종말 매트릭스: 변경 없음'); raise SystemExit
except FileNotFoundError:
    pass
open(path, 'w', encoding='utf-8').write(new)
print(f"종말 매트릭스 저장: {out['season']['n']}({out['season']['tag']}) · 단계 {[s['n'] + ' ' + s['v'] for s in stages]} · {len(new):,} bytes")
