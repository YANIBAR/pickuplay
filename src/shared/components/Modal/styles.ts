import { StyleSheet } from 'react-native';
import { elevation } from '@utils/elevation';

export default StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,.4)',
  },
  dialog: {
    width: '80%',
    borderRadius: 4,
    paddingBottom: 20,
    backgroundColor: '#fff',
    ...elevation(10),
  },
  header: {
    width: '100%',
    paddingTop: 20,
    paddingLeft: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    alignSelf: 'center',
  },
  titleContainer: {
    alignSelf: 'center',
  },
  logoContainer: {},
  close: {
    position: "absolute",
    right:0,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
