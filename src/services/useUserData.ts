import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const keys = ['id', 'firstName', 'lastName', 'email', 'phone', 'city', 'role', 'preferredLanguage'];
      const result = await AsyncStorage.multiGet(keys);

      const data: UserData = {};
      result.forEach(([key, value]) => {
        if (value !== null && value !== '') {
          data[key as keyof UserData] = value;
        }
      });

      // If no keys were populated, keep userData as null
      const isEmpty = Object.keys(data).length === 0;
      setUserData(isEmpty ? null : data);
      return isEmpty ? null : data;
    } catch (err: any) {
      console.error('Error retrieving user data:', err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return { userData, loading, error, refreshUserData: fetchUserData };
};