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
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.black,
    marginVertical: 5,
    flexDirection: 'row',
    height: SIZES.InputHeight,
    alignItems: 'center',
  },
  label: {
    marginBottom: 5,
    paddingHorizontal: SIZES.padding,
  },
  icon: {
    marginRight: 10,
    height: 20,
    width: 20,
    marginLeft: 10,
    tintColor: '#BCBCBC',
  },
  toggle: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    height: 20,
    width: 20,
    tintColor: '#BCBCBC',
  },
  input: {
    flex: 1,
    fontFamily: 'Urbanist-ExtraLight',
    fontSize: SIZES.h4,
    color: COLORS.black,
    height: 52,
    borderColor: COLORS.black
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
