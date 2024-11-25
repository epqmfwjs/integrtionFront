// src/components/building/musicPlayer/utils/spotifyUtils.js
import { createContext, useContext, useState } from 'react';

// SDK 스크립트 로드 함수
export const loadSpotifyScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Spotify) {
        resolve(window.Spotify);
        return;
      }
  
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.type = "text/javascript";
      
      script.onload = () => {
        if (window.Spotify) {
          resolve(window.Spotify);
        } else {
          reject(new Error('Spotify SDK failed to load'));
        }
      };
  
      script.onerror = (error) => {
        reject(new Error('Error loading Spotify SDK'));
      };
  
      document.body.appendChild(script);
    });
  };
  
  // 팝업 창 위치 계산
  export const calculatePopupPosition = (width, height) => {
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);
    return { left, top };
  };
  
  // 인증 URL 생성
  export const createAuthURL = (clientId, redirectUri, scope) => {
    return `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}` +
      `&response_type=token` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scope)}`;
  };
  
  // 재생 시간 포맷
  export const formatTime = (ms) => {
    if (!ms) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
   };
  
  // API 응답 에러 처리
  export const handleApiError = (error) => {
    console.error('Spotify API Error:', error);
    if (error.status === 401) {
      localStorage.removeItem('spotify_token');
      return 'TOKEN_EXPIRED';
    }
    return 'API_ERROR';
  };
  
  // Player 초기화 함수
  export const initializePlayer = (token, callbacks) => {
    const player = new window.Spotify.Player({
      name: 'Metaverse Player',
      getOAuthToken: cb => { cb(token); },
      volume: 0.5
    });
  
    // 이벤트 리스너 등록
    Object.entries(callbacks).forEach(([event, callback]) => {
      player.addListener(event, callback);
    });
  
    return player;
  };

  // 반복 재생 컨텍스트
  const RepeatContext = createContext();

  export const RepeatProvider = ({ children }) => {
    const [isRepeatOn, setIsRepeatOn] = useState(() => 
      JSON.parse(localStorage.getItem('metaverse_is_repeat') || 'false')
    );

    const toggleRepeat = () => {
      const newState = !isRepeatOn;
      setIsRepeatOn(newState);
      localStorage.setItem('metaverse_is_repeat', JSON.stringify(newState));
    };

    return (
      <RepeatContext.Provider value={{ isRepeatOn, toggleRepeat }}>
        {children}
      </RepeatContext.Provider>
    );
  };

  export const useRepeat = () => useContext(RepeatContext);