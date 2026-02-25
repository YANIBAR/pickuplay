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

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title, target }) => {
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: COLORS.white,
        },
      ]}>
      <TouchableOpacity onPress={() => target ? navigation.navigate(target) : navigation.goBack()}>
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
