import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 5,
    paddingHorizontal: SIZES.padding,
  },
  item: {
    padding: 10,
    flexDirection: 'row',
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding2,
    borderRadius: 30,
    borderWidth: 1,
    marginVertical: 5,
    flexDirection: 'row',
    height: 52,
    alignItems: 'center',
  },
  downIcon: {
    width: 10,
    height: 10,
    tintColor: '#111',
  },
  flagContainer: {
    width: 90,
    height: 50,
    borderRadius: 30,
    marginHorizontal: 5,
    flexDirection: 'row',
  },
  flagIcon: {
    width: 30,
    height: 30,
  },
  input: {
    flex: 1,
    fontFamily: 'Urbanist-ExtraLight',
    fontSize: SIZES.h4,
    color: COLORS.black,
    height: 52,
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
