# 띵조 AUTO TEAM MAKER

명조(Wuthering Waves) 역경의 탑 · 필드 파티 자동 편성과 1사이클 예상 피해 계산기입니다.

## 구조 (Ver. 1.0.16~, Vite)

사이트는 [Vite](https://vitejs.dev/)로 만들어 GitHub Actions가 자동으로 배포합니다. `main`에 올리면 1~2분 뒤 `https://real-sesame.github.io/-/`에 반영됩니다.

```
index.html              화면 뼈대(메뉴 · 각 화면의 틀)
src/app.js              앱 코드 전체(계산 · 화면)
src/styles/app.css      디자인
src/data/*.json         게임 데이터(무기 · 에코 세트 · 육성 재료 · 공명 체인 …)와 패치 노트(patch-notes.json)
public/                 그대로 올라가는 파일
  img/                  캐릭터 · 무기 · 에코 세트 · 재료 아이콘
  assets/               캐릭터 카드 · 전신 · 픽업 배너 · 링크 미리보기(og) 그림 (자동 생성)
  skills/<rid>.json     공명자 스킬 설명 (자동 생성 · 그 공명자 화면을 열 때만 받아 옴)
  wastes.json           죽음의 노래와 바닷속 폐허 시즌 구성 (자동 생성 · 시즌 콘텐츠 화면에서 받아 옴)
  tower.json            역경의 탑 시즌 구성 · 한국어 텍스트 (자동 생성)
  echoes.json           공명자별 추천 메인 에코 (자동 생성, 아이콘은 assets/echo/)
  events.json           픽업 · 이벤트 일정 (자동 갱신)
  chars-extra.json      새 공명자 (자동 갱신)
  Index.html            예전 주소(Index.html#/…)를 새 주소로 넘겨 주는 페이지
server/                 로그인 · 설정 동기화 서버 (Cloudflare Workers + D1)
android/                안드로이드 앱(사이트를 여는 WebView 앱) 소스
tools/                  자동 갱신 스크립트
.github/workflows/      deploy.yml(배포) · update-chars.yml · update-events.yml
```

- 주소: 홈 `/-/`, 공명자 가이드 `/-/characters` · `/-/character/<id>`, 파티 편성 `/-/tools/<탭>`, 시즌 콘텐츠 `/-/season`, 에코 계산기 `/-/echo`, 자료실 `/-/links`, 공지사항 `/-/notice`. 예전 `Index.html#/…` · `#/…` 주소도 새 주소로 넘어갑니다.
- **Settings → Pages → Source**는 **GitHub Actions**여야 합니다(브랜치 배포가 아님). Custom domain은 비워 둡니다.
- 빌드할 때 화면 주소마다 페이지 파일(`characters.html`, `character/<id>.html`, `tools/<탭>.html` …)을 만들어 제목 · 설명 · 미리보기 그림(`public/assets/og/`)을 넣습니다. 하위 주소로 바로 들어와도 정상 페이지로 열리고, 카톡 등 링크 미리보기가 나옵니다.

## 고치고 올릴 때

- GitHub 웹에서 파일을 열어 연필(✏️) 버튼으로 고치고 **Commit changes** 하면 자동으로 다시 배포됩니다.
- 내 컴퓨터에서 미리 보려면 Node.js 설치 후 `npm install` → `npm run dev` (빌드 확인은 `npm run build` → `npm run preview`).
- 패치 노트: 저장소의 `src/data/patch-notes.json`을 고칩니다. 맨 위 버전이 사이트 버전이 됩니다.
- 자료실 목록은 `src/app.js`의 `LINKS`, 사이트 공지는 `NOTICES`를 고치면 됩니다.
- 자동 편성 보정: 공략 사이트 추천 파티는 `src/app.js`의 `COMMUNITY_TEAMS`, 티어는 `CHAR_TIER`(패치마다 갱신 권장). 추천 메인 에코는 `src/data/main-echo-picks.json`(게임 영어 이름)을 고치면 다음 자동 갱신 때 반영됩니다.
- 빌드하면 사이트 코드와 게임 데이터(`src/data`)가 따로 나뉘어, 코드만 바뀐 업데이트에서는 방문자 브라우저에 저장된 데이터 파일을 다시 받지 않습니다.
- 점검용: 주소 끝에 `?debug`를 붙여 열면 브라우저 콘솔에서 `ATM_DEBUG()`로 현재 상태를 볼 수 있습니다.

## 신규 공명자 자동 추가 (Ver. 1.0.09~)

- `.github/workflows/update-chars.yml`과 `tools/update_chars.py`가 저장소에 있으면, GitHub Actions가 매일 한 번 명조 게임 데이터를 확인해 앱에 없는 공명자가 생겼을 때 `public/chars-extra.json`과 캐릭터 그림(`public/assets`)을 자동으로 갱신 · 커밋하고 사이트를 다시 배포합니다.
- 같은 작업이 `tools/build_skills.py`로 공명자 스킬 설명(`public/skills/`)을, `tools/build_wastes.py`로 죽음의 노래와 바닷속 폐허 시즌 구성(`public/wastes.json`)을 게임 데이터에 맞춰 다시 만듭니다.
- 폐허 시즌 번호 · 기간은 `src/app.js`의 `WASTES_BASE`(23시즌 = 2026-10-26 월요일 04:00 시작, 28일 주기)로 계산합니다.
- 사이트는 열릴 때 `chars-extra.json`을 읽어 새 공명자를 보유 캐릭터 · 육성 계산 · 도감에 추가합니다(역할 · 버프는 추정치, "자동 추가 · 추정" 표시).
- 바로 돌려 보려면 **Actions → 신규 공명자 자동 갱신 → Run workflow**.
- `src/app.js` · `src/data/`나 `tools/update_chars.py`를 새로 올리면 그때도 자동으로 한 번 돌아, 앱 코드에 이미 들어간 공명자는 `chars-extra.json`에서 빠집니다.
- 필요한 권한(커밋 · 사이트 재배포 · 예약 유지)은 워크플로 파일이 직접 받으므로 저장소 설정을 따로 바꿀 필요가 없습니다.
- 갱신 커밋 뒤에는 사이트 배포(deploy.yml)를 자동으로 실행합니다.
- GitHub는 60일 동안 변경이 없는 저장소의 예약 실행을 멈추지만, 이 워크플로가 매번 스스로를 다시 켜 두므로 따로 손댈 필요가 없습니다.
- 실행이 실패하면 GitHub가 저장소 주인 이메일로 알려 줍니다.
- `update-chars.yml`은 꼭 `.github/workflows/` 안에 있어야 합니다. 저장소 맨 위에 있으면 실행되지 않습니다(`update_chars.py`는 맨 위나 `tools/` 어디든 됩니다).
- `.github` 폴더는 웹 업로드 화면에서 숨김 폴더라 끌어다 놓기가 안 될 수 있습니다. 그럴 땐 **Add file → Create new file**에 이름을 `.github/workflows/update-chars.yml`로 적고 내용을 붙여 넣으면 됩니다.

## 로그인 · 설정 동기화 (Ver. 1.0.21~)

- 서버: `server/worker.js`, Cloudflare 계정의 Worker `ddingjo-sync`(주소 `https://ddingjo-sync.ddingjo-atm.workers.dev`)와 D1 데이터베이스 `ddingjo-sync`. 무료 요금제 안에서 돌아갑니다(하루 요청 10만 회).
- 아이디 · 비밀번호 계정. 비밀번호는 브라우저에서 PBKDF2(15만 회)로 늘린 값만 보내고, 서버는 무작위 소금으로 한 번 더 PBKDF2 해서 저장합니다. 로그인 토큰은 SHA-256으로만 저장(180일). 로그인 · 가입 시도 횟수 제한이 있습니다.
- 계정에 저장되는 것: 보유 캐릭터 · 파티 · 캐릭터 설정 · 계산 설정 · 육성 계산 · 에코 계산기(localStorage `ddingjo-atm-v2`, `ddingjo-atm-echo-calc`). 계정당 최대 256KB.
- 서버 코드를 고친 뒤 다시 올리기: `cd server && npx wrangler login && npx wrangler deploy` (표 구조는 `schema.sql`).
- 사이트 배포(deploy.yml) 때마다 로그인 서버가 응답하는지 확인합니다.

## 안드로이드 앱 · 홈 화면 앱 (Ver. 1.0.23~)

- `android/`를 고치거나 `src/data/app-version.json`의 버전을 올리면 `.github/workflows/android.yml`이 APK를 만들어 GitHub Releases(`app-v<버전>`)에 올립니다. 사이트의 앱 설치 페이지(`/-/app`)는 항상 최신 릴리스의 `ddingjo-atm.apk`로 연결됩니다.
- 앱 껍데기를 바꿨을 때는 `app-version.json`의 `versionCode`(1씩 올림)와 `versionName`, `notes`를 고칩니다. 앱 안에서 사이트가 더 새 versionCode를 보면 업데이트 안내를 띄웁니다. 화면 · 기능은 사이트에서 오므로 대부분의 업데이트는 앱을 다시 만들 필요가 없습니다.
- 서명: 저장소 Secrets에 `ANDROID_KEYSTORE_B64`(키 파일 base64) · `ANDROID_KEYSTORE_PASSWORD` · `ANDROID_KEY_ALIAS`가 있으면 그 키로, 없으면 `android/keys/ddingjo-public.jks`(공개 키, 비밀번호 `ddingjo-public`)로 서명합니다. 서명 키가 바뀌면 기존 앱 위에 업데이트 설치가 안 되고 지웠다가 다시 설치해야 합니다.
- 사이트 업데이트 반영: 빌드할 때 `version.json`(앱 코드 파일 이름 · 버전)을 만들고, 사이트가 열릴 때 · 앱이 다시 앞으로 올 때 이 파일을 확인해 새 배포가 있으면 새로 고칩니다. 그래서 APK를 다시 설치하지 않아도 앱에 새 기능 · 업데이트 내역이 바로 나옵니다.
- 홈 화면에 추가(PWA): `public/manifest.webmanifest`, `public/sw.js`(페이지 · 데이터는 항상 인터넷 우선, 버전 붙은 코드 · 그림만 저장), 아이콘 `public/icons/`.

## 참고

- 사용자 설정(보유 캐릭터, 파티, 캐릭터 설정)은 각자 브라우저에 저장되고, 로그인하면 계정에도 저장됩니다.
- 역경의 탑 정보는 게임 데이터 저장소(Arikatsu/WutheringWaves_Data)에서 자동으로 갱신됩니다.
