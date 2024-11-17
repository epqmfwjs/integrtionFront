import axios from 'axios';

const instance = axios.create({
  //baseURL: 'http://localhost:5000',
  baseURL: 'http://gogolckh.ddns.net:10',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default instance;