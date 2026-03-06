import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    color: COLORS.grayscale600,
    paddingRight: 30,
    height: 52,
    width: SIZES.width - 32,
    alignItems: 'center',
    backgroundColor: COLORS.grayscale500,
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    color: COLORS.grayscale600,
    paddingRight: 30,
    height: 52,
    width: SIZES.width - 32,
    alignItems: 'center',
    backgroundColor: COLORS.grayscale500,
  },
  placeholder: {
    fontSize: 13,
    fontFamily: 'Urbanist-light',
    color: COLORS.gray,
  },
});
