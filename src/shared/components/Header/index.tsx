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
  game?: any; // Replace with actual game type
  userData?: any; // Replace with actual user data type
  isLogged?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, target, game, userData, isLogged }) => {
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
        <TouchableOpacity
          //onPress={() => setShareModalVisible(true)}
          style={styles.iconBtn}
          activeOpacity={0.75}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Icon type="materialCommunityIcons" name="share-variant" />
        </TouchableOpacity>

        {(userData?.id == game?.creatorId && isLogged) && (
          <TouchableOpacity
            onPress={() => navigation.navigate("editGame", { game })}
            style={styles.iconBtn}
            activeOpacity={0.75}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon type="feather" name="edit" />
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
};

export default Header;