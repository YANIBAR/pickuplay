import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    try {
      const keys = ['id', 'firstName', 'lastName', 'email', 'phone'];
      const result = await AsyncStorage.multiGet(keys);
      
      const data = {};
      result.forEach(([key, value]) => {
        if (value !== null) {
          data[key] = value;
        }
      });
      setUserData(data);
      return data;
    } catch (err) {
      console.error('Error retrieving user data:', err);
      setError(err);
      return null;
    }
  };

  // Load data on initial mount
  useEffect(() => {
    fetchUserData();
  }, []);

  return { userData, error, refreshUserData: fetchUserData };
};