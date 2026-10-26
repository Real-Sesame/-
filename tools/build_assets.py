#!/usr/bin/env python3
"""
띵조 AUTO TEAM MAKER — 캐릭터 일러스트 이미지 만들기

게임 데이터(Arikatsu/WutheringWaves_Data)에서 공명자별 그림 경로를 읽고,
게임 UI 리소스 저장소(555me/Wuthering-Waves-GameAssets)에서 필요한 파일만 받아
사이트에서 쓰는 작은 WebP로 줄여 assets/ 폴더에 저장합니다. 이미 있는 그림은 건너뜁니다.

  public/assets/card/{rid}.webp  캐릭터 카드(반신)            348×480
  public/assets/full/{rid}.webp  캐릭터 전신(투명 배경)        높이 900
  public/assets/bg/{rid}.webp    픽업 배너 배경               1600×720
  public/assets/art.json         어떤 그림이 있는지 목록

  python tools/build_assets.py <게임데이터 폴더> <저장소 폴더> [--force]
"""
import argparse, json, os, re, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument('data'); ap.add_argument('repo')
ap.add_argument('--force', action='store_true')
ap.add_argument('--assets-repo', default='https://github.com/555me/Wuthering-Waves-GameAssets.git')
ap.add_argument('--cache', default='.asset-cache')
args = ap.parse_args()
OUT = os.path.join(args.repo, 'public', 'assets') if os.path.isdir(os.path.join(args.repo, 'public')) else os.path.join(args.repo, 'assets')
SPEC = {'card': ((348, 480), 76), 'full': ((900, 900), 78), 'bg': ((1600, 720), 62)}


def load(p):
    return json.load(open(os.path.join(args.data, p), encoding='utf-8'))


def rel(game_path):
    """/Game/Aki/UI/UIResources/.../T_X.T_X → UI/UIResources/.../T_X.png"""
    if not game_path or not game_path.startswith('/Game/'):
        return None
    p = game_path.split('.')[0]
    return re.sub(r'^/Game/Aki/', '', p) + '.png'


roles = [r for r in load('BinData/role/roleinfo.json') if r.get('RoleType') == 1 and not r.get('IsTrial') and r.get('QualityId', 0) >= 4]
want = {}  # (kind, rid) -> 게임 경로(소문자 비교용)
for r in roles:
    rid = r['Id']
    if rel(r.get('FormationRoleCard')):
        want[('card', rid)] = rel(r['FormationRoleCard'])
    if rel(r.get('RolePortrait')):
        want[('full', rid)] = rel(r['RolePortrait'])
# 픽업 배너 배경: 캐릭터 이벤트 튜닝(Type 2) 중 그 캐릭터가 대표인 가장 최근 배너
try:
    views = sorted(load('BinData/gacha/gachaviewinfo.json'), key=lambda v: v['Id'])
    for v in views:
        if v.get('Type') == 2 and v.get('ShowIdList') and rel(v.get('UnderBgTexturePath')):
            want[('bg', v['ShowIdList'][0])] = rel(v['UnderBgTexturePath'])
except Exception as e:
    print('배너 정보 없음', e, file=sys.stderr)

todo = {k: p for k, p in want.items() if args.force or not os.path.exists(os.path.join(OUT, k[0], f'{k[1]}.webp'))}
print(f'그림 후보 {len(want)}개 · 새로 만들 것 {len(todo)}개')

if todo:
    cache = args.cache
    if not os.path.isdir(os.path.join(cache, '.git')):
        subprocess.run(['git', 'clone', '-q', '--depth', '1', '--filter=blob:none', '--no-checkout', args.assets_repo, cache], check=True)
    files = subprocess.run(['git', '-C', cache, 'ls-tree', '-r', '--name-only', 'HEAD'], check=True, capture_output=True, text=True).stdout.split('\n')
    by_lower = {f.lower(): f for f in files if f}
    real = {k: by_lower.get(p.lower()) for k, p in todo.items()}
    miss = [k for k, v in real.items() if not v]
    if miss:
        print(f'  저장소에 없는 그림 {len(miss)}개 (건너뜀)')
    paths = sorted({'/' + v for v in real.values() if v})
    if paths:
        subprocess.run(['git', '-C', cache, 'sparse-checkout', 'init', '--no-cone'], check=False, capture_output=True)
        subprocess.run(['git', '-C', cache, 'sparse-checkout', 'set', '--no-cone', '--stdin'], input='\n'.join(paths), text=True, check=True)
        subprocess.run(['git', '-C', cache, 'checkout', '-q', 'HEAD'], check=True)
    from PIL import Image
    made = 0
    for (kind, rid), src in real.items():
        if not src:
            continue
        try:
            im = Image.open(os.path.join(cache, src)).convert('RGBA')
            (w, h), q = SPEC[kind]
            if kind == 'bg':
                # 가운데를 기준으로 2.22:1로 자른 뒤 줄임
                r0 = im.width / im.height; r1 = w / h
                if r0 > r1:
                    nw = int(im.height * r1); x = (im.width - nw) // 2; im = im.crop((x, 0, x + nw, im.height))
                im = im.convert('RGB').resize((w, h), Image.LANCZOS)
            else:
                bb = im.getbbox()  # 투명 여백 잘라내기
                if bb:
                    im = im.crop(bb)
                im.thumbnail((w, h), Image.LANCZOS)
            os.makedirs(os.path.join(OUT, kind), exist_ok=True)
            im.save(os.path.join(OUT, kind, f'{rid}.webp'), 'WEBP', quality=q, method=6)
            made += 1
        except Exception as e:
            print('  실패', kind, rid, src, e, file=sys.stderr)
    print(f'새 그림 {made}개 저장')

# 링크 미리보기(카톡 · 디스코드 등) 그림: 배너 배경 + 전신 그림을 800×420 JPG로
def make_og(rid, dst):
    from PIL import Image, ImageDraw
    W, H = 800, 420
    bgp = os.path.join(OUT, 'bg', f'{rid}.webp'); fp = os.path.join(OUT, 'full', f'{rid}.webp')
    if not os.path.exists(fp):
        return False
    if os.path.exists(bgp):
        base = Image.open(bgp).convert('RGB'); k = max(W / base.width, H / base.height)
        base = base.resize((round(base.width * k), round(base.height * k)), Image.LANCZOS)
        x0, y0 = (base.width - W) // 2, (base.height - H) // 2
        canvas = base.crop((x0, y0, x0 + W, y0 + H))
    else:
        canvas = Image.new('RGB', (W, H), (20, 20, 19))
    # 왼쪽을 어둡게(글자 자리)
    shade = Image.new('L', (W, H)); d = ImageDraw.Draw(shade)
    for x in range(W):
        d.line([(x, 0), (x, H)], fill=int(170 * max(0, 1 - x / (W * 0.75))))
    canvas.paste(Image.new('RGB', (W, H), (10, 10, 9)), (0, 0), shade)
    full = Image.open(fp).convert('RGBA'); full.thumbnail((int(W * 0.62), int(H * 1.05)), Image.LANCZOS)
    canvas.paste(full, (W - full.width - 24, H - full.height), full)
    # 금색 테두리 선
    ImageDraw.Draw(canvas).rectangle([0, H - 6, W, H], fill=(230, 193, 90))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    canvas.save(dst, 'JPEG', quality=80, optimize=True, progressive=True)
    return True


try:
    og_made = 0
    for f in sorted(os.listdir(os.path.join(OUT, 'full'))) if os.path.isdir(os.path.join(OUT, 'full')) else []:
        rid = int(f[:-5]); dst = os.path.join(OUT, 'og', f'{rid}.jpg')
        if args.force or not os.path.exists(dst):
            og_made += make_og(rid, dst)
    # 사이트 대표 그림: 가장 최근 픽업 배너의 캐릭터
    latest = max([v['Id'] for v in views if v.get('Type') == 2 and v.get('ShowIdList')] or [0])
    lrid = next((v['ShowIdList'][0] for v in views if v['Id'] == latest), None)
    site = os.path.join(OUT, 'og', 'site.jpg'); mark = os.path.join(OUT, 'og', 'site.txt')
    if lrid and (args.force or not os.path.exists(site) or open(mark).read().strip() != str(lrid) if os.path.exists(mark) else True):
        if make_og(lrid, site):
            open(mark, 'w').write(str(lrid)); og_made += 1
    print(f'미리보기 그림 {og_made}개 저장')
except Exception as e:
    print('미리보기 그림 생략:', e, file=sys.stderr)

art = {}
for kind in SPEC:
    d = os.path.join(OUT, kind)
    art[kind] = sorted(int(f[:-5]) for f in os.listdir(d) if f.endswith('.webp')) if os.path.isdir(d) else []
old = None
try:
    old = json.load(open(os.path.join(OUT, 'art.json'), encoding='utf-8'))
except Exception:
    pass
if old != art:
    os.makedirs(OUT, exist_ok=True)
    json.dump(art, open(os.path.join(OUT, 'art.json'), 'w', encoding='utf-8'), separators=(',', ':'))
print('목록:', {k: len(v) for k, v in art.items()})
