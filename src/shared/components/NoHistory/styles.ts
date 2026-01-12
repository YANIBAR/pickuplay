import { StyleSheet } from 'react-native';
import { COLORS } from '@constants';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  notFound: {
    width: 160,
    height: 160,
    marginVertical: 72,
  },
  title: {
    fontSize: 20,
    fontFamily: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'regular',
    color: COLORS.black,
    textAlign: 'center',
  },
});
