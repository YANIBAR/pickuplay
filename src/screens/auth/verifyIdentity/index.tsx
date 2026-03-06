import React from 'react';
import { Image, ScrollView } from 'react-native';
import { View, Text, Header, Button } from '@components';
import { useNavigation } from '@react-navigation/native';
import { COLORS, illustrations } from '@constants';
import styles from './styles';
import { useTranslation } from 'react-i18next';

type Nav = {
  navigate: (value: string) => void;
};

const VerifyYourIdentity = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();

  return (
    <>
      <View style={[styles.container, { backgroundColor: COLORS.white }]}>
        <Header title="" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text
            style={[
              styles.title,
              {
                color: COLORS.grayscale900,
              },
            ]}
          >
            {t('verifyIdentity.title')}
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: COLORS.grayscale900,
              },
            ]}
          >
            {t('verifyIdentity.subtitle')}
          </Text>
          <View style={styles.identityContainer}>
            <Image
              source={illustrations.identity}
              resizeMode="cover"
              style={styles.identityImage}
            />
          </View>
        </ScrollView>
      </View>
      <View style={styles.bottomContainer}>
        <Button
          filled
          title={t('verifyIdentity.buttonText')}
          style={styles.button}
          onPress={() => navigate('proofofresidency')}
        />
      </View>
    </>
  );
  
};

export default VerifyYourIdentity;
