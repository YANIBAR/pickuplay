import { elevation } from '@utils/elevation';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  containerStyle: {
    justifyContent: 'flex-end',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation(5),
  },
  card: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    paddingVertical: 10,
  },
  logo: {
    width: 90,
    height: 90,
  },
});
