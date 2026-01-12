import { COLORS, SIZES } from '@constants';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 72,
        width: SIZES.width - 32,
        borderRadius: 20,
        borderColor: COLORS.grayscale200,
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
      },
      iconContainer: {
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
        borderRadius: 12,
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
