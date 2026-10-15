import { Dimensions, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  logo: {
    width: 240,
    height: 75,
  },
  icon: {
    height: 140,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Dimensions.get('screen').height / 10,
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
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray, // adjust to your color constant
  },
  dividerText: {
    marginHorizontal: 10,
    color: COLORS.gray,
    fontSize: 14,
},
});
