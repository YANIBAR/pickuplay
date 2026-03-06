import { COLORS, SIZES } from '@constants';
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './styles';

interface VerificationMethodProps {
  icon: any;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}

const VerificationMethod: React.FC<VerificationMethodProps> = ({ icon, name, isSelected, onSelect }) => {

  return (
    <TouchableOpacity style={[styles.container, {
      borderColor: COLORS.grayscale200,
      backgroundColor: COLORS.white
    }]} onPress={onSelect}>
      <View style={styles.iconContainer}>
        <Image source={icon} style={styles.icon} />
      </View>
      <Text style={[styles.name, {
        color: COLORS.grayscale900
      }]}>{name}</Text>
      <View style={styles.checkboxContainer}>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <View style={styles.checkboxInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};


export default VerificationMethod;