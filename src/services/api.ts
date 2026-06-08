import { JAVA_API } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";
import { Alert } from "react-native";

const createApi = (requiresAuth: boolean) => {
  let isRefreshing = false;
  let failedQueue: any[] = [];
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
      else prom.resolve(token);
    });
    failedQueue = [];
  };

  instance.interceptors.response.use(
    (response: AxiosResponse) => ({
      ...response,
      result: response.data,
    }),

    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
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

          if (!refreshToken) {
            throw new Error('No refresh token');
          }


          const response = await axios.post(
            `${JAVA_API}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          const newAccessToken = response.data.access_token;

          await AsyncStorage.setItem('access_token', newAccessToken);

          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);

        } catch (err) {
           processQueue(err, null);

           // 🔴 Important: logout user
           await AsyncStorage.removeItem('access_token');
           await AsyncStorage.removeItem('refresh_token');

           Alert.alert('Session expired', 'Please login again');

           return Promise.reject(err);

         } finally {
          isRefreshing = false;
         }
      }

      return Promise.reject(error);
    }
  );

  if (requiresAuth) {
    instance.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('access_token');
          if (!token) {
            // Token missing on protected endpoint - redirect to login
            throw new Error('No authentication token found');
          }
          config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
          console.error('Auth error:', error);
          Alert.alert('Warning','To see your schedule you should to be auth');
          // Handle redirect to login here
          return Promise.reject(error);
        }
        return config;
      }
    );
  }

  // Common response interceptor for both
  instance.interceptors.response.use((response: AxiosResponse) => {

    return {
      ...response,
      result: response.data,
    };

  });
  return instance;
};

export const authenticatedApi = createApi(true);
export const publicApi = createApi(false);