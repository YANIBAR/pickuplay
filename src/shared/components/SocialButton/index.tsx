import React, { FC } from 'react';
import { TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { COLORS } from '@constants';
import styles from './styles';
import { Text } from '@components';

interface SocialButtonProps {
  icon: ImageSourcePropType;
  text?: string;
  onPress: () => void;
  tintColor?: string;
  disabled?: boolean;
}

const SocialButton: FC<SocialButtonProps> = ({
  icon,
  text,
  onPress,
  tintColor,
  disabled,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: COLORS.white,
          borderColor: COLORS.grayscale200,
        },
        disabled && { opacity: 0.5 },
      ]}>
      <Image
        source={icon}
        resizeMode="contain"
        style={[
          styles.icon,
          {
            tintColor: tintColor,
          },
        ]}
      />
      {text && (
        <Text size="h4" align="left">
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};
export default SocialButton;
