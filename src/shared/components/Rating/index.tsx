import React, { FC } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Icon } from '@components';
import styles from './styles';

interface RatingProps {
  color: string;
  size?: number;
  rating: number;  // Accept rating as a prop instead of using internal state
  onChange: (value: number) => void;  // Accept callback function
}

const Rating: FC<RatingProps> = ({ color, size = 30, rating, onChange }) => {
  const handleRating = (value: number) => {
    onChange(value);  // Call the parent's onChange handler
  };

  const renderRatingIcons = () => {
    const maxRating = 5;
    const ratingIcons = [];

    for (let i = 1; i <= maxRating; i++) {
      const iconName = i <= rating ? 'star' : 'staro';

      ratingIcons.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRating(i)}
          style={styles.iconContainer}>
          <Icon type="antDesign" name={iconName} size={size} color={color} />
        </TouchableOpacity>,
      );
    }

    return ratingIcons;
  };

  return (
    <View style={styles.container}>
      <View style={styles.ratingIcons}>{renderRatingIcons()}</View>
    </View>
  );
};

export default Rating;