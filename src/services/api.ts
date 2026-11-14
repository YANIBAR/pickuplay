import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";
import { Alert } from "react-native";
import { JAVA_API, DEV_JAVA_API, PAYMENT_API } from "@env";

// ✅ Shared across ALL instances so only one refresh runs at a time
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => (error ? prom.reject(error) : prom.resolve(token!)));
  failedQueue = [];
};
const BASE_URL = __DEV__ ? DEV_JAVA_API : JAVA_API;

const createApi = (requiresAuth: boolean, baseURL?: string | null) => {

  console.log('BASE_URL:', BASE_URL);
  const instance = axios.create({
    baseURL: baseURL ?? BASE_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (requiresAuth) {
    instance.interceptors.request.use(async (config) => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) throw new Error('No authentication token found');
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Auth error:', error);
        Alert.alert('Warning', 'To see your schedule you need to be logged in.');
        return Promise.reject(error);
      }
      return config;
    });
  }

  instance.interceptors.response.use(
    (response: AxiosResponse) => ({ ...response, result: response.data }),

    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          if (!refreshToken) throw new Error('No refresh token');
          const response = await axios.post(`${BASE_URL}auth/refresh`, {
            "refresh_token": refreshToken
          });
          console.log(response);
          const newAccessToken: string = response.data?.token ?? response.data.access_token;
          if (!newAccessToken) throw new Error('Refresh response missing token');
          await AsyncStorage.setItem('access_token', newAccessToken);

          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (err) {
          processQueue(err, null);
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
          Alert.alert('Session expired', 'Please login again.');
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Default service (JAVA_API)
export const authenticatedApi = createApi(true);
export const publicApi = createApi(false);

// Other microservices
export const paymentApi = createApi(true, PAYMENT_API);

export default publicApi;