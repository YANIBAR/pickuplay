import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: SIZES.width - 32,
    justifyContent: "space-between"
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  headerLogo: {
    height: 36,
    width: 36,
    tintColor: COLORS.primary
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "bold",
    color: COLORS.black,
    marginLeft: 12
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.black
  },
  moreCircleIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.black,
    marginLeft: 12
  },
  addPostBtn: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    position: "absolute",
    bottom: 72,
    right: 16,
    zIndex: 999,
    shadowRadius: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 }
  },
  iconBtnContainer: {
    height: 40,
    width: 40,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center"
  },
  notiContainer: {
      alignItems: "center",
      justifyContent: "center",
      height: 16,
      width: 16,
      borderRadius: 999,
      backgroundColor: COLORS.red,
      position: "absolute",
      top: 1,
      right: 1,
      zIndex: 999,
  },
  notiText: {
      fontSize: 10,
      color: COLORS.white,
      fontFamily: "medium"
  },
  searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.white,
      height: 50,
      marginVertical: 22,
      paddingHorizontal: 12,
      borderRadius: 20,
  },
  searchInput: {
      width: '100%',
      height: '100%',
      marginHorizontal: 12,
  },
  flatListContainer: {
      paddingBottom: 100,
  },
  userContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomColor: COLORS.secondaryWhite,
      borderBottomWidth: 1,
  },
  oddBackground: {
      backgroundColor: COLORS.tertiaryWhite,
  },
  userImageContainer: {
      paddingVertical: 15,
      marginRight: 22,
  },
  onlineIndicator: {
      height: 14,
      width: 14,
      borderRadius: 7,
      backgroundColor: COLORS.primary,
      borderColor: COLORS.white,
      borderWidth: 2,
      position: 'absolute',
      top: 14,
      right: 2,
      zIndex: 1000,
  },
  userImage: {
      height: 50,
      width: 50,
      borderRadius: 25,
  },
  userInfoContainer: {
      flexDirection: 'column',
  },
  userName: {
      fontSize: 14,
      color: COLORS.black,
      fontFamily: "bold",
      marginBottom: 4,
  },
  lastSeen: {
      fontSize: 14,
      color: "gray",
  },
  lastMessageTime: {
      fontSize: 12,
      fontFamily: "regular"
  },
  messageInQueue: {
      fontSize: 12,
      fontFamily: "regular",
      color: COLORS.white
  }
});
