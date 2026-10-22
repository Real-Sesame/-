#!/usr/bin/env python3
"""
띵조 AUTO TEAM MAKER — 명조 이벤트 · 픽업(이벤트 획득) 일정 자동 수집

명조 공식 홈페이지 공지(한국어, 없으면 영어)를 읽어
  · 픽업 공지: [배너 이름] … 5성 공명자/무기 … ✦기간✦ 시작 - 종료
  · 패치 노트 · 이벤트 예고: [이벤트 이름] … ✦기간: 시작 - 종료
  · 업데이트 점검 시간(버전 시작 시각)
을 뽑아 events.json으로 저장합니다. 사이트(Index.html)는 열릴 때 이 파일을 읽어 "이벤트 일정" 탭에 보여 줍니다.

  python tools/update_events.py <게임데이터 폴더> <출력 events.json> [--from-dir 기사폴더] [--lang ko,en]

· 공식 공지의 "서버 시간"은 아시아 서버(UTC+8) 기준으로 저장합니다(한국 시간 = +1시간).
· 픽업 캐릭터 · 무기 이름은 게임 데이터(한국어 · 영어 텍스트)와 맞춰 공명자 번호 · 무기 번호로 바꿉니다.
"""
import argparse, datetime as dt, glob, html, json, os, re, sys, time, urllib.request

BASE = 'https://hw-media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/{lang}'
NEWS = 'https://wutheringwaves.kurogames.com/{lang}/main/news/detail/{id}'
KEEP_DAYS = 150          # 이 기간 안에 올라온 공지만 읽음
PAST_DAYS = 40           # 끝난 일정은 이만큼만 남김
UA = {'User-Agent': 'Mozilla/5.0 (ddingjo-atm events bot; +https://github.com/Real-Sesame/-)', 'Accept': 'application/json'}

ap = argparse.ArgumentParser()
ap.add_argument('data'); ap.add_argument('out')
ap.add_argument('--from-dir', default='', help='테스트용: 내려받아 둔 기사 JSON 폴더')
ap.add_argument('--lang', default='ko,en')
ap.add_argument('--now', default='', help='테스트용 기준 시각 (YYYY-MM-DD)')
args = ap.parse_args()
NOW = dt.datetime.fromisoformat(args.now).replace(tzinfo=dt.timezone.utc) if args.now else dt.datetime.now(dt.timezone.utc)


# ---------------------------------------------------------------- 게임 데이터: 이름 → 번호
def load(p):
    return json.load(open(os.path.join(args.data, p), encoding='utf-8'))


def textmap(lang):
    try:
        return {x['Id']: x['Content'] for x in load(f'Textmaps/{lang}/multi_text/MultiText.json')}
    except Exception:
        return {}


TM = {'ko': textmap('ko'), 'en': textmap('en')}
norm = lambda s: re.sub(r'[\s·・\-\'’:：「」『』“”"()（）]', '', (s or '')).lower()
ENT = {}      # 정규화 이름 → (kind, id, quality)
KO_NAME = {}  # (kind, id) → 한국어 이름
for r in load('BinData/role/roleinfo.json'):
    if r.get('RoleType') != 1 or r.get('IsTrial'):
        continue
    for lang in ('ko', 'en'):
        n = TM[lang].get(r['Name'], '')
        if len(norm(n)) >= 2 and not norm(n).startswith(('방랑자', 'rover')):
            ENT.setdefault(norm(n), ('char', r['Id'], r['QualityId']))
    KO_NAME[('char', r['Id'])] = TM['ko'].get(r['Name'], '')
for w in load('BinData/weapon/weaponconf.json'):
    if w.get('QualityId', 0) < 4:
        continue
    for lang in ('ko', 'en'):
        n = TM[lang].get(w.get('WeaponName'), '')
        if len(norm(n)) >= 3:
            ENT.setdefault(norm(n), ('weapon', w['ItemId'], w['QualityId']))
    KO_NAME[('weapon', w['ItemId'])] = TM['ko'].get(w.get('WeaponName'), '')
ENT_KEYS = sorted(ENT, key=len, reverse=True)
print(f'이름 사전: {len(ENT)}개 (한국어 텍스트 {len(TM["ko"]):,} · 영어 텍스트 {len(TM["en"]):,})')


def find_entities(text):
    """문장 안에 나오는 공명자 · 무기 이름을 긴 이름부터 찾아 (kind, id, q) 목록으로"""
    t = norm(text); out = []
    for k in ENT_KEYS:
        i = t.find(k)
        if i < 0:
            continue
        out.append((i, ENT[k])); t = t[:i] + '\0' * len(k) + t[i + len(k):]
    return [e for _, e in sorted(out)]


# ---------------------------------------------------------------- 공지 가져오기
def get_json(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode('utf-8'))


def fetch_articles(lang):
    base = BASE.format(lang=lang); t = int(time.time() * 1000)
    menu = get_json(f'{base}/ArticleMenu.json?t={t}')
    cut = NOW - dt.timedelta(days=KEEP_DAYS)
    ids = []
    for m in menu:
        st = m.get('startTime') or m.get('createTime') or ''
        try:
            when = dt.datetime.strptime(st[:19], '%Y-%m-%d %H:%M:%S').replace(tzinfo=dt.timezone.utc)
        except Exception:
            when = NOW
        if when >= cut and m.get('articleId'):
            ids.append(str(m['articleId']))
    arts = []
    for i in ids:
        try:
            arts.append(get_json(f'{base}/article/{i}.json?t={t}'))
        except Exception as e:
            print('  기사 실패', i, e, file=sys.stderr)
        time.sleep(0.15)
    return arts


def local_articles(d):
    return [json.load(open(f, encoding='utf-8')) for f in glob.glob(os.path.join(d, '*.json')) if re.match(r'^\d+\.json$', os.path.basename(f))]


# ---------------------------------------------------------------- 공지 해석
DATE = r'\d{4}[-./]\d{1,2}[-./]\d{1,2}\s+\d{1,2}:\d{2}'
VERSION_START = r'(?:Version\s*|버전\s*|Ver\.?\s*)?(?P<v>\d+\.\d+)\s*(?:버전\s*)?(?:[Uu]pdate|업데이트)(?:\s*(?:후|이후|after))?'
RANGE = re.compile(rf'(?:(?P<a>{DATE})|{VERSION_START})\s*(?:\(\s*(?:server time|서버 시간|UTC[+-]\d+)\s*\))?\s*[-~–—〜]\s*(?P<b>{DATE})(?P<tail>[^\n]{{0,30}})')
DUR = re.compile(r'(Duration|Event Period|Time|기간|일정|시간)', re.I)
MAINT = re.compile(r'(Maintenance Time|점검 시간|업데이트 시간|업데이트 점검)', re.I)
HEAD = re.compile(r'^\s*[\[【]([^\]】]{1,60})[\]】]\s*(.{0,70})$')
CONVENE = re.compile(r'(Convene|획득|소환|튜닝|기원|확률\s*UP)', re.I)


def lines_of(a):
    t = a.get('articleContent') or ''
    t = re.sub(r'<(br|/div|/p|/li|/h\d|/td|/tr|/span)[^>]*>', '\n', t, flags=re.I)
    t = html.unescape(re.sub(r'<[^>]+>', '', t)).replace('\xa0', ' ')
    return [l.strip() for l in t.split('\n') if l.strip()]


def tz_of(s):
    m = re.search(r'UTC\s*([+-])\s*(\d{1,2})', s)
    return (1 if m.group(1) == '+' else -1) * int(m.group(2)) if m else 8  # 서버 시간 = 아시아 서버 UTC+8


def iso(s, tz):
    s = re.sub(r'[./]', '-', s.strip())
    d = dt.datetime.strptime(re.sub(r'\s+', ' ', s), '%Y-%m-%d %H:%M')
    return d.replace(tzinfo=dt.timezone(dt.timedelta(hours=tz))).isoformat()


def parse_range(s):
    m = RANGE.search(s)
    if not m:
        return None
    tz = tz_of(s)
    return {'s': iso(m.group('a'), tz) if m.group('a') else None, 'sv': None if m.group('a') else m.group('v'), 'e': iso(m.group('b'), tz)}


items, versions = [], {}
VER_IN_TITLE = re.compile(r'(?:Version|버전|Ver\.?|V)\s*(\d+\.\d+)|(\d+\.\d+)\s*버전', re.I)


def handle(a):
    title = (a.get('articleTitle') or '').strip(); aid = str(a.get('articleId'))
    L = lines_of(a)
    vm = VER_IN_TITLE.search(title); tver = (vm.group(1) or vm.group(2)) if vm else None
    for i, line in enumerate(L):
        # 버전 업데이트 점검 → 버전 시작 시각
        if MAINT.search(line) and tver and re.search(r'(Update|업데이트|Patch|패치)', title, re.I):
            r = parse_range(line + ' ' + (L[i + 1] if i + 1 < len(L) else ''))
            if r and r['s']:
                versions.setdefault(tver, r['e'])
                items.append({'k': 'maint', 'n': f'{tver} 버전 업데이트 점검', 't': '점검', 's': r['s'], 'e': r['e'], 'a': aid})
            continue
        if not DUR.search(line):
            continue
        seg = line if re.search(r'\d{4}[-./]\d', line) else (line + ' ' + (L[i + 1] if i + 1 < len(L) else ''))
        if re.search(r'(Permanent|상시|영구)', seg, re.I):
            continue
        r = parse_range(seg)
        if not r:
            continue
        # 위쪽에서 [이름] 제목 줄 찾기
        hi = None
        for j in range(i - 1, max(-1, i - 12), -1):
            if HEAD.match(L[j]) and not L[j].startswith('✦'):
                hi = j; break
        if hi is not None:
            m = HEAD.match(L[hi]); name, kind_txt = m.group(1).strip(), m.group(2).strip(); block = ' '.join(L[hi:i])
            m2 = HEAD.match(kind_txt)  # [분류] [이벤트 이름] 종류  → 안쪽 이름 사용
            if m2:
                name, kind_txt = m2.group(1).strip(), m2.group(2).strip()
        else:
            m = re.search(r'[\[【]([^\]】]{1,60})[\]】]\s*([^,!|]{0,40})', title)
            if not m:
                continue
            name, kind_txt = m.group(1).strip(), m.group(2).strip(); block = title + ' ' + ' '.join(L[max(0, i - 6):i])
        ents = find_entities(block)
        head = name + ' ' + kind_txt
        is_conv = bool(CONVENE.search(head)) and bool(ents)
        if is_conv:
            five = [e for e in ents if e[2] == 5]; four = [e for e in ents if e[2] == 4]
            kind = 'weapon' if (re.search(r'(Weapon|무기)', head, re.I) or (five and five[0][0] == 'weapon')) else 'char'
            five = [e for e in five if e[0] == kind] or five
            four = [e for e in four if e[0] == kind]
            if not five:
                continue
            items.append({'k': kind, 'n': name, 't': kind_txt, **r, 'f5': [e[1] for e in five][:4], 'f4': [e[1] for e in four][:4], 'a': aid})
        else:
            if re.search(r'(Maintenance|점검)', head, re.I):
                continue
            items.append({'k': 'event', 'n': name, 't': re.sub(r',?\s*(Coming Soon|is now underway|곧 오픈|오픈 예정).*$', '', kind_txt, flags=re.I).strip(' ,!'), **r, 'a': aid})


langs = [l.strip() for l in args.lang.split(',') if l.strip()]
used, arts = None, []
if args.from_dir:
    arts = local_articles(args.from_dir); used = 'local'
else:
    for lang in langs:
        try:
            arts = fetch_articles(lang)
            print(f'공지 {len(arts)}개 ({lang})')
        except Exception as e:
            print(f'공지 목록 실패 ({lang}): {e}', file=sys.stderr); arts = []
        if arts:
            items.clear(); versions.clear()
            for a in sorted(arts, key=lambda a: int(a.get('articleId') or 0)):
                handle(a)
            if any(x['k'] in ('char', 'weapon') for x in items):
                used = lang; break
    if not used:
        print('공지를 읽지 못해 기존 events.json을 그대로 둡니다.'); sys.exit(0)
if used == 'local':
    for a in sorted(arts, key=lambda a: int(a.get('articleId') or 0)):
        handle(a)

# 버전 업데이트로 시작하는 일정에 시작 시각 채우기 · 정리
out, seen = [], {}
cut = NOW - dt.timedelta(days=PAST_DAYS)
for x in items:
    if not x.get('s') and x.get('sv') and x['sv'] in versions:
        x['s'] = versions[x['sv']]
    e = dt.datetime.fromisoformat(x['e'])
    if e < cut:
        continue
    if x.get('s') and dt.datetime.fromisoformat(x['s']) >= e:
        continue
    key = (x['k'], norm(x['n']), x['e'][:10])
    if key in seen:
        out[seen[key]] = {**out[seen[key]], **{k: v for k, v in x.items() if v}}
        continue
    seen[key] = len(out); out.append(x)
for x in out:
    if not x.get('sv'):
        x.pop('sv', None)
    x['url'] = NEWS.format(lang=used if used in ('ko', 'en') else 'ko', id=x['a'])
out.sort(key=lambda x: (x.get('s') or x['e'], x['k']))
names = {f'{k}:{i}': n for (k, i), n in KO_NAME.items() if n and any(i in (x.get('f5', []) + x.get('f4', [])) for x in out)}

doc = {'schema': 1, 'src': 'wutheringwaves.kurogames.com', 'lang': used, 'tz': 'UTC+8 (아시아 서버 기준)', 'versions': versions,
       'names': names, 'items': out,
       'stats': {'articles': len(arts), 'banners': sum(x['k'] in ('char', 'weapon') for x in out), 'events': sum(x['k'] == 'event' for x in out)}}
old = None
if os.path.exists(args.out):
    try:
        old = json.load(open(args.out, encoding='utf-8'))
    except Exception:
        old = None
strip = lambda d: {k: v for k, v in (d or {}).items() if k not in ('updated', 'stats')}
if old and strip(old) == strip(doc):
    print('변경 없음 — 파일을 그대로 둡니다.'); sys.exit(0)
doc['updated'] = NOW.strftime('%Y-%m-%dT%H:%M:%SZ')
with open(args.out, 'w', encoding='utf-8') as f:
    json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))
print(f'저장: {args.out} · 픽업 {doc["stats"]["banners"]} · 이벤트 {doc["stats"]["events"]} · 버전 {sorted(versions)} · {os.path.getsize(args.out):,} bytes')
