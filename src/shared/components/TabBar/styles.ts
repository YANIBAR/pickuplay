import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '@constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    height: 70,
    paddingBottom: Platform.OS === 'ios' ? 10 : 6,
    paddingTop: 6,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Android Shadow
    elevation: 10,
  },
  item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  label: {
    textTransform: 'capitalize',
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
  },
  centerItem: {
    alignItems: 'center',
    // Push the button above the bar
    marginBottom: 44,
    backgroundColor: COLORS.white,
    padding: 6,
    width: 70,
    height: 70,
    borderRadius: 70,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // iOS Shadow
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    // Android Shadow
    elevation: 8,
  },
});