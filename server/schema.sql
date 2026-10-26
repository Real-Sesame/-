-- 띵조 AUTO TEAM MAKER 로그인 · 설정 동기화 (Cloudflare D1)
CREATE TABLE IF NOT EXISTS users (
  id      TEXT PRIMARY KEY,   -- 아이디(영어 소문자 · 숫자 · _ 3~20자)
  salt    TEXT NOT NULL,
  hash    TEXT NOT NULL,      -- PBKDF2(브라우저에서 늘린 비밀번호 값, salt)
  created INTEGER NOT NULL,
  data    TEXT,               -- 사이트 설정(JSON)
  updated INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (
  th      TEXT PRIMARY KEY,   -- 로그인 토큰의 SHA-256 (토큰 원문은 저장하지 않음)
  uid     TEXT NOT NULL,
  created INTEGER NOT NULL,
  expires INTEGER NOT NULL,
  ua      TEXT
);
CREATE INDEX IF NOT EXISTS sessions_uid ON sessions (uid);
CREATE TABLE IF NOT EXISTS limits (
  k     TEXT PRIMARY KEY,     -- 시도 횟수 제한 (signup:<ip>, login:<id>, loginip:<ip>)
  n     INTEGER NOT NULL,
  reset INTEGER NOT NULL
);
