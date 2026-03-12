import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import { COLORS, icons } from '@constants';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Text } from '@components';
import styles from './styles';

interface NavigationTarget {
  screen: string;
  params?: Record<string, any>;
}

interface HeaderProps {
  title?: string;
  target?: NavigationTarget | string;
}

const Header: React.FC<HeaderProps> = ({ title, target }) => {
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
    <View style={[styles.container, { backgroundColor: COLORS.white }]}>
      <TouchableOpacity onPress={handleBack}>
        <Image
          source={icons.back as ImageSourcePropType}
          resizeMode="contain"
          style={styles.backIcon}
        />
      </TouchableOpacity>
      {title && <Text style={styles.title}>{title}</Text>}
    </View>
  );
};

export default Header;