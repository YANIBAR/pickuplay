// ConfirmModal.tsx
import React, { useRef, useEffect } from 'react';
import { Button, Text, View } from '@components';
import { useTranslation } from 'react-i18next';
import styles from './styles';
import RBSheet from 'react-native-raw-bottom-sheet';
import { COLORS, SIZES } from '@constants';

interface Props {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const ConfirmModal: React.FC<Props> = ({ 
  visible, 
  title = 'Confirmation',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm, 
  onCancel 
}: Props) => {
  const { t } = useTranslation();
  const refRBSheet = useRef<RBSheet>(null);

  useEffect(() => {
    if (visible) {
      refRBSheet.current?.open();
    } else {
      refRBSheet.current?.close();
    }
  }, [visible]);

  const handleCancel = () => {
    refRBSheet.current?.close();
    onCancel?.();
  };

  const handleConfirm = () => {
    refRBSheet.current?.close();
    onConfirm?.();
  };

  return (
    <RBSheet
      ref={refRBSheet}
      closeOnPressMask={true}
      onClose={onCancel}
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
      <Text style={styles.bottomTitle}>{title}</Text>
      <View style={[styles.separateLine, {
        backgroundColor: COLORS.grayscale200,
      }]} />
      <Text style={[styles.bottomSubtitle, {
        color: COLORS.black
      }]}>{message}</Text>
      <View style={styles.bottomContainer}>
        <Button
          title={confirmText}
          filled
          style={styles.logoutButton}
          onPress={handleConfirm}
        />
        <Button
          title={cancelText}
          style={{
            width: (SIZES.width - 32) / 2 - 8,
            backgroundColor: COLORS.transparentPrimary,
            borderRadius: 32,
            borderColor: COLORS.transparentPrimary
          }}
          textColor={COLORS.primary}
          onPress={handleCancel}
        />
      </View>
    </RBSheet>
  );
};

export default ConfirmModal;