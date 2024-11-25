// src/components/building/musicPlayer/utils/constants.js

export const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
export const SPOTIFY_REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;

// Spotify API 권한 범위
export const SCOPE = [
  'streaming',                    // 음악 재생 제어
  'user-read-email',             // 사용자 이메일 읽기
  'user-read-private',           // 사용자 프로필 읽기
  'user-read-playback-state',    // 재생 상태 읽기
  'user-modify-playback-state',  // 재생 상태 수정
  'user-read-currently-playing', // 현재 재생 중인 트랙 정보 읽기
  'playlist-read-private',       // 비공개 플레이리스트 읽기
  'playlist-read-collaborative', // 공동 플레이리스트 읽기
  'playlist-modify-public',      // 공개 플레이리스트 수정
  'playlist-modify-private',     // 비공개 플레이리스트 수정
  'user-library-read',          // 라이브러리 읽기
  'user-library-modify'         // 라이브러리 수정
].join(' ');

// 이벤트 타입 상수
export const SPOTIFY_EVENTS = {
  AUTH_SUCCESS: 'SPOTIFY_AUTH_SUCCESS',
  PLAYER_STATE_CHANGED: 'player_state_changed',
  READY: 'ready',
  NOT_READY: 'not_ready',
};

// SDK 에러 타입
export const SDK_ERRORS = {
  INITIALIZATION: 'initialization_error',
  AUTHENTICATION: 'authentication_error',
  ACCOUNT: 'account_error',
  PLAYBACK: 'playback_error',
};