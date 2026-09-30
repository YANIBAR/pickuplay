import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@components';
import { COLORS } from '@constants';

interface NumericInputops {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  icon?: string; // materialCommunityIcons name shown next to the count
}

export default function NumericInput({
  value,
  onChange,
  min = 1,
  max = Infinity,
  icon = 'account-multiple',
}: NumericInputops) {
  const current = parseInt(String(value)) || min;

  const handleDecrement = () => {
    if (current > min) {
      onChange(current - 1);
    }
  };

  const handleIncrement = () => {
    if (current < max) {
      onChange(current + 1);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.counterButton, current <= min && styles.counterButtonDisabled]}
        onPress={handleDecrement}
        disabled={current <= min}
      >
        <Icon
          type="materialCommunityIcons"
          name="minus"
          size={24}
          color="white"
        />
      </TouchableOpacity>

      <View style={styles.playerCountDisplay}>
        <Icon
          type="materialCommunityIcons"
          name={icon}
          size={16}
          color={COLORS.primary}
        />
        <Text style={styles.playerCountText}>{current}</Text>
      </View>

      <TouchableOpacity
        style={[styles.counterButton, current >= max && styles.counterButtonDisabled]}
        onPress={handleIncrement}
        disabled={current >= max}
      >
        <Icon
          type="materialCommunityIcons"
          name="plus"
          size={24}
          color="white"
        />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  playerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    elevation: 3,
  },
  counterButtonDisabled: {
    opacity: 0.4,
  },
  playerCountDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  playerCountText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});