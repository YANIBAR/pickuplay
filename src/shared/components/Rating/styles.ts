import { StyleSheet } from 'react-native';
import { COLORS } from '@constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  ratingIcons: {
    flexDirection: 'row',
  },
  iconContainer: {
    margin: 5,
  },
  ratingText: {
    fontFamily: 'medium',
    fontSize: 20,
    marginLeft: 10,
    color: COLORS.primary,
  },
});
