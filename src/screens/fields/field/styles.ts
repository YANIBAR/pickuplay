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
    textAlign: 'center',
    marginVertical: 22,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 3,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  scanView: {
    alignItems: 'center',
    marginVertical: 64,
  },
  scanContainer: {
    width: 332,
    height: 332,
    borderRadius: 32,
    backgroundColor: COLORS.grayscale100,
  },
  cardImage: {
    width: 340,
    height: 340,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 28,
    right: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 64,
  },
  btn: {
    height: 56,
    width: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayscale100,
  },
  btnIcon: {
    height: 20,
    width: 20,
    tintColor: COLORS.primary,
  },
  cameraBtn: {
    height: 108,
    width: 108,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    height: 44,
    width: 44,
    tintColor: COLORS.white,
  },
  camera: {
    width: SIZES.width - 32,
    height: SIZES.width - 32,
  },
});
