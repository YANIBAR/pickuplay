import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@constants';
import Header from '@components/Header';
import { ScrollView } from 'react-native-virtualized-view';
import { useTranslation } from 'react-i18next';

// change the privacy data based on your data 
const Terms = () => {
    const { t } = useTranslation();

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
            <View style={[styles.container, { backgroundColor: COLORS.white }]}>
                <Header title={t("terms.headerTitle")} />
                <Text>{t('terms.introduction')}</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View>
                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('terms.sections.description.title')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>
                            {t('terms.sections.description.content')}
                        </Text>
                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('terms.sections.purchase.title')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>
                            {t('terms.sections.purchase.content')}
                        </Text>
                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('terms.sections.membership.title')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>
                            {t('terms.sections.membership.content')}
                        </Text>
                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('terms.sections.venues.title')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>
                            {t('terms.sections.venues.content')}
                        </Text>
                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('terms.sections.transferability.title')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>
                            {t('terms.sections.transferability.content')}
                        </Text>
                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('terms.sections.disclaimers.title')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>
                            {t('terms.sections.disclaimers.content')}
                        </Text>
                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('terms.sections.liability.title')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>
                            {t('terms.sections.liability.content')}
                        </Text>
                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('terms.sections.indemnification.title')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>
                            {t('terms.sections.indemnification.content')}
                        </Text>
                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('terms.sections.privacy.title')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>
                            {t('terms.sections.privacy.content')}
                        </Text>
                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('terms.sections.content.title')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>
                            {t('terms.sections.content.content')}
                        </Text>
                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('terms.sections.property.title')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>
                            {t('terms.sections.property.content')}
                        </Text>
                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('terms.sections.communications.title')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>
                            {t('terms.sections.communications.content')}
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 16
    },
    settingsTitle: {
        fontSize: 18,
        fontFamily: "bold",
        color: COLORS.black,
        marginVertical: 26
    },
    body: {
        fontSize: 14,
        fontFamily: "regular",
        color: COLORS.black,
        marginTop: 4
    }
})

export default Terms