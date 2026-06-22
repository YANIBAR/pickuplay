import { JAVA_API } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";
import { Alert } from "react-native";

const createApi = (requiresAuth: boolean) => {
  let isRefreshing = false;
  let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

  const instance = axios.create({
    baseURL: JAVA_API,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) prom.reject(error);
      else prom.resolve(token!);
    });
    failedQueue = [];
  };

  // ✅ Auth header injection (only for authenticated instances)
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

  // ✅ Single response interceptor — handles both 401 refresh and normal responses
  instance.interceptors.response.use(
    (response: AxiosResponse) => ({
      ...response,
      result: response.data,
    }),

    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        // Queue up requests that come in while refresh is in progress
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
          // ✅ Use refresh_token from AsyncStorage to get a new access token
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          if (!refreshToken) throw new Error('No refresh token');

          const response = await axios.post(`${JAVA_API}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const newAccessToken: string = response.data.access_token;
          await AsyncStorage.setItem('access_token', newAccessToken);

          // ✅ Unblock all queued requests with the new token
          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);

        } catch (err) {
          // ✅ Refresh failed — clear tokens and force re-login
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

export const authenticatedApi = createApi(true);
export const publicApi = createApi(false);

// ✅ Default export so `import api from '@services/api'` in auth.ts works
export default publicApi;