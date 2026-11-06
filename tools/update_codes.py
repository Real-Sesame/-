#!/usr/bin/env python3
"""
띵조 AUTO TEAM MAKER — 명조 리딤 코드 모으기

명조 리딤 코드는 게임 안(설정 → 기타 설정 → 계정 → 리딤 코드)에서만 입력할 수 있고 공식 웹 입력 페이지가 없습니다.
그래서 여러 공략 사이트의 코드 목록을 모아 「지금 쓸 수 있는 코드」와 「만료된 코드」를 정리하고,
사이트의 리딤 코드 화면은 이 파일을 읽어 복사 · 사용함 표시 · (앱에서는) 복사 후 게임 열기를 제공합니다.

규칙
- 어느 사이트든 「사용 가능」 목록에 있고, 어느 사이트의 「만료」 목록에도 없으면 사용 가능.
- 전에 사용 가능이던 코드가 읽어 온 모든 사이트의 사용 가능 목록에서 빠지면 만료로 옮김(사이트를 하나도 못 읽으면 그대로 둠).
- tools/codes-manual.json으로 직접 추가 · 수정할 수 있음(보상 · 만료일 · 메모 · 만료 처리). 직접 넣은 코드는 사이트에 없어도 유지.
- 보상 이름은 tools/item-names-ko.json(게임 데이터의 영어 → 한국어 아이템 이름)으로 한국어로 바꿈.

결과: public/codes.json  {updated, sources, active: [{c, r, a 처음 확인, e 만료일, n 메모}], expired: [{c, x 만료 확인}]}

  python tools/update_codes.py [저장소 폴더]
"""
import html, json, os, re, sys, urllib.request
from datetime import datetime, timezone, timedelta
from html.parser import HTMLParser

R = sys.argv[1] if len(sys.argv) > 1 else '.'
OUT = os.path.join(R, 'public/codes.json')
KST = timezone(timedelta(hours=9))
TODAY = datetime.now(KST).strftime('%Y-%m-%d')
SOURCES = [
    ('Pocket Tactics', 'https://www.pockettactics.com/wuthering-waves/codes'),
    ('Mobile Matters', 'https://mobilematters.gg/guides/redeem-codes/wuthering-waves-new-codes'),
    ('Timesaver', 'https://timesaver.gg/blog/wuthering-waves-codes'),
    ('All Things How', 'https://allthings.how/wuthering-waves-codes/'),
]
CODE = re.compile(r'^[A-Z0-9]{6,24}$')
NOT_CODE = {'ASTRITE', 'ASTRITES', 'REWARDS', 'REWARD', 'EXPIRED', 'ACTIVE', 'UPDATE', 'UPDATED', 'WUTHERING', 'WAVES', 'CODES', 'CODE',
            'REDEEM', 'NOVEMBER', 'OCTOBER', 'DECEMBER', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER',
            'GLOBAL', 'SERVER', 'CREDITS', 'SHELL', 'KUROGAMES', 'ANDROID', 'PLAYSTATION'}
BLOCK = {'p', 'li', 'tr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'section', 'ul', 'ol', 'table', 'br', 'article', 'header', 'td', 'th'}


class Lines(HTMLParser):
    """HTML을 블록 단위 줄로. 표 칸은 ' | '로 잇고, <strong>/<code>/<b> 안의 글자는 따로 모아 둠(코드 후보)."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lines, self.cur, self.skip, self.emph, self.em_txt, self.heads, self.tag = [], [], 0, 0, set(), [], []

    def flush(self):
        t = re.sub(r'\s+', ' ', ''.join(self.cur)).strip()
        if t:
            self.lines.append((t, self.tag[-1] if self.tag else ''))
        self.cur = []

    def handle_starttag(self, tag, a):
        if tag in ('script', 'style', 'noscript', 'svg', 'nav', 'footer', 'aside'):
            self.skip += 1
        elif tag in ('td', 'th'):
            self.cur.append(' | ')
        elif tag in BLOCK:
            self.flush()
        if tag in ('strong', 'b', 'code', 'kbd', 'mark'):
            self.emph += 1; self.etxt = []
        self.tag.append(tag)

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript', 'svg', 'nav', 'footer', 'aside'):
            self.skip = max(0, self.skip - 1)
        if tag in ('strong', 'b', 'code', 'kbd', 'mark') and self.emph:
            self.emph -= 1
            w = ''.join(getattr(self, 'etxt', [])).strip()
            if CODE.match(w):
                self.em_txt.add(w)
        if tag in BLOCK and tag not in ('td', 'th'):
            self.flush()
        if self.tag:
            self.tag.pop()

    def handle_data(self, d):
        if self.skip:
            return
        self.cur.append(d)
        if self.emph:
            self.etxt.append(d)


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; ddingjo-atm-codes/1.0; +https://real-sesame.github.io/-/)', 'Accept-Language': 'en'})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode('utf-8', 'replace')


def is_code(w, em):
    return bool(CODE.match(w)) and re.search(r'[A-Z]', w) and w not in NOT_CODE and (w in em or re.search(r'\d', w) or len(w) >= 7)


def parse(page):
    p = Lines(); p.feed(page); p.flush()
    lines = [t for t, _ in p.lines]
    # 「사용 가능」 구간: 'active/working/new/valid … codes' 제목부터 'expired/inactive' 제목 전까지
    a0 = next((i for i, t in enumerate(lines) if len(t) < 120 and re.search(r'\b(active|working|valid|new|latest|all)\b.*\bcodes?\b', t, re.I) and not re.search(r'expired|inactive', t, re.I)), None)
    x0 = next((i for i, t in enumerate(lines) if (a0 is None or i > a0) and len(t) < 120 and re.search(r'\b(expired|inactive|no longer)\b', t, re.I)), None)
    if a0 is None or x0 is None:
        return None
    act, exp = {}, set()
    for t in lines[a0 + 1:x0]:
        m = re.match(r'^\s*\|?\s*([A-Z0-9]{6,24})\s*(?:\||[-–—:(]|$)\s*(.*)$', t)
        if m and is_code(m.group(1), p.em_txt):
            rest = m.group(2)
            if '|' in t:  # 표: 코드 바로 다음 칸만 보상으로(종류 · 상태 칸은 버림)
                cells = [c.strip() for c in t.split('|') if c.strip()]
                rest = cells[cells.index(m.group(1)) + 1] if m.group(1) in cells and cells.index(m.group(1)) + 1 < len(cells) else ''
            act[m.group(1)] = rest.strip(' )|') or act.get(m.group(1), '')
    for t in lines[x0 + 1:x0 + 400]:
        if re.search(r'\bhow (to|do)\b|\bredeem\b.*\bcodes?\b', t, re.I) and len(t) < 100 and exp:
            break
        for w in re.findall(r'\b[A-Z0-9]{6,24}\b', t):
            if is_code(w, p.em_txt) and w not in act:
                exp.add(w)
    return act, exp


ITEMS = json.load(open(os.path.join(R, 'tools/item-names-ko.json'), encoding='utf-8'))
ITEMS_L = {k.lower(): re.sub(r'\s+', ' ', v) for k, v in ITEMS.items()}
NUMW = {w: i for i, w in enumerate('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty'.split())}
NUMW.update({'a': 1, 'an': 1, 'thirty': 30, 'forty': 40, 'fifty': 50})


def item_ko(name):
    n = re.sub(r'\s+', ' ', name.strip(' .')).lower()
    def sing(w):
        if w.endswith('ies'):
            return w[:-3] + 'y'
        if re.search(r'(ch|sh|ss|x)es$', w):
            return w[:-2]
        return w[:-1] if w.endswith('s') and not w.endswith('ss') else w
    for c in (n, ' '.join(sing(w) for w in n.split()), re.sub(r's$', '', n)):
        if c in ITEMS_L:
            return ITEMS_L[c]
    if re.match(r'shell credits?$', n):
        return ITEMS.get('Shell Credit')
    return None


def num(t):
    t = t.lower().replace(',', '')
    if t in NUMW:
        return NUMW[t]
    m = re.match(r'^(\d+(?:\.\d+)?)(k?)$', t)
    return int(float(m.group(1)) * (1000 if m.group(2) else 1)) if m else None


def ko_reward(s):
    """'50 Astrite, 2 Premium Resonance Potions …' → '별의 소리 ×50 · 특급 공명 촉진제 ×2 …' (모르는 이름은 영어 그대로)"""
    if not s:
        return ''
    out = []
    for part in re.split(r',(?!\d{3}\b)|\band\b|;|\+', re.sub(r'\([^)]*\)?', '', html.unescape(s))):
        part = part.strip(' .')
        if not part:
            continue
        m = re.match(r'^(?:x\s*)?([\d,.]+k?|[a-z]+)\s*x?\s+(.+)$', part, re.I)
        n = num(m.group(1)) if m else None
        name = m.group(2) if m and n is not None else part
        if n is None:
            m2 = re.match(r'^(.+?)\s*[x×]\s*([\d,]+)$', part, re.I)
            if m2:
                name, n = m2.group(1), num(m2.group(2))
        ko = item_ko(name)
        out.append(f"{ko or name.strip()}{f' ×{n:,}' if n else ''}")
    return ' · '.join(out)[:200]


try:
    old = json.load(open(OUT, encoding='utf-8'))
except Exception:
    old = {'active': [], 'expired': []}
try:
    manual = json.load(open(os.path.join(R, 'tools/codes-manual.json'), encoding='utf-8'))
    manual = {k: v for k, v in manual.items() if not k.startswith('_')}
except Exception:
    manual = {}

act, exp, ok = {}, set(), []
for name, url in SOURCES:
    try:
        r = parse(fetch(url))
    except Exception as e:
        print(f'{name}: 못 읽음 ({e.__class__.__name__})'); continue
    if not r or not r[0]:
        print(f'{name}: 코드 목록 모양을 못 찾음'); continue
    a, x = r
    ok.append(name)
    print(f'{name}: 사용 가능 {sorted(a)} · 만료 {len(x)}개')
    for c, rw in a.items():
        if c not in act or (rw and len(rw) > len(act[c])):
            act[c] = rw
    exp |= x

prev = {x['c']: x for x in old.get('active', [])}
expired = {x['c']: x for x in old.get('expired', [])}
active = {}
if ok:
    for c, rw in act.items():
        if c in exp:
            continue
        p = prev.get(c) or {}
        active[c] = {'c': c, 'r': ko_reward(rw) or p.get('r', ''), 'a': p.get('a') or TODAY}
    for c, p in prev.items():
        if c not in active and c not in manual:
            expired.setdefault(c, {'c': c, 'x': TODAY})
    for c in exp:
        if c not in active:
            expired.setdefault(c, {'c': c, 'x': (prev.get(c) and TODAY) or ''})
else:
    active = {c: dict(p) for c, p in prev.items()}

for c, m in manual.items():
    c = c.strip().upper()
    if m.get('expired') or (m.get('e') and m['e'] < TODAY):
        active.pop(c, None); expired.setdefault(c, {'c': c, 'x': m.get('e') or TODAY}); continue
    a = active.get(c) or {'c': c, 'a': (prev.get(c) or {}).get('a') or TODAY}
    for k in ('r', 'e', 'n'):
        if m.get(k):
            a[k] = m[k]
    active[c] = a; expired.pop(c, None)
for c in active:
    expired.pop(c, None)

res = {'updated': (old.get('updated') if ok == [] else datetime.now(KST).isoformat(timespec='minutes')),
       'sources': ok or old.get('sources', []),
       'active': sorted(active.values(), key=lambda x: (x.get('a') or '', x['c']), reverse=True),
       'expired': sorted(expired.values(), key=lambda x: (x.get('x') or '', x['c']), reverse=True)[:120]}
cmp = lambda d: json.dumps({k: v for k, v in d.items() if k != 'updated'}, ensure_ascii=False, sort_keys=True)
if cmp(res) == cmp(old):
    print('리딤 코드: 변경 없음'); sys.exit(0)
json.dump(res, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f"리딤 코드 저장: 사용 가능 {[x['c'] for x in res['active']]} · 만료 {len(res['expired'])}개 · 출처 {ok}")
