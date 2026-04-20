import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Header,
  View,
} from '@components';
import { COLORS } from '@constants';
import { useTranslation } from 'react-i18next';
import styles from './styles';
import EditProfileForm from './EditProfileForm';


const EditProfile = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState('');
  const [showgameModal, setShowgameModal] = useState(false);
 

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        <Header title={t('editProfile.title')} />
        <EditProfileForm onShowgame={() => setShowgameModal(true)}/>
      </View>
    </SafeAreaView>
  );
  
};

export default EditProfile;
