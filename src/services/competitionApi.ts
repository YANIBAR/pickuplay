
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse } from "axios";
import { Alert } from "react-native";

const createApi = (requiresAuth: boolean) => {

  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });


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
  );

  return instance;
};

export const authCompetitionsdApi = createApi(true);
export const publicCompetitionApi = createApi(false);

// ✅ Default export so `import api from '@services/api'` in auth.ts works
export default publicCompetitionApi;

export interface ApiCompetition {
  id: string;
  name: string;
  city: string;
  address: string;
  sportTypeId: string;
  startDate: string;
  startRegistration: string;
  endRegistration: string;
  nbrOfTeams: number;
  teamSize: number;
  nbrOfSubs: number;
  format: string;
  pricePlayer: number;
  gender: string;
  minimumAge: number;
  teamNames: string[];
  comment: string;
  logoUrl: string | null;
  coverPhotoUrl: string | null;
  pennies: boolean;
  prize: boolean;
  referee: boolean;
}

export const getCompetition = async (id: string): Promise<ApiCompetition> => {
  const response = await authCompetitionsdApi.get(`competitions/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to load competition (${response.status})`);
  }
  return response.json();
};