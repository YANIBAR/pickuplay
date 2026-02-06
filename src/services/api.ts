import { JAVA_API } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";
import { Alert } from "react-native";

const createApi = (requiresAuth: boolean) => {
  const instance = axios.create({
    baseURL: JAVA_API,
    timeout: 5000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (requiresAuth) {
    instance.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('access_token');
          console.log("ddď",token);
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