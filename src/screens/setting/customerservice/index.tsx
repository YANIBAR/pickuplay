import { Image, View, Text, TouchableOpacity, TextInput, StyleSheet, StatusBar } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, icons, images } from '@constants';
//import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

// Customer service screen
const CustomerService = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp<any>>();
    const [messages, setMessages] = useState<any>([]);
    const [inputMessage, setInputMessage] = useState('');

    const handleInputText = (text: any) => {
        setInputMessage(text)
    };

    const renderMessage = (props: any) => {
        const { currentMessage } = props

        if (currentMessage.user._id === 1) {
            return (
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                    }}>
                </View>
            )
        } else {
            return (
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                    }}>
                    <Image
                        source={images.idAvatar}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            marginLeft: 8,
                        }}
                    />
                </View>
            )
        }
    }

    /***
     * Implementing chat functionnality
     */
    const submitHandler = () => {
        const message = {
            _id: Math.random().toString(36).substring(7),
            text: inputMessage,
            createdAt: new Date(),
            user: { _id: 1 },
        }

        setInputMessage("")
    }

    const renderInputToolbar = () => {
        return null;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: COLORS.white }]}>
            <StatusBar hidden={true} />
            <View style={[styles.contentContainer, { backgroundColor: COLORS.white }]}>
                <View style={[styles.header, { backgroundColor: COLORS.white }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Image
                                source={icons.arrowLeft}
                                style={[styles.headerIcon, {
                                    tintColor: COLORS.grayscale900
                                }]}
                            />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, {
                            color: COLORS.grayscale900
                        }]}>{t('CustomerService')}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: 'center' }}>
                        <TouchableOpacity>
                            <Image
                                source={icons.call}
                                style={[styles.headerIcon, {
                                    tintColor: COLORS.grayscale900
                                }]}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: 16 }}>
                            <Image
                                source={icons.moreCircle}
                                style={[styles.headerIcon, {
                                    tintColor: COLORS.grayscale900
                                }]}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.inputContainer, {
                    backgroundColor: COLORS.white
                }]}>
                    <View style={[styles.inputMessageContainer, {
                        backgroundColor: COLORS.grayscale100,
                    }]}>
                        <TextInput
                            style={styles.input}
                            value={inputMessage}
                            onChangeText={handleInputText}
                            placeholderTextColor={COLORS.grayscale900}
                            placeholder={t('EnterMessage')}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    contentContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: "semiBold",
        color: COLORS.black,
        marginLeft: 22
    },
    headerIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.black
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIcon: {
        marginRight: 12,
    },
    chatContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingVertical: 8,
        paddingHorizontal: 16
    },
    inputMessageContainer: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: 10,
        backgroundColor: COLORS.grayscale100,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 12,
        alignItems: 'center'
    },
    attachmentIconContainer: {
        marginRight: 12,
    },
    input: {
        color: COLORS.grayscale900,
        flex: 1,
        paddingHorizontal: 10,
    },
    microContainer: {
        height: 48,
        width: 48,
        borderRadius: 49,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
    }
});

export default CustomerService;