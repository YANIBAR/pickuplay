import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Icon, Text, View } from '@components';
import { withTranslate } from '@hocs';
import { TFunction } from 'i18next';
import styles from './styles';

interface Props {
  title?: string;
  titleStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  t?: TFunction<'translation', undefined>;
}

const Component: React.FC<Props> = ({
  t,
  title,
  titleStyle,
  containerStyle,
}: Props) => (
  <View style={[styles.container, containerStyle]}>
    <Icon type="feather" name="inbox" />
    <Text size="h5" style={[styles.title, titleStyle]}>
      {(t && t('c.messages.noData')) || title}
    </Text>
  </View>
);
export default withTranslate(Component);
