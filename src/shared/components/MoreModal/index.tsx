import React, { ReactNode } from 'react';
import {
  Modal,
  ModalProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import styles from './styles';
import { COLORS } from '@constants';

interface Props extends ModalProps {
  title?: string;
  visible: boolean;
  withLogo?: boolean;
  children?: ReactNode;
  onClose?: () => void;
  titleStyle?: TextStyle;
  closeIconStyle?: ViewStyle;
}

const Component: React.FC<Props> = ({
  title,
  visible,
  onClose,
  withLogo,
  titleStyle,
  closeIconStyle,
  children,
  ...props
}: Props) => (
  <Modal transparent visible={visible} {...props}>
  <TouchableOpacity style={styles.modalOverlay} activeOpacity={0} onPress={onClose}>
    <View 
      style={{ 
        position: "absolute", 
        top: 24, 
        right: 24
      }}
    >
      <View style={{
        width: 202,
        padding: 16,
        backgroundColor: COLORS.tertiaryWhite,
        borderRadius: 8
      }}>
        {children}
      </View>
    </View>
  </TouchableOpacity>
</Modal>
);

export default Component;
