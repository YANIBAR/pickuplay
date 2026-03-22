import React, { useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '@constants';

export type IconType =
  | 'entypo'
  | 'feather'
  | 'octicons'
  | 'ionicons'
  | 'antDesign'
  | 'evilIcons'
  | 'fontAwesome'
  | 'fontAwesome5'
  | 'materialIcons'
  | 'materialCommunityIcons';

interface Props {
  type: IconType;
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const ICONS = {
  entypo: Entypo,
  feather: Feather,
  ionicons: Ionicons,
  octicons: Octicons,
  evilIcons: EvilIcons,
  antDesign: AntDesign,
  fontAwesome: FontAwesome,
  fontAwesome5: FontAwesome5,
  materialIcons: MaterialIcons,
  materialCommunityIcons: MaterialCommunityIcons,
};

const Component: React.FC<Props> = ({
  type,
  name,
  size = 20,
  color = COLORS.black,
  style,
}: Props) => {
  const Icon = useMemo(() => ICONS[type], [type]);
  return <Icon name={name} size={size} color={color} style={style} />;
};

export default Component;
