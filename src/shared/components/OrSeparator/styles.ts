import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.grayscale700,
  },
  orText: {
    fontSize: SIZES.h4,
    marginHorizontal: 10,
    color: COLORS.gray,
    textAlign: 'center',
  },
});
