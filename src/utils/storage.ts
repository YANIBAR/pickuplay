import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save value to AsyncStorage.
 */
export const setItem = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving item to AsyncStorage', e);
  }
};

/**
 * Get a value from AsyncStorage.
 */
export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? JSON.parse(value) : null;
  } catch (e) {
    console.error('Error getting item from AsyncStorage', e);
    return null;
  }
};

/**
 * Remove value from AsyncStorage.
 */
export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing item from AsyncStorage', e);
  }
};

/**
 * Merge a value with an existing value in AsyncStorage.
 */
export const mergeItem = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.mergeItem(key, jsonValue);
  } catch (e) {
    console.error('Error removing whole AsyncStorage data', e);
  }
};

/**
 * Clear whole AsyncStorage data.
 */
export const clear = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error('Error removing whole AsyncStorage data', e);
  }
};

export default {
  ...AsyncStorage,
  setItem,
  getItem,
  removeItem,
  mergeItem,
  clear,
};
