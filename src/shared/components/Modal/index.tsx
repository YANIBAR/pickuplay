import React, { ReactNode } from 'react';
import {
  Modal,
  ModalProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Icon, Logo, Text } from '@components';
import styles from './styles';

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
  <Modal transparent visible={visible} animationType="fade" {...props}>
    <View style={styles.modal}>
      <View style={styles.dialog}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>{withLogo && <Logo />}</View>
          <View style={styles.titleContainer}>
            {title && (
              <Text size="lg" style={[styles.title, titleStyle]}>
                {title}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Icon
              size={20}
              name="close"
              type="materialIcons"
              style={closeIconStyle}
            />
          </TouchableOpacity>
        </View>
        <View>{children}</View>
      </View>
    </View>
  </Modal>
);

export default Component;
