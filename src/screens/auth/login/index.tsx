import React, { useCallback, useEffect, useState } from 'react';
import { 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View, Button, TextInput, Text, ErrorModal } from '@components';
import { COLORS, icons, images  } from '@constants';
import { loginFormData } from '@types';
import styles from './styles';
import { API_BACKEND_URL } from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@services/localisation';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@utils/validators';

const defaultValues = {
  identifier: '', // Changed from 'username' to 'email'
  password: '',
};

const Login = () => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    trigger, // Add trigger for manual validation
  } = useForm<loginFormData>({
    defaultValues,
    resolver: yupResolver(loginSchema),
    mode: 'onBlur', // Change to onBlur for better UX
    reValidateMode: 'onChange', // Re-validate on change after first validation
  });

  useFocusEffect(
    useCallback(() => {
      return () => reset();
    }, [reset]),
  );
  useEffect(() => {
    const keys = ['id', 'firstName', 'lastName', 'email', 'phone', 'role'];
    const result = AsyncStorage.multiGet(keys);
    console.log("result", result);
  }, []);

  const handleLogin = async (formData: loginFormData) => {
      setIsLoading(true);
      
      const response = await axios.post(API_BACKEND_URL + '/auth/login/', {
        identifier: formData.identifier,
        password: formData.password
      });
      
      const userData = response.data._doc;
      const accessToken = response.data.access_token;
      console.log("Login response:", response.data);
      
      if (!userData) {
        throw new Error("No user data received from the server");
      }
      
      if (!accessToken) {
        throw new Error('No access token received');
      }

      await storeToken(accessToken);
      await storeUser(userData);
      
      const storedRole = await AsyncStorage.getItem('role');
      const storedId = await AsyncStorage.getItem('id');
      
      if (!storedRole || !storedId) {
        throw new Error('Failed to store user data properly');
      }
      
      console.log('User data stored successfully, role:', storedRole);
      await new Promise(resolve => setTimeout(resolve, 100));
      navigation.navigate("welcome");
      
  };

  // On successful login
  const storeToken = async (token: string) => {
    try {
      await AsyncStorage.setItem('access_token', token);
    } catch (error) {
      console.error(t('login.tokenStorageError'), error);
    }
  };

  // On successful login
  const storeUser = async (user: any) => {
    try {
      await AsyncStorage.multiSet([
        ['id', user._id || ''],
        ['firstName', user.firstName || ''],
        ['lastName', user.lastName || ''],
        ['email', user.email || ''],
        ['phone', user.phone || ''],
        ['preferredLanguage', user.preferredLanguage || ''],
        ['role', user.role || ''],
        ['profileImage', user.profileImage || ''],
        ['gameId', user.role === "Partner" ? user.gameId || '' : ''],
      ]);
      
      // Change language
      i18n.changeLanguage(user.preferredLanguage);
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };
  
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: COLORS.white,
        },
      ]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.logoContainer}>
          <Image
            source={images.logo}
            resizeMode="contain"
            style={styles.logo}
          />
        </View>
        <Text
          style={[
            styles.title,
            {
              color: COLORS.black,
            },
          ]}>
          {t('c.signIn')}
        </Text>
        
        <Controller
          name="identifier"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onBlur={async (e) => {
                onBlur(); // Call form's onBlur
                await trigger('identifier'); // Trigger validation
              }}
              onChangeText={async (text) => {
                onChange(text);
                // Trigger validation after a short delay for better UX
                setTimeout(() => trigger('identifier'), 300);
              }}
              icon={icons.user}
              autoCapitalize="none"
              keyboardType="identifier"
              placeholder={t('signIn.usernameOrEmail')}
            />
          )}
        />
        
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onBlur={async (e) => {
                onBlur(); // Call form's onBlur
                await trigger('password'); // Trigger validation
              }}
              onChangeText={async (text) => {
                onChange(text); // Update form value  
                // Trigger validation for password
                if (text.length === 0) {
                  setTimeout(() => trigger('password'), 300);
                }
              }}
              password
              icon={icons.padlock}
              autoCapitalize="none"
              placeholder={t('c.password')}
              secureTextEntry={true}
              errorText={errors?.password?.message}
            />
          )}
        />
        
        <Button
          filled
          title={ t('c.login')}
          onPress={handleSubmit(handleLogin)} // Use handleSubmit for validation
          style={[
            styles.button,
            { opacity: isLoading ? 0.7 : 1 }
          ]}
        />
        
        <TouchableOpacity onPress={() => navigation.navigate('forgotpasswordmethods')}>
          <Text style={styles.forgotPasswordBtnText}>
            {t('signIn.forgotPassword')}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.bottomContainer}>
          <Text size="h4">{t('signIn.dontHaveAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('register')}>
            <Text size="h4" color={COLORS.primary}>
              {'  '}
              {t('c.signUp')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <ErrorModal
        visible={modalVisible}
        title={title}
        message={message}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default Login;