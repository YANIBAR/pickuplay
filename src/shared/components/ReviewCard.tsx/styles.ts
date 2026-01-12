import { StyleSheet } from 'react-native';
import { COLORS } from '@constants';

export default StyleSheet.create({
  container: {
      width: "100%",
      marginBottom: 6
  },
  reviewHeaderContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
  },
  avatar: {
      width: 40,
      height: 40,
      borderRadius: 9999,
      marginRight: 10
  },
  name: {
      fontSize: 16,
      fontFamily: "bold",
      color: COLORS.black
  },
  starContainer: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 22,
      borderColor: COLORS.primary,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 12
  },
  reviewHeaderLeft: {
      flexDirection: "row",
      alignItems: "center"
  },
  reviewHeaderRight: {
      flexDirection: "row",
      alignItems: "center"
  },
  rating: {
      fontSize: 14,
      fontFamily: "semiBold",
      color: COLORS.primary,
      marginLeft: 5
  },
  moreCircleIcon: {
      width: 20,
      height: 20,
      tintColor: COLORS.black
  },
  description: {
      fontSize: 14,
      fontFamily: "regular",
      color: COLORS.black,
      marginTop: 10
  },
  reviewBottomContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 12
  },
  likeContainer: {
      flexDirection: "row",
      alignItems: "center"
  },
  numLikes: {
      fontSize: 14,
      fontFamily: "semiBold",
      color: COLORS.black
  },
  date: {
      fontSize: 14,
      fontFamily: "regular",
      color: COLORS.gray,
      marginLeft: 12
  },
  heartIcon: {
      width: 20,
      height: 20,
      marginRight: 8
  }
});
