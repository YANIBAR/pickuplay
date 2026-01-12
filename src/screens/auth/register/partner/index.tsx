import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Header, TextInput, Button, Column, Row, SuccessModal } from '@components';
import { Controller, useForm } from 'react-hook-form';
import RNPickerSelect from 'react-native-picker-select';
import { Link, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector, userRegister } from '../../../../app/slices/auth'; // Assuming you have a store register slice
import { COLORS, icons, images, screens } from '@constants';
import { useTranslation } from 'react-i18next';
import styles from '../styles';

type Nav = {
  navigate: (value: string) => void;
};

const StoreSignUp = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [visible, setVisible] = useState<boolean>(false);
  const { isLoading } = useSelector(authSelector);
  const { navigate } = useNavigation<Nav>();
  const [selectedCategory, setSelectedCategory] = useState('');
  const categoryOptions = [
    { label: t('storeSignUp.categories.meals'), value: 'meals'},
    { label: t('storeSignUp.categories.sandwich'), value: 'sandwich'},
    { label: t('storeSignUp.categories.pastries'), value: 'pastries'},
    { label: t('storeSignUp.categories.snack'), value: 'snack'},
    { label: t('storeSignUp.categories.bread'), value: 'bread'},
    { label: t('storeSignUp.categories.groceries'), value: 'groceries'},
    { label: t('storeSignUp.categories.drinks'), value: 'drink'}
  ];
  const handleCategoryChange = (value: any) => {
    setSelectedCategory(value);
  };
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm();

  const onSubmit = async (formData: storeRegisterFormData) => {
    const dataWithRole = { ...formData, role: "Partner"};
    dispatch(userRegister(dataWithRole) as any); // Action for store registration
    //navigate(screens.otpverification, { email: formData.email }); // Navigate to OTP screen for store verification
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
        <Header title={t('storeSignUp.title')} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            
            <Image
              source={images.logo}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>
          <Text style={styles.title}>{t('storeSignUp.createAccount')}</Text>
          
          {/* Store Name */}
          <Controller
            name="storeName"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                icon={icons.restaurant}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={t('storeSignUp.storeName')}
                errorText={errors?.storeName?.message}
              />
            )}
          />

          {/* Owner Name */}
          
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

          {/* Email */}
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

          {/* Phone */}
          <Controller
            name="phone"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onBlur={onBlur}
                icon={icons.telephone}
                onChangeText={onChange}
                keyboardType="phone-pad"
                placeholder={t('c.phoneNumber')}
                errorText={errors?.phone?.message}
              />
            )}
          />

          {/* Store Address */}
          <Controller
            name="storeAddress"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                icon={icons.map}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={t('storeSignUp.storeAddress')}
                errorText={errors?.storeAddress?.message}
              />
            )}
          />

          {/* Store Category Dropdown */}
          <View>
              <RNPickerSelect
                placeholder={{ label: 'Select', value: '' }}
                items={categoryOptions}
                icon={icons.padlock}
                onValueChange={(value) => handleCategoryChange(value)}
                value={selectedCategory}
                style={{
                  inputIOS: {
                    fontSize: 16,
                    paddingHorizontal: 10,
                    borderRadius: 4,
                    color: COLORS.greyscale600,
                    paddingRight: 30,
                    height: 52,
                    alignItems: 'center',
                    backgroundColor: COLORS.greyscale500,
                  },
                  inputAndroid: {
                    fontSize: 16,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    color: COLORS.greyscale600,
                    paddingRight: 30,
                    height: 52,
                    alignItems: 'center',
                    backgroundColor: COLORS.greyscale500,
                  },
                }}
              />
            </View>

          {/* Password */}
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

          {/* Confirm Password */}
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

          <View>
          <Button
            filled
            loading={isLoading}
            title={t('storeSignUp.createMyAccount')}
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
          />
          </View>
          
          <View style={styles.container, { flexDirection: 'row' }}>
          <Text
            style={[
              styles.loginTitle,
              {
                color: 'black',
              },
            ]}>
            Already have account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigate('login')}>
            <Text  size="h4" color={COLORS.primary} style={styles.loginSubtitle}>Log In</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </View>
    </>
  );
};

export default StoreSignUp;
