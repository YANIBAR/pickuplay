import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { screens } from './../../constants';
import { User } from './../../types';

interface AuthProviderProps {
  children: ReactNode;
}

type Nav = {
  navigate: (value: string) => void;
};

const AuthContext = createContext({});

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { navigate } = useNavigation<Nav>();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');

  const loadStoredToken = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  };

  const logout = useCallback(() => {
    const keysToRemove = [
      'token',
      'user',
      'firstName',
      'lastName',
      'email',
      'phone',
      'role',
      'preferredLanguage',
      'profileImage',
      'activityId',
    ];
    
     AsyncStorage.multiRemove(keysToRemove);
    
    // Reset state
    setToken(null);
    setUser(null);
    navigate(screens.login);
  }, [navigate]);

  useEffect(() => {
    loadStoredToken();
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
