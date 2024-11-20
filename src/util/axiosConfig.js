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
      // 절대 경로로 변경
      window.location.replace('http://gogolckh.ddns.net:10');  // replace 사용
      //window.location.href = '/';  // href 사용
    }
    return Promise.reject(error);
  }
);

export default instance;