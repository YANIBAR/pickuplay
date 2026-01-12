import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '@env';
import storage from '@utils/storage';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig<any>) => {
    const token = await storage.getItem('access_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
    return config;
  },
);

api.interceptors.response.use((response: AxiosResponse) => response);



export default api;
