import { StyleSheet } from 'react-native';
import { COLORS } from '@constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputStyles: {
    borderWidth: 1,
    borderRadius: 4,
    textAlign: 'center',
    fontFamily: 'Ruda',
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray,
    marginHorizontal: 8,
  },
});
