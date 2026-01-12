import React from 'react';
import { View, Text, Image } from 'react-native';
import { COLORS, illustrations } from '@constants';
import styles from './styles';

const NoHistory = () => {
  return (
    <View style={styles.container}>
      <Image
        source={illustrations.notFound}
        resizeMode="contain"
        style={styles.notFound}
      />
      <Text
        style={[
          styles.title,
          {
            color: COLORS.black,
          },
        ]}>
        You Have No History Yet
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: COLORS.black,
          },
        ]}>
        When tracking history appear, you will see them here
      </Text>
    </View>
  );
};

export default NoHistory;
