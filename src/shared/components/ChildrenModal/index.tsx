import React, { ReactNode } from 'react';
import {
  View,
  Modal,
  ModalProps,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import styles from './styles';

interface Props extends ModalProps {
  visible: boolean;
  children?: ReactNode;
  onClose?: () => void;
  closeOnClickOutside?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const Component: React.FC<Props> = ({
  visible,
  onClose,
  children,
  containerStyle,
  closeOnClickOutside,
}: Props) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      {closeOnClickOutside ? (
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={1}
          style={[styles.container, containerStyle]}>
          <TouchableOpacity activeOpacity={1}>{children}</TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <View style={[styles.container, containerStyle]}>
          <View>{children}</View>
        </View>
      )}
    </Modal>
  );
};

export default Component;
