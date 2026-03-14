import React from 'react';
import { Button, Modal, ModalBase, Text, View } from '@components';
import { useTranslation } from 'react-i18next';
import styles from './styles';
import RBSheet from 'react-native-raw-bottom-sheet';
import { TouchableOpacity } from 'react-native';

interface Props {
  visible: boolean;
  onCancel?: () => void;
  onLogout?: () => void;
}

const Component: React.FC<Props> = ({ visible, onLogout, onCancel }: Props) => {
  const { t } = useTranslation();
  return (
    
    <Modal transparent visible={visible} animationType="fade">
      <RBSheet
        ref={refRBSheet}
        closeOnPressMask={true}
        height={240}
        customStyles={{
          wrapper: {
            backgroundColor: "rgba(0,0,0,0.5)",
          },
          draggableIcon: {
            backgroundColor: COLORS.grayscale200,
            height: 4
          },
          container: {
            borderTopRightRadius: 32,
            borderTopLeftRadius: 32,
            height: 240,
            backgroundColor: COLORS.white
          }
        }}>
        <Text style={styles.bottomTitle}>Logout</Text>
        <View style={[styles.separateLine, {
          backgroundColor: COLORS.grayscale200,
        }]} />
        <Text style={[styles.bottomSubtitle, {
          color: COLORS.black
        }]}>Are you sure you want to log out?</Text>
        <View style={styles.bottomContainer}>
          <Button
            title="Cancel"
            style={{
              width: (SIZES.width - 32) / 2 - 8,
              backgroundColor: COLORS.tansparentPrimary,
              borderRadius: 32,
              borderColor: COLORS.tansparentPrimary
            }}
            textColor={COLORS.primary}
            onPress={() => refRBSheet.current.close()}
          />
          <Button
            title="Yes, Logout"
            filled
            style={styles.logoutButton}
            onPress={() => refRBSheet.current.close()}
          />
        </View>
      </RBSheet>
      <TouchableOpacity
        onPress={onCancel}
        activeOpacity={1}
        style={styles.container}>
        <View style={styles.header}>
          <Text size="2xl">{t('c.labels.logout')}</Text>
        </View>
        <View style={styles.body}>
          <Text size="lg" style={styles.message}>
            {t('c.messages.logout')}
          </Text>
        </View>
        <View style={styles.footer}>
          <Button
            onPress={onCancel}
            title={t('c.labels.cancel')}
            titleStyle={styles.closeTitleStyle}
            style={[styles.button, styles.cancel]}
          />
          <Button
            onPress={onLogout}
            title={t('c.labels.logout')}
            titleStyle={styles.confirmTitleStyle}
            style={[styles.button, styles.confirmButton]}
          />
        </View></TouchableOpacity>
    </Modal>
  );
};

export default Component;
