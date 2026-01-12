import React from 'react';
import { Button, Icon, ModalBase, Text, View } from '@components';
import { useTranslation } from 'react-i18next';
import styles from './styles';
import { illustrations } from '@constants';
import { Image } from 'react-native';

interface Props {
  title?: string;
  visible: boolean;
  message?: string;
  onClose?: () => void;
}

const Component: React.FC<Props> = ({
  title,
  visible,
  onClose,
  message,
  ...props
}: Props) => {
  const { t } = useTranslation();

  return (
    <ModalBase visible={visible} onClose={onClose} title={title} message={message} {...props}>
      <View style={styles.card}>
      <Image
            source={illustrations.passwordFailed}
            resizeMode="contain"
            style={styles.illustration}
          />
        <View style={styles.cardContent}>
          <Text
            size="lg"
            align="center"
            style={styles.title}
          >{title || t('c.messages.oops')}</Text>
          <Text
            size="sm"
            align="center"
          >{message } moeoepro</Text>
        </View>
        <Button
          onPress={onClose}
          style={styles.cancel}
          title={t('c.labels.cancel')}
        />
      </View>
    </ModalBase>
  );
};

export default Component;
