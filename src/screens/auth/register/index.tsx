import  { useState, useEffect } from 'react';
import { View, Image, SafeAreaView } from 'react-native';
import { Text, Header, TextInput, Button, Row, Column, Phone } from '@components';
import { Controller, useForm } from 'react-hook-form';
import {  useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector, userRegister } from '../../../app/slices/auth';
import { COLORS, icons, images, screens  } from '@constants';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '@utils/validators';
import styles from './styles';
import axios from 'axios';
import { JAVA_API } from '@env';

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
    formState: { errors, isSubmitSuccessful },
  }  = useForm({
    resolver: yupResolver(registerSchema),
  });
 
  const onSubmit = async (formData: any) => {
    const dataWithRole = { 
      ...formData, 
      phone: `${callingCode}${formData.phone}`,
      firstname: `youssef`,
      lastname: `anibar`,
    };
    const response = await axios.post(JAVA_API + `auth/register`, dataWithRole);
    console.log("Registration Response:", response.data);
    let email = dataWithRole.email;
    let phone = dataWithRole.phone;
    navigate(screens.otpverification, { email, action: 'login', phone});
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
              onChangeText={onChange} // just the digits
              onSelectCode={(code) => setCallingCode(code)} // 👈 update when user changes country
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

        <Button
          filled
          loading={isLoading}
          title={t('signUp.createMyAccount')}
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
        />      
      </View>
    </SafeAreaView>
    
  );
};

export default SignUp;
