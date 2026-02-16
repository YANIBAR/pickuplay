import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white,
        minHeight: SIZES.height
      },
      container: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 16,
        marginBottom: 32
      },
      headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
      },
      headerLeft: {
        flexDirection: "row",
        alignItems: "center"
      },
      logo: {
        height: 32,
        width: 32
      },
      headerTitle: {
        fontSize: 22,
        fontFamily: "bold",
        color: COLORS.greyscale900,
        marginLeft: 12
      },
      headerIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.greyscale900
      },
      profileContainer: {
        alignItems: "center",
        borderBottomColor: COLORS.grayscale400,
        borderBottomWidth: .4,
        paddingVertical: 20
      },
      avatar: {
        width: 120,
        height: 120,
        borderRadius: 999
      },
      picContainer: {
        width: 20,
        height: 20,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
        position: "absolute",
        right: 0,
        bottom: 12
      },
      title: {
        fontSize: 18,
        fontFamily: "bold",
        color: COLORS.greyscale900,
        marginTop: 12
      },
      subtitle: {
        fontSize: 16,
        color: COLORS.greyscale900,
        fontFamily: "medium",
        marginTop: 4
      },
      settingsContainer: {
        marginVertical: 12
      },
      settingsItemContainer: {
        width: SIZES.width - 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 12
      },
      leftContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      settingsIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.greyscale900
      },
      settingsName: {
        fontSize: 18,
        fontFamily: "semiBold",
        color: COLORS.greyscale900,
        marginLeft: 12
      },
      settingsArrowRight: {
        width: 24,
        height: 24,
        tintColor: COLORS.greyscale900
      },
      rightContainer: {
        flexDirection: "row",
        alignItems: "center"
      },
      rightLanguage: {
        fontSize: 18,
        fontFamily: "semiBold",
        color: COLORS.greyscale900,
        marginRight: 8
      },
      switch: {
        marginLeft: 8,
        transform: [{ scaleX: .8 }, { scaleY: .8 }], // Adjust the size of the switch
      },
      logoutContainer: {
        width: SIZES.width - 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 12
      },
      logoutLeftContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      logoutIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.greyscale900
      },
      logoutName: {
        fontSize: 18,
        fontFamily: "semiBold",
        color: COLORS.greyscale900,
        marginLeft: 12
      },
      bottomContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 12,
        paddingHorizontal: 16
      },
      cancelButton: {
        width: (SIZES.width - 32) / 2 - 8,
        backgroundColor: COLORS.transparentPrimary,
        borderRadius: 32
      },
      logoutButton: {
        width: (SIZES.width - 32) / 2 - 8,
        backgroundColor: COLORS.primary,
        borderRadius: 32
      },
      bottomTitle: {
        fontSize: 24,
        fontFamily: "semiBold",
        color: COLORS.primary,
        textAlign: "center",
        marginTop: 12
      },
      bottomSubtitle: {
        fontSize: 20,
        fontFamily: "semiBold",
        color: COLORS.greyscale900,
        textAlign: "center",
        marginVertical: 28
      },
      separateLine: {
        width: SIZES.width,
        height: 1,
        backgroundColor: COLORS.grayscale200,
        marginTop: 12
      },      
});
