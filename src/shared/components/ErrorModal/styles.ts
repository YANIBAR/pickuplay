import { StyleSheet } from 'react-native';
import { elevation } from '@utils/elevation';
import { Dimensions } from 'react-native';

const width = Dimensions.get('screen').width / 1.5;
const height = Dimensions.get('screen').height / 3;

export default StyleSheet.create({
  card: {
    width: width,
    minHeight: height,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation(10),
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3333',
    position: 'absolute',
    top: -30,
    ...elevation(20),
  },
  cardContent: {
    padding: 10,
    marginVertical: 20,
    justifyContent: 'center',
  },
  title: {
    marginVertical: 20,
  },
  cancel: {
    
    width: '100%',
    marginTop: 12,
  },
  illustration: {
    height: 180,
    width: 180,
    marginVertical: 22,
  },
});
