import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Header, TextInput, Button, Row, Column, Card } from '@components';
import { Controller, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { authSelector, userRegister } from '../../../app/slices/auth';
import { COLORS, screens  } from '@constants';
import { useTranslation } from 'react-i18next';
import styles from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '@components/Input';

type Nav = {
  navigate: (value: string) => void;
};
const Payment = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLoading } = useSelector(authSelector);
  const { navigate } = useNavigation<Nav>();
  const {
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm();

  const onSubmit = async (formData: any) => {
    const dataWithRole = { 
      ...formData, 
    };
    dispatch(userRegister(formData) as any);
    let email = dataWithRole.email;
    navigate(screens.games);
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.white }]}>
      <Header title={'Payment'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card
            containerStyle={styles.card}
            number="•••• •••• •••• ••••"
            balance="10000"
            date="11/2029"
        />
        <Text style={styles.title}>{t('payment')}</Text>

        <Input
          id="cardHolderName"
          onInputChanged={(value) => {
            // Handle input change if needed
          }}
          placeholder={t('payment.cardHolderName')}
          placeholderTextColor={COLORS.black}
        />
        
        <Input
          id="CardNumber"
          onInputChanged={(value) => {
            // Handle input change if needed
          }}
          placeholder={t('payment.cardNumber')}
          placeholderTextColor={COLORS.black}
        />

        <Row>
          <Column style={{ flex: 0.5, marginRight: 5 }}>
            <Input
              id="ExpireDate"
              onInputChanged={(value) => {
                // Handle input change if needed
              }}
              placeholder={t('payment.expireDate')}
              placeholderTextColor={COLORS.black}
            />
          </Column>
          <Column style={{ flex: 0.5, marginLeft: 5 }}>
            <Input
              id="cvv"
              onInputChanged={(value) => {
                // Handle input change if needed
              }}
              placeholder={t('payment.CVV')}
              placeholderTextColor={COLORS.black}
            />
          </Column>
        </Row>
        <Button
          filled
          loading={isLoading}
          title={t('signUp.createMyAccount')}
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

  export default Payment