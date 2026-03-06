import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  area: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  password: {
    width: 276,
    height: 250,
  },
  passwordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  title: {
    fontSize: 15,
    //fontFamily: 'medium',
    color: COLORS.grayscale900,
  },
  methodContainer: {
    width: SIZES.width - 32,
    height: 112,
    borderRadius: 32,
    borderColor: 'gray',
    borderWidth: 0.3,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.tansparentPrimary,
    marginHorizontal: 16,
  },
  icon: {
    width: 32,
    height: 32,
    tintColor: COLORS.primary,
  },
  methodTitle: {
    fontSize: 14,
    //fontFamily: 'medium',
    color: COLORS.grayscale600,
  },
  methodSubtitle: {
    fontSize: 16,
    //fontFamily: 'bold',
    color: COLORS.black,
    marginTop: 12,
  },
  button: {
    borderRadius: 32,
    marginVertical: 22,
  },
});
