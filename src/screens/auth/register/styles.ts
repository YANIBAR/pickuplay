import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  logo: {
    width: 100,
    height: 100,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  title: {
    fontSize: 18,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 30,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 18,
  },
  privacy: {
    lineHeight: 24,
    fontSize: SIZES.h4,
    marginHorizontal: 10,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 28,
  },
  button: {
    marginVertical: 6,
    width: SIZES.width - 32,
  },
  link: {
    color: COLORS.greeen,
    textDecorationLine: 'underline',
  },
  area: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "regular",
    color: COLORS.greyscale900,
    textAlign: "center",
    paddingHorizontal: 3
  },
  proofContainer: {
    marginVertical: 22
  },
  proofTitle: {
    fontSize: 20,
    fontFamily: "bold",
    color: COLORS.greyscale900
  },
  proofView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    height: 72,
    width: SIZES.width - 32,
    borderRadius: 20,
    borderColor: COLORS.grayscale200,
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 16
  },
  countryContainer: {
    flexDirection: "row",
    alignItems: 'center'
  },
  countryImage: {
    width: 32,
    height: 24
  },
  countryText: {
    fontSize: 16,
    fontFamily: "semiBold",
    color: COLORS.greyscale900,
    marginLeft: 16
  },
  changeText: {
    fontSize: 16,
    fontFamily: "semiBold",
    color: COLORS.primary
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    position: "absolute",
    right: 16,
    top: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  },iconContainer: {
    marginRight: 10,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: COLORS.primary
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontFamily: "semiBold",
    color: COLORS.greyscale900
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white
  },
});
