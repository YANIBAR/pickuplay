import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 28,
    color: COLORS.greyscale900,
    textAlign: 'center',
    marginVertical: 22,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.greyscale900,
    textAlign: 'center',
    paddingHorizontal: 3,
  },
  button: {
    marginTop: 12,
    width: SIZES.width - 32,
    borderRadius: 32,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 28,
    right: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  identityContainer: {
    marginVertical: 72,
    alignItems: 'center',
  },
  identityImage: {
    height: 350,
    width: 363,
  },
});
