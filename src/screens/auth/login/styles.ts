import { Dimensions, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  logo: {
    width: 300,
    height: 75,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Dimensions.get('screen').height / 10,
  },
  title: {
    fontSize: 22,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 12,
    right: 0,
    left: 0,
  },
  button: {
    marginVertical: 6,
    width: SIZES.width - 32,
  },
  forgotPasswordBtnText: {
    fontSize: 15,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  }
});
