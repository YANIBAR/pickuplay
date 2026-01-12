import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {
  Text,
  Header,
  TextInput,
  Button,
  Row,
  Column,
  SuccessModal,
  Phone,
} from '@components';
import { Controller, useForm } from 'react-hook-form';
import { Link, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector, userRegister } from '../../../../app/slices/auth';
import { COLORS, icons, images, screens } from '@constants';
import { useTranslation } from 'react-i18next';
import { registerFormData } from '@types';
import styles from '../styles';

type Nav = {
  navigate: (value: string) => void;
};

const CustomerSignUp = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>('Customer'); // New state for role selection
  const { isLoading } = useSelector(authSelector);
  const { navigate } = useNavigation<Nav>();
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<registerFormData>({
    //resolver: yupResolver<registerFormData>(registerSchema),
  });

  const onSubmit = async (formData: registerFormData) => {
    const dataWithRole = { ...formData, role: "Customer","gender": "male","city": "casa",
  "address": "11000 north",
  "image": "store.png", 
  "preferredLanguage": "en" }; // Include role in the form data
    dispatch(userRegister(dataWithRole) as any);
    //navigate(screens.otpverification, { email: formData.email });
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  useFocusEffect(
    useCallback(() => {
      return () => reset();
    }, [reset]),
  );

  const onClose = (): void => {
    setVisible(false);
    navigate(screens.login);
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: COLORS.white }]}>
        <Header title={t('c.signUp')} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image
              source={images.logo}
              resizeMode="contain"
              style={styles.logo}
            />
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
            name="email"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onBlur={onBlur}
                icon={icons.email}
                onChangeText={onChange}
                keyboardType="email-address"
                placeholder={t('c.emailAddress')}
                errorText={errors?.email?.message}
              />
            )}
          />
          <Controller
            name="phone"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Phone
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={t('c.phoneNumber')}
                errorText={errors?.phone?.message}
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
                secureTextEntry={true}
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
                secureTextEntry={true}
                errorText={errors?.confirmPwd?.message}
              />
            )}
          />
          <View style={styles.termsContainer}>
            <Text style={styles.privacy}>
              {t('signUp.termsAcceptance')}{' '}
              <Link to={{ screen: 'termsofservice' }} style={styles.link}>
                {t('c.termsOfService')}
              </Link>{' '}
              {t('c.and')}{' '}
              <Link to={{ screen: 'privacypolicy' }} style={styles.link}>
                {t('c.privacyPolicy')}
              </Link>
            </Text>
          </View>
          <SuccessModal visible={visible} onClose={onClose} />
          <Button
            filled
            loading={isLoading}
            title={t('signUp.createMyAccount')}
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
          />
          <View style={styles.bottomContainer}>
            <Text size="h4">{t('signUp.alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={() => navigate(screens.login)}>
              <Text size="h4" color={COLORS.primary}>
                {' '}
                {t('c.signIn')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default CustomerSignUp;
