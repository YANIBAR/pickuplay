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
    navigate(screens.activities);
  };


  return (
    <View style={[styles.container, { backgroundColor: COLORS.white }]}>
      <Header title={t('payment')} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card
            containerStyle={styles.card}
            number="•••• •••• •••• ••••"
            balance="10000"
            date="11/2029"
        />
        <Text style={styles.title}>{t('payment')}</Text>
        
        <Controller
          name="cardHolderName"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType="card-holder-name"
              placeholder={t('payment.cardHolderName')}
            />
          )}
        />
        
        <Controller
          name="CardNumber"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType="card-number"
              placeholder={t('payment.cardNumber')}
            />
          )}
        />

        <Row>
          <Column style={{ flex: 0.5, marginRight: 5 }}>
            <Controller
              name="ExpireDate"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t('payment.expireDate')}
                />
              )}
            />
          </Column>
          <Column style={{ flex: 0.5, marginLeft: 5 }}>
            <Controller
              name="cvv"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t('payment.CVV')}
                />
              )}
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
    </View>
  );
};

  export default Payment