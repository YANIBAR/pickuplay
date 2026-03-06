import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { FC } from 'react';
import { SIZES, COLORS, icons } from '@constants';

interface SettingsItemProps {
    icon: string;
    name: string;
    onPress: () => void;
    hasArrowRight?: boolean;
}

const SettingsItem: FC<SettingsItemProps> = ({ icon, name, onPress, hasArrowRight = true }) => {

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.container}>
            <View style={styles.leftContainer}>
                <Image
                    source={icon}
                    contentFit='contain'
                    style={[styles.icon, {
                        tintColor: COLORS.grayscale900
                    }]}
                />
                <Text style={[styles.name, {
                    color: COLORS.grayscale900
                }]}>{name}</Text>
            </View>
            {
                hasArrowRight && (
                    <Image
                        source={icons.arrowRight}
                        contentFit='contain'
                        style={[styles.arrowRight, {
                            tintColor: COLORS.grayscale900
                        }]}
                    />
                )
            }
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    container: {
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
    icon: {
        height: 24,
        width: 24,
        tintColor: COLORS.grayscale900
    },
    name: {
        fontSize: 18,
        fontFamily: "semiBold",
        color: COLORS.grayscale900,
        marginLeft: 12
    },
    arrowRight: {
        width: 24,
        height: 24,
        tintColor: COLORS.grayscale900
    }
})

export default SettingsItem;