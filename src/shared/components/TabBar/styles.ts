import { StyleSheet } from 'react-native';
import { COLORS } from '@constants';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    position: 'relative',
    bottom: 0,
    // iOS Shadow
    shadowColor: '#999',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Android Shadow
    elevation: 5,
  },
  item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
