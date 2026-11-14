import { useState, useEffect, useCallback } from 'react';
import { View, Image, SafeAreaView, Alert } from 'react-native';
import { Text, Header, TextInput, Button, Row, Column } from '@components';
import { Controller, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { authSelector } from '../../../app/slices/auth';
import { COLORS, icons, images, screens } from '@constants';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '@utils/validators';
import styles from './styles';
import { publicApi } from '@services/api';
import { getCurrentCity } from '@utils/helpers';
import { Dropdown } from 'react-native-element-dropdown';

type Nav = {
  navigate: (value: string, params?: any) => void;
};

type CityOption = { label: string; value: string };

const SignUp = () => {
  const { t } = useTranslation();
  const { isLoading } = useSelector(authSelector);
  const { navigate } = useNavigation<Nav>();

  const [callingCode] = useState('+1'); // default US
  const [cities, setCities] = useState<CityOption[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (formData: any) => {
    setApiError(null);

    // Use the city the user selected; fall back to detected city only if none chosen
    let cityId = formData.cityId;
    if (!cityId) {
      const city = await getCurrentCity();
      if (city?.id != null) cityId = String(city.id);
    }

    const payload = {
      ...formData,
      ...(formData.phone ? { phone: `${callingCode}${formData.phone}` } : {}),
      ...(cityId ? { cityId } : {}),
    };

    try {
      await publicApi.post('auth/register', payload);
      navigate(screens.otpverification, {
        email: payload.email,
        phone: payload.phone,
        action: 'register',
        password: payload.password,
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Registration failed. Please try again.';

      setApiError(message);

      const lower = message.toLowerCase();
      if (lower.includes('email')) {
        setError('email', { type: 'manual', message });
      }
      if (lower.includes('phone')) {
        setError('phone', { type: 'manual', message });
      }
    }
  };

  const getCities = useCallback(async () => {
    try {
      const response = await publicApi.get('cities');
      const cityList = response?.result?.data ?? [];
      setCities(
        cityList
          .map((city: any) => ({ label: city.name, value: String(city.id) }))
          .sort((a: CityOption, b: CityOption) => a.label.localeCompare(b.label))
      );
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to load cities');
      setCities([]);
    }
  }, []);

  useEffect(() => {
    getCities();
  }, [getCities]);

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
      <View style={[styles.container, { backgroundColor: COLORS.white }]}>
        <Header title={t('c.signUp')} />
        <View style={styles.logoContainer}>
          <Image source={images.logo} resizeMode="contain" style={styles.logo} />
        </View>
        <Text style={styles.title}>{t('signUp.createAccount')}</Text>

        <Row>
          <Column style={{ flex: 0.5, marginRight: 5 }}>
            <Controller
              name="firstName"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  icon={icons.user}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t('c.firstName')}
                  errorText={errors?.firstName?.message}
                />
              )}
            />
          </Column>
          <Column style={{ flex: 0.5, marginLeft: 5 }}>
            <Controller
              name="lastName"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  icon={icons.user}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t('c.lastName')}
                  errorText={errors?.lastName?.message}
                />
              )}
            />
          </Column>
        </Row>

        <Controller
          name="cityId"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <Dropdown
                data={cities}
                labelField="label"
                valueField="value"
                search
                placeholder={t('edit_game.select_city')}
                value={value}
                onBlur={onBlur}
                onChange={(item) => onChange(String(item.value))}
                style={styles.dropdown}
              />
              {errors?.cityId?.message ? (
                <Text style={{ color: COLORS.red ?? 'red' }}>
                  {errors.cityId.message as string}
                </Text>
              ) : null}
            </>
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onBlur={onBlur}
              icon={icons.email}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={t('c.emailAddress')}
              errorText={errors?.email?.message}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              password
              value={value}
              onBlur={onBlur}
              icon={icons.padlock}
              autoCapitalize="none"
              onChangeText={onChange}
              placeholder={t('c.passwordPlaceholder')}
              secureTextEntry
              errorText={errors?.password?.message}
            />
          )}
        />

        <Controller
          name="confirmPwd"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              password
              value={value}
              onBlur={onBlur}
              icon={icons.padlock}
              autoCapitalize="none"
              onChangeText={onChange}
              placeholder={t('c.confirmPasswordPlaceholder')}
              secureTextEntry
              errorText={errors?.confirmPwd?.message}
            />
          )}
        />

        {apiError ? (
          <Text style={{ color: COLORS.red ?? 'red', marginBottom: 8 }}>{apiError}</Text>
        ) : null}

        <Button
          filled
          loading={isLoading}
          disabled={!isValid || isLoading}
          title={t('signUp.createMyAccount')}
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

export default SignUp;