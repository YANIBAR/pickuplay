import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { COLORS, FONTS, icons } from '@constants';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Icon, Text } from '@components';
import styles from './styles';

interface NavigationTarget {
  screen: string;
  params?: Record<string, any>;
}

interface HeaderProps {
  title?: string;
  target?: NavigationTarget | string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, target, children }) => {
  const navigation = useNavigation<NavigationProp<any>>();

  const handleBack = () => {
    if (!target) return navigation.goBack();

    if (typeof target === 'string') {
      navigation.navigate(target);
    } else {
      navigation.navigate(target.screen, target.params);
    }
  };

  return (
    <View style={[styles.container]}>
      <TouchableOpacity onPress={handleBack}>
        <Image
          source={icons.back as ImageSourcePropType}
          resizeMode="contain"
          style={styles.backIcon}
        />
      </TouchableOpacity>
      {title && <Text style={FONTS.h3}>{title}</Text>}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {children}
      </View>
    </View>
  );
};

export default Header;