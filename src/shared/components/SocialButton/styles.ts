import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    height: 54,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 22,
    borderRadius: 30,
    borderColor: 'gray',
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 12,
  },
  icon: {
    height: 24,
    width: 24,
    marginRight: 32,
  },
  title: {
    fontSize: 14,
    fontFamily: 'semiBold',
    color: COLORS.black,
  },
  text: {
    fontSize: SIZES.h4,
  },
});
