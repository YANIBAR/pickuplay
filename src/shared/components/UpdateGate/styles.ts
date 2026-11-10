import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../../constants';

export default StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8F8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  icon: {
    fontSize: 42,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  updateButton: {
    backgroundColor: '#22BB9C',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  version: {
    marginTop: 20,
    color: '#999999',
    fontSize: 12,
  },
});
