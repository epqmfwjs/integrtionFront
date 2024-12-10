import React from 'react';
import { Html } from '@react-three/drei';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, SCOPE } from '../utils/constants';
import {
  modalContainerStyle,
  closeButtonStyle,
  authContentStyle,
  authTitleStyle,
  authDescriptionStyle,
  spotifyButtonStyle,
  spotifyButtonHoverStyle
} from '../styles/modalStyles';

export const AuthModal = ({ onClose }) => {
  const handleLogin = () => {
    const width = 450;
    const height = 730;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${SPOTIFY_CLIENT_ID}` +
      `&response_type=token` +
      `&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(SCOPE)}`;

    const authWindow = window.open(
      authUrl,
      'Spotify Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (authWindow === null) {
      alert('Please enable popups for this site to login with Spotify');
    }
  };

  return (
    <Html center position={[0, 0, 0]}>
      <div style={modalContainerStyle}>
        <button onClick={onClose} style={closeButtonStyle}>
          ×
        </button>

        <div style={authContentStyle}>
          <h2 style={authTitleStyle}>
            KwanghyunWorld
          </h2>
          <h2 style={authTitleStyle}>
            Music Player
          </h2>
          <p style={authDescriptionStyle}>
            뮤직 플레이어를 사용 하시겠습니까?
          </p>
          <button
            onClick={handleLogin}
            style={spotifyButtonStyle}
            onMouseOver={(e) => {
              Object.assign(e.target.style, spotifyButtonHoverStyle);
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = spotifyButtonStyle.backgroundColor;
            }}
          >
            플레이어 사용하기
          </button>
        </div>
      </div>
    </Html>
  );
};

export default AuthModal;