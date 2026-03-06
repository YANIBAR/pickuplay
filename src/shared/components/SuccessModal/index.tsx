import React, { FC } from 'react';
import { Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Text, View } from '@components';
import { COLORS, illustrations } from '@constants';
import styles from './styles';

interface ModalProps {
  title?: string;
  visible: boolean;
  message?: string;
  onClose?: () => void;
}

const Component: FC<ModalProps> = ({
  title,
  visible,
  onClose,
  message,
  ...rest
}) => {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} animationType="fade" onClose={onClose} {...rest}>
      <View style={[styles.container]}>
        <View
          style={[
            styles.modalSubContainer,
            {
              backgroundColor: COLORS.secondaryWhite,
            },
          ]}>
          <Image
            source={illustrations.passwordSuccess}
            resizeMode="contain"
            style={styles.illustration}
          />
          <Text style={styles.title}>{title || 'Congratulations!'}</Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: COLORS.grayscale600,
              },
            ]}>
            {message ||
              'Your account is ready to use. You will be redirected to the Home page in a few seconds..'}
          </Text>
          <Button
            filled
            onPress={onClose}
            style={styles.button}
            title={t('c.continue')}
          />
        </View>
      </View>
    </Modal>
  );
};

export default Component;
