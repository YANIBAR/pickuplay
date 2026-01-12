import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, Checkbox, Button, TextInput, View, Text, Phone } from '@components';
import { COLORS, SIZES, icons, images, screens } from '@constants';
import styles from './styles';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';

import { API_BACKEND_URL, OTP_API_KEY } from '@env';
type Nav = {
  navigate: (value: string) => void;
};



const ForgotPasswordPhoneNumber = () => {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [callingCode, setCallingCode] = useState('+1'); // default US

  useEffect(() => {
    fetch('https://restcountries.com/v2/all')
      .then(response => response.json())
      .then(data => {
        let areaData = data.map((item: any) => {
          return {
            code: item.alpha2Code,
            item: item.name,
            callingCode: `+${item.callingCodes[0]}`,
            flag: `https://flagsapi.com/${item.alpha2Code}/flat/64.png`,
          };
        });

        setAreas(areaData);
        if (areaData.length > 0) {
          let defaultData = areaData.filter((a: any) => a.code == 'US');

          if (defaultData.length > 0) {
            setSelectedArea(defaultData[0]);
          }
        }
      });
  }, []);
 const sendOTP = async () => {
  try {
    setLoading(true);

    // Construct the full phone number with country code
    const phoneValue = control._formValues.phone || '';
    const fullPhoneNumber = `${callingCode}${phoneValue}`;

    console.log(`${API_BACKEND_URL}/auth/send-otp/`, fullPhoneNumber);

    // Call NestJS backend endpoint
    const response = await axios.post(
      `${API_BACKEND_URL}/auth/send-otp/`, {
        phone: fullPhoneNumber
      }
    );

    console.log('OTP sent successfully:', response.data);
    alert('OTP sent successfully via SMS!');
    
    // Navigate to OTP verification screen
    navigate(screens.otpverification, { fullPhoneNumber, action: 'resetPassword' });
  } catch (error) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    
    // Show user-friendly error message
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Failed to send OTP. Please try again.';
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};


  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={{
          padding: 10,
          flexDirection: 'row',
        }}
        onPress={() => {
          setSelectedArea(item), setModalVisible(false);
        }}>
        <Image
          source={{ uri: item.flag }}
          resizeMode="contain"
          style={{
            height: 30,
            width: 30,
            marginRight: 10,
          }}
        />
        <Text style={{ fontSize: 16, color: '#fff' }}>{item.item}</Text>
      </TouchableOpacity>
    );
  };

  const RenderAreasCodesModal = () => {
    return (
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                height: 400,
                width: SIZES.width * 0.8,
                backgroundColor: COLORS.primary,
                borderRadius: 12,
              }}>
              <FlatList
                data={areas}
                renderItem={renderItem}
                horizontal={false}
                keyExtractor={item => item.code}
                style={{
                  padding: 20,
                  marginBottom: 20,
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
      <View style={[styles.container, { backgroundColor: COLORS.white }]}>
        <Header title={t('forgotPwdPhone.title')} />
        <ScrollView
          style={{ marginVertical: 54 }}
          showsVerticalScrollIndicator={false}>
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
            {t('forgotPwdPhone.enterPhone')}
          </Text>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: COLORS.greyscale500 },
            ]}>
            {/* Phone Number Text Input */}
            
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
          </View>

          <Button
            filled
            title={t('forgotPwdPhone.resetPassword')}
            onPress={sendOTP}
            style={styles.button}
          />
          <TouchableOpacity onPress={() => navigate('login')}>
            <Text style={styles.forgotPasswordBtnText}>
              {t('forgotPwdPhone.rememberPassword')}
            </Text>
          </TouchableOpacity>
          <View></View>
        </ScrollView>
        <View style={styles.bottomContainer}>
          <Text
            style={[
              styles.bottomLeft,
              {
                color: COLORS.black,
              },
            ]}>
            {t('forgotPwdPhone.noAccount')}
          </Text>
          <TouchableOpacity onPress={() => navigate('register')}>
            <Text style={styles.bottomRight}>{t('forgotPwdPhone.signUp')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {RenderAreasCodesModal()}
    </SafeAreaView>
  );
  
};

export default ForgotPasswordPhoneNumber;
