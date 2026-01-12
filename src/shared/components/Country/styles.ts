import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding2,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 5,
    flexDirection: 'row',
    height: 52,
    alignItems: 'center',
  },
  label: {
    marginBottom: 5,
    color: COLORS.black,
    paddingHorizontal: SIZES.padding,
  },
  icon: {
    marginRight: 10,
    height: 20,
    width: 20,
    tintColor: '#BCBCBC',
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
});
