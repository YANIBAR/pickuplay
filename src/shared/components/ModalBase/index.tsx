import React, { ReactNode } from 'react';
import {
  View,
  Modal,
  ModalProps,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Button, Text } from '@components';
import styles from './styles';
import { COLORS  } from '@constants';

interface Props extends ModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose?: () => void;
  closeOnClickOutside?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const Component: React.FC<Props> = ({
  visible,
  onClose,
  title,
  message,
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
          <TouchableOpacity activeOpacity={1}>
          <View style={[styles.modalSubContainer]}>
              <Text style={styles.title}>{ title }!</Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: COLORS.grayscale600,
                  },
                ]}>
                { message }
              </Text>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <View style={[styles.container]}>
        <View
          style={[
            styles.modalSubContainer,
            {
              backgroundColor: COLORS.secondaryWhite,
            },
          ]}>
              <Text style={styles.title}>{ title }!</Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: COLORS.grayscale600,
                  },
                ]}>
                { message }
              </Text>
              <Button
                title="Close"
                filled
                style={{
                  width: '100%',
                  marginTop: 12,
                }}
                onPress={onClose}
              />
          </View>
        </View>
      )}
    </Modal>
  );
};

export default Component;
