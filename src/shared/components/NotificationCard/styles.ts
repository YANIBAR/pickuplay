import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    width: SIZES.width - 32,
    marginBottom: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerRightContainer: {
    width: 41,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  headerText: {
    fontSize: 10,
    color: COLORS.white,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    height: 60,
    width: 60,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    height: 28,
    width: 28,
  },
  title: {
    fontSize: 18,
    color: COLORS.greyscale900,
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    color: COLORS.grayscale700,
  },
  description: {
    fontSize: 14,
    color: COLORS.grayscale700,
  },
  
});
