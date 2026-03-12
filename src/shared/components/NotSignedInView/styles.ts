import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../../constants';

export default StyleSheet.create({
  button: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZES.width / 2,
  },
  text: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    fontFamily: 'Urbanist-light',
    textTransform: 'uppercase',
  },
});
