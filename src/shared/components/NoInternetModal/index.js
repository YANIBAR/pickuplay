import React from 'react';
import { Image } from 'react-native';
import { ModalBase, Text, View } from '@components';
import { useTranslation } from 'react-i18next';
import styles from './styles';

const Component = () => {
  const { t } = useTranslation();

  return (
    <ModalBase containerStyle={styles.containerStyle}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Image
            resizeMode="cover"
            style={styles.logo}
            source={require('@assets/images/internet.png')}
          />
          <Text size="xl" align="center" style={styles.title}>
            {t('c.messages.offline')}
          </Text>
          <Text size="md" align="center">
            {t('c.messages.noConnection')}
          </Text>
        </View>
      </View>
    </ModalBase>
  );
};

export default Component;
