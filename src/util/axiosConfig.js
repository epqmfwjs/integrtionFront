import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://gogolckh.ddns.net:10',  // 홈서버 주소로 변경
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
      window.location.href = 'http://gogolckh.ddns.net:10/';
      //window.location.href ='/';
    }
    return Promise.reject(error);
  }
);

export default instance;