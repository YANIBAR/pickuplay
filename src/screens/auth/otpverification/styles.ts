import { StyleSheet } from 'react-native';
import { COLORS } from '@constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  area: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  title: {
    marginVertical: 54,
    color: COLORS.grayscale900,
  },
  inputStyles: {
    borderRadius: 6,
    height: 48,
    width: 48,
    backgroundColor: COLORS.white,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.4,
    borderWidth: 0.4,
    borderColor: COLORS.grayscale400,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    justifyContent: 'center',
  },
  code: {
    fontSize: 18,
    color: COLORS.grayscale900,
    textAlign: 'center',
  },
  time: {
    fontSize: 18,
    color: COLORS.primary,
  },
  resendBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
