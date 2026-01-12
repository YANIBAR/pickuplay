import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import {
  Header,
  TextInput,
  Button,
  Icon,
  View,
  Text,
  Row,
  Column,
  Country,
} from '@components';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS, icons, images, screens } from '@constants';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { userRegister } from '../../app/slices/auth';
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BACKEND_URL } from '@env';
import axios from 'axios';        
import EditProfileForm from './EditProfileForm';
import ActivityModal from './ActivityModal';

interface FormData {
  firstname?: string;
  lastname?: string;
  username?: string;
  email?: string;
  country?: string;
  accept?: boolean;
}

type Nav = {
  navigate: (value: string) => void;
};

const EditProfile = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState('');
  const [showActivityModal, setShowActivityModal] = useState(false);


  useEffect(() => {
    const getUser = async () => {
        const email = await AsyncStorage.getItem('email');
        const response = await axios.get(API_BACKEND_URL + '/user/getUser/?email=' + email);
        setUser(response.data);
    };
    getUser();
  }, []);
  
    const handleActivityUpdate = (data) => {
      console.log('Activity updated:', data);
      setShowActivityModal(false);
      //toast.success('Activity updated successfully!');
    };  

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <Header title={t('editProfile.title')} />
        <EditProfileForm onShowActivity={() => setShowActivityModal(true)}/>
      </View>
    </SafeAreaView>
  );
  
};

export default EditProfile;
