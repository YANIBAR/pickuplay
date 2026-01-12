import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create(
    {area: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 16
    },
    title: {
    fontSize: 20,
    fontFamily: "bold",
    color: COLORS.black,
    marginVertical: 16
    }

});
