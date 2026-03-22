import { StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 0,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: {
    width: 22,
    height: 22
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    justifyContent: "center"
  },
  iconBtn: {
    marginHorizontal: 8
  },
});
