import React, { ReactNode } from 'react';
import {
  Modal,
  ModalProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { View } from 'react-native';
import styles from './styles';
import { ActivityIndicator, Text } from '..';

interface Props extends ModalProps {
  size?: number | 'small' | 'large';
  color?: string;
  visible?: boolean;
  textContent?: string;
  textStyle?: StyleProp<TextStyle>;
  indicatorStyle?: StyleProp<ViewStyle>;
  overlayColor?: string;
  children?: ReactNode;
}

const Component = ({
  size = 'large',
  color = '#fff',
  visible,
  textContent,
  textStyle,
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  indicatorStyle,
  children,
  ...props
}: Props) => {
  return (
    <Modal transparent visible={visible} {...props}>
      <View style={[styles.container, { backgroundColor: overlayColor }]}>
        {children ? (
          children
        ) : (
          <>
            <ActivityIndicator
              color={color}
              size={size}
              style={indicatorStyle}
            />
            {textContent && (
              <Text style={[styles.textContent, textStyle]}>{textContent}</Text>
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

export default Component;
