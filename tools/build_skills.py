#!/usr/bin/env python3
"""
띵조 AUTO TEAM MAKER — 공명자 스킬 설명 만들기

게임 데이터(Arikatsu/WutheringWaves_Data)의 스킬 설명(한국어)을 읽어
공명자 가이드 화면에서 쓰는 public/skills/<rid>.json을 만듭니다(그 공명자 화면을 열 때만 받아 옴).

  [ [종류, 이름, [[소제목, 본문], ...]], ... ]
  종류: n 일반 공격 · s 공명 스킬 · f 공명 회로 · l 공명 해방 · i 변주 스킬 · o 반주 스킬 · p 고유 스킬
  본문의 ⟦…⟧ 는 강조(키워드 · 속성 피해)

  python tools/build_skills.py <게임데이터 폴더> public/skills
"""
import argparse, json, os, re

ap = argparse.ArgumentParser()
ap.add_argument('data'); ap.add_argument('out')
args = ap.parse_args()


def load(p):
    return json.load(open(os.path.join(args.data, p), encoding='utf-8'))


tm = {x['Id']: x['Content'] for x in load('Textmaps/ko/multi_text/MultiText.json')}
T = lambda k: tm.get(k, '') if k else ''
KIND = {1: 'n', 2: 's', 3: 'l', 4: 'p', 5: 'i', 6: 'f', 11: 'o'}
ORDER = {'n': 0, 's': 1, 'f': 2, 'l': 3, 'i': 4, 'o': 5, 'p': 6}


def fill(s, nums):
    return re.sub(r'\{(\d+)\}', lambda m: str(nums[int(m.group(1))]) if int(m.group(1)) < len(nums) else '', s)


def sections(raw, nums):
    s = fill(raw or '', nums).replace('\r', '')
    # 소제목: <size=40><color=Title>강공격</color></size>
    s = re.sub(r'<size=\d+><color=Title>(.*?)</color></size>', lambda m: '\n§' + re.sub(r'<[^>]+>', '', m.group(1)).strip() + '\n', s)
    s = re.sub(r'<size=\d+>\s*</size>', '\n', s)
    # 강조: <color=Highlight>…</color>, <color=Wind>기류 피해</color> 등
    s = re.sub(r'<color=(?!Title)[A-Za-z]+>(.*?)</color>', lambda m: '⟦' + re.sub(r'<[^>]+>', '', m.group(1)) + '⟧', s, flags=re.S)
    s = re.sub(r'<[^>]+>', '', s)
    out, cur = [], ['', []]
    for line in s.split('\n'):
        line = re.sub(r'[ \t]+', ' ', line).strip()
        if line.startswith('§'):
            if cur[0] or cur[1]:
                out.append(cur)
            cur = [line[1:].strip(), []]
        elif line:
            cur[1].append(line)
    if cur[0] or cur[1]:
        out.append(cur)
    return [[h, '\n'.join(b)] for h, b in out if h or b]


roles = [r for r in load('BinData/role/roleinfo.json') if r.get('RoleType') == 1 and not r.get('IsTrial') and r.get('QualityId', 0) >= 4]
by_group = {}
for sk in load('BinData/skill/skill.json'):
    by_group.setdefault(sk.get('SkillGroupId'), []).append(sk)

res = {}
for r in roles:
    rows = []
    for sk in sorted(by_group.get(r.get('SkillId'), []), key=lambda x: (x.get('SortIndex', 0), x['Id'])):
        k = KIND.get(sk.get('SkillType'))
        name = T(sk.get('SkillName')).strip()
        if not k or not name:
            continue
        sec = sections(T(sk.get('MultiSkillDescribe') or sk.get('SkillDescribe')), sk.get('MultiSkillDetailNum') or sk.get('SkillDetailNum') or [])
        if not sec:
            continue
        rows.append([k, name, sec])
    rows.sort(key=lambda x: ORDER.get(x[0], 9))
    if rows:
        res[str(r['Id'])] = rows

os.makedirs(args.out, exist_ok=True)
changed = 0
for rid, rows in res.items():
    f = os.path.join(args.out, f'{rid}.json')
    new = json.dumps(rows, ensure_ascii=False, separators=(',', ':'))
    try:
        if open(f, encoding='utf-8').read() == new:
            continue
    except Exception:
        pass
    open(f, 'w', encoding='utf-8').write(new)
    changed += 1
print(f'스킬 설명: 공명자 {len(res)}명 · 바뀐 파일 {changed}개')
