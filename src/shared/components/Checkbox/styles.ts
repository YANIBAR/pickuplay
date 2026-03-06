import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  checkbox: {
    height: 18,
    width: 18,
    borderRadius: 4,
    borderColor: COLORS.grayscale300,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale200
  },
  errorContainer: {
    marginVertical: 1,
    paddingLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: SIZES.h5,
    color: COLORS.error,
  },
  checked: {
    height: 11,
    width: 12,
    borderRadius: 2,
    borderWidth: 0,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  squareCheckbox: {
    width: 18,
    height: 18,
    tintColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
});
