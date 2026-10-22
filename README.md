# 띵조 AUTO TEAM MAKER

명조(Wuthering Waves) 역경의 탑 · 필드 파티 자동 편성과 1사이클 예상 피해 계산기입니다.

## GitHub Pages로 올리기 (무료 주소)

1. GitHub에 로그인 → 오른쪽 위 **+ → New repository**.
   - 이름 예: `ddingjo` → 주소는 `https://아이디.github.io/ddingjo/`
   - 이름을 `아이디.github.io`로 하면 주소는 `https://아이디.github.io/`
   - **Public** 선택 → **Create repository**
2. 저장소 화면에서 **Add file → Upload files** → 이 폴더의 `Index.html`, `404.html`, `.nojekyll`, `README.md`를 끌어다 놓고 **Commit changes**.
   - `.nojekyll`은 숨김 파일이라 안 보이면 없어도 동작합니다.
3. **Settings → Pages** → Source: **Deploy from a branch**, Branch: **main** / **(root)** → **Save**.
4. 1~2분 뒤 위 주소로 접속합니다. 첫 화면은 `404.html`이 `Index.html`로 자동 이동시킵니다.

## 업데이트할 때

- 새 `Index.html`을 같은 방법(Upload files)으로 올려 덮어쓰면 됩니다. 파일 이름은 반드시 `Index.html`(대문자 I) 그대로 두세요.
- 관리자 키로 인증하면 **패치 노트** 탭에서 패치 노트를 고친 뒤 **반영된 Index.html 내려받기**로 새 파일을 받을 수 있습니다. 그 파일을 올리면 모두에게 반영됩니다.

## 신규 공명자 자동 추가 (Ver. 1.0.09~)

- `.github/workflows/update-chars.yml`과 `tools/update_chars.py`가 저장소에 있으면, GitHub Actions가 매일 한 번 명조 게임 데이터를 확인해 앱에 없는 공명자가 생겼을 때 `chars-extra.json`을 자동으로 갱신 · 커밋합니다.
- 사이트는 열릴 때 `chars-extra.json`을 읽어 새 공명자를 보유 캐릭터 · 뽑기 추천 · 육성 계산 · 도감에 추가합니다(역할 · 버프는 추정치, "자동 추가 · 추정" 표시).
- 바로 돌려 보려면 **Actions → 신규 공명자 자동 갱신 → Run workflow**.
- `Index.html`이나 `tools/update_chars.py`를 새로 올리면 그때도 자동으로 한 번 돌아, 새 `Index.html`에 이미 들어간 공명자는 `chars-extra.json`에서 빠집니다.
- 필요한 권한(커밋 · 사이트 재배포 · 예약 유지)은 워크플로 파일이 직접 받으므로 저장소 설정을 따로 바꿀 필요가 없습니다.
- 갱신 커밋 뒤에는 사이트(GitHub Pages) 재배포를 자동으로 요청합니다.
- GitHub는 60일 동안 변경이 없는 저장소의 예약 실행을 멈추지만, 이 워크플로가 매번 스스로를 다시 켜 두므로 따로 손댈 필요가 없습니다.
- 실행이 실패하면 GitHub가 저장소 주인 이메일로 알려 줍니다.
- `update-chars.yml`은 꼭 `.github/workflows/` 안에 있어야 합니다. 저장소 맨 위에 있으면 실행되지 않습니다(`update_chars.py`는 맨 위나 `tools/` 어디든 됩니다).
- `.github` 폴더는 웹 업로드 화면에서 숨김 폴더라 끌어다 놓기가 안 될 수 있습니다. 그럴 땐 **Add file → Create new file**에 이름을 `.github/workflows/update-chars.yml`로 적고 내용을 붙여 넣으면 됩니다.

## 이벤트 · 픽업 일정 자동 갱신 (Ver. 1.0.13~)

- `.github/workflows/update-events.yml`과 `tools/update_events.py`가 3시간마다 명조 공식 홈페이지 공지(픽업 공지 · 패치 노트 · 이벤트 예고)를 읽어 `events.json`을 갱신 · 커밋합니다.
- 사이트의 **이벤트 일정** 탭이 이 파일을 읽어 진행 중 · 예정 픽업, 이벤트, 역경의 탑 시즌을 목록 · 달력으로 보여 줍니다.
- 한국어 공지를 읽지 못하면 영어 공지로 대신합니다. 공지 형식이 크게 바뀌면 일부 일정이 빠질 수 있습니다.
- 바로 돌려 보려면 **Actions → 이벤트 · 픽업 일정 자동 갱신 → Run workflow**.

## 참고

- 사용자 설정(보유 캐릭터, 파티, 라이선스 인증)은 각자 브라우저에만 저장됩니다.
- 역경의 탑 정보는 게임 데이터 저장소(Arikatsu/WutheringWaves_Data)에서 자동으로 갱신됩니다.
- 라이선스 확인은 브라우저 안에서만 하는 이용 구분용 잠금입니다(보안 장치 아님).
