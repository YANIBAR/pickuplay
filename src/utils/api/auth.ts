import api from '@services/api';
import { loginFormData, registerFormData } from '@types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default {
  login: async (data: loginFormData) => await api.post('users', data),
  register: async (data: registerFormData) =>
    await api.post('/user/register', data),
  verify: async (otp: string) => await api.post('/otp/verification', otp),
  resetPassword: async (otp: string) =>
    await api.post('/auth/reset-password/', otp),
};

/**
 * Checks if a JWT token is expired
 * @param {string} token - JWT token string
 * @returns {boolean} - true if expired, false if valid
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // Decode the payload (middle part of JWT)
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));

    if (!decoded.exp) return false; // No expiry set — treat as valid

    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Invalid token format:', error);
    return true; // Treat malformed tokens as expired
  }
};

/**
 * Retrieves token from AsyncStorage and checks if it's expired
 * @returns {Promise<boolean>} - true if expired or missing, false if valid
 */
export const isStoredTokenExpired = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    return isTokenExpired(token);
  } catch (error) {
    console.error('Error reading token:', error);
    return true;
  }
};

/**
 * Returns remaining time in seconds before token expires
 * @param {string} token - JWT token string
 * @returns {number} - seconds remaining (negative if already expired)
 */
export const getTokenTimeRemaining = (token) => {
  if (!token) return -1;

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));

    if (!decoded.exp) return Infinity;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp - currentTime;
  } catch {
    return -1;
  }
};