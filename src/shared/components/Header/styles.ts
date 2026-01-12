import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    backgroundColor: COLORS.transparent,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    //fontFamily: 'bold',
    color: COLORS.black,
  },
});
