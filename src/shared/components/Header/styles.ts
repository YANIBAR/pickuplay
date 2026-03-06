import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    backgroundColor: COLORS.transparent,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: {
    width: 28,
    height: 28,
    marginRight: 16,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)', // optional, helps define edge

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,

    // Android shadow
    elevation: 5,

    // CRITICAL: background color required for shadow to show
    backgroundColor: '#fff', // or whatever your icon background should be
  },
  title: {
    fontSize: 24,
    //fontFamily: 'bold',
    color: COLORS.black,
  },
});
