import  { useState, useEffect } from 'react';
import { View, Image, SafeAreaView } from 'react-native';
import { Text, Header, TextInput, Button, Row, Column, Phone } from '@components';
import { Controller, useForm } from 'react-hook-form';
import {  useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector } from '../../../app/slices/auth';
import { COLORS, icons, images, screens  } from '@constants';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '@utils/validators';
import styles from './styles';
import { publicApi } from '@services/api';
type Nav = {
  navigate: (value: string) => void;
};

const SignUp = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLoading } = useSelector(authSelector);
  const [callingCode, setCallingCode] = useState('+1'); // default US

  const { navigate } = useNavigation<Nav>();

  const {
    reset,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitSuccessful, isValid  },
  }  = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });
 const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = async (formData: FormData) => {
    setApiError(null); // Reset error
    const payload = {
      ...formData,
      ...(formData.phone ? { phone: `${callingCode}${formData.phone}` } : {})
    };

    try {
      await publicApi.post("auth/register", payload);
      navigate(screens.otpverification, {
        email: payload.email,
        phone: payload.phone,
        action: "register",
      });
    } catch (error: any) {
      // Axios error: error.response?.data?.message or similar
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Registration failed. Please try again.";

      // Option 1: Show as a general error
      setApiError(message);

      // Option 2: Set field-specific error (if backend returns which field is duplicated)
      if (message.toLowerCase().includes("email")) {
        setError("email", { type: "manual", message });
      }
      if (message.toLowerCase().includes("phone")) {
        setError("phone", { type: "manual", message });
      }
    }
  };

  useEffect(() => {
    if (isSubmitSuccessful) {
      //reset();
    }
  }, [isSubmitSuccessful, reset]);

  /*useFocusEffect(
    useCallback(() => {
      return () => reset();
    }, [reset])
  );*/

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
      <View style={[styles.container, { backgroundColor: COLORS.white }]}>
      
        <Header title={t('c.signUp')} />
        <View style={styles.logoContainer}>
          <Image source={images.logo} resizeMode="contain" style={styles.logo} />
        </View>
        <Text style={styles.title}>{t('signUp.createAccount')} </Text>
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
        
        {/* Checkbox to show/hide store-related fields
        <View style={styles.checkBoxContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Checkbox
              style={styles.checkbox}
              value={isChecked}
              color={isChecked ? COLORS.primary : 'gray'}
              onValueChange={setChecked}  // Handle checkbox value change
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.privacy, { color: COLORS.black }]}>
                Sign up as store
              </Text>
            </View>
          </View>
        </View> */}

        {/* Conditionally render store fields if checkbox is checked 
        {isChecked && (
          <>
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
            {/* Store Category Dropdown 
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
                    color: COLORS.grayscale600,
                    paddingRight: 30,
                    height: 52,
                    alignItems: 'center',
                    backgroundColor: COLORS.grayscale500,
                  },
                  inputAndroid: {
                    fontSize: 16,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    color: COLORS.grayscale600,
                    paddingRight: 30,
                    height: 52,
                    alignItems: 'center',
                    backgroundColor: COLORS.grayscale500,
                  },
                }}
              />
            </View>
          </>
        )}*/}

        <Controller
          name="phone"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Phone
              value={value}
              onBlur={onBlur}
              icon={icons.telephone}
              onChangeText={onChange}
              onSelectCode={(code) => setCallingCode(code)}
              placeholder={t('c.phoneNumber') + ' (' + t('c.optional') + ')'}
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
