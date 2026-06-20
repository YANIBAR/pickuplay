import api from '@services/api';
import { loginFormData, registerFormData } from '@types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

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
export const isTokenExpired = (token?: string | null): boolean => {
  if (!token) return true;

  try {
    // Decode the payload (middle part of JWT)
    const payload = token.split('.')[1];
    const decodedJson = Buffer.from(payload, 'base64').toString('utf8');
    const decoded = JSON.parse(decodedJson) as { exp?: number };

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
    const accessToken = await AsyncStorage.getItem('access_token');
    const accessExpired = isTokenExpired(accessToken);

    if (!accessExpired) return false; // access token still valid

    // Access expired -> check refresh token existence and expiry
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) return true; // no refresh token -> expired

    const refreshExpired = isTokenExpired(refreshToken);
    // If refresh token is still valid we consider the session alive (can refresh)
    return refreshExpired;
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
export const getTokenTimeRemaining = (token?: string | null): number => {
  if (!token) return -1;

  try {
    const payload = token.split('.')[1];
    const decodedJson = Buffer.from(payload, 'base64').toString('utf8');
    const decoded = JSON.parse(decodedJson) as { exp?: number };

    if (!decoded.exp) return Infinity;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp - currentTime;
  } catch {
    return -1;
  }
};