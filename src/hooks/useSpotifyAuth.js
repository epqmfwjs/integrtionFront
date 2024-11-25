import { useState, useEffect } from 'react';
import { getSpotifyAuthUrl } from '../services/spotify/spotifyConfig';

export const useSpotifyAuth = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('spotify_token');
    if (storedToken) {
      setToken(storedToken);
    }

    const hash = window.location.hash;
    if (hash) {
      const token = hash.substring(1).split('&')
        .find(elem => elem.startsWith('access_token'))
        ?.split('=')[1];
      
      if (token) {
        localStorage.setItem('spotify_token', token);
        setToken(token);
        window.location.hash = '';
      }
    }
  }, []);

  const login = () => {
    window.location.href = getSpotifyAuthUrl();
  };

  const logout = () => {
    localStorage.removeItem('spotify_token');
    setToken(null);
  };

  return { token, login, logout };
};