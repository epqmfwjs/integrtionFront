import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://gogolckh.ddns.net:10',
  //baseURL: 'http://localhost:5000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 404) {
      // 스포티파이 관련 API 호출의 경우 리다이렉트하지 않음
      if (error.config.url.includes('/api/spotify')) {
        return Promise.reject(error);
      }
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default instance;