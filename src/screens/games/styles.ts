import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  viewRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  bellIcon: {
    height: 28,
    width: 28,
    tintColor: COLORS.black,
    marginRight: 8
  },
  dividerContainer: {
    borderBottomColor: COLORS.grayscale400,
    borderBottomWidth: 1,
    marginVertical: 12,
    flexDirection: 'row',
    paddingBottom: 4,
  },
  logo: {
    width: 128,
    height: 128,
    marginBottom: 22,
    marginTop: -22,
  },
  title: {
    fontSize: 28,
    //fontFamily: 'bold',
    color: COLORS.black,
    marginVertical: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    //fontFamily: 'regular',
    color: 'black',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  loginTitle: {
    fontSize: 14,
    //fontFamily: 'regular',
    color: 'black',
  },
  loginSubtitle: {
    fontSize: 14,
    //fontFamily: 'semiBold',
    color: COLORS.primary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 32,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  bottomTitle: {
    fontSize: 12,
    //fontFamily: 'regular',
    color: COLORS.black,
  },
  bottomSubtitle: {
    fontSize: 12,
    //fontFamily: 'regular',
    color: COLORS.black,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 250,
    padding: 20,
    marginLeft: 25,
    marginRight: 25,
  },
  image: {
    width: 50,
    height: 30,
    borderRadius: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  price: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
});
