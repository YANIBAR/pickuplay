import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@constants';
import Header from '@components/Header';
import { ScrollView } from 'react-native-virtualized-view';
import { useTranslation } from 'react-i18next';

// change the privacy data based on your data 
const PrivacyPolicy = () => {
    const { t } = useTranslation();
    return (
        <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
            <View style={[styles.container, { backgroundColor: COLORS.white }]}>
                <Header title="Privacy Policy" />
                <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.EffectiveDate')}: 11/09/2024</Text>

                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('PrivacyPolicy.InformationWeCollect')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.InformationWeCollectDescription')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.PersonalData')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.UsageData')}</Text>

                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('PrivacyPolicy.UseOfPersonalData')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.UseOfPersonalDataDescription')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.ServiceDelivery')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.Communication')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.Analytics')}</Text>

                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('PrivacyPolicy.TrackingAndCookies')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.TrackingAndCookiesDescription')}</Text>

                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('PrivacyPolicy.DataSecurity')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.DataSecurityDescription')}</Text>

                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('PrivacyPolicy.DataDeletionRequests')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.DataDeletionRequestsDescription')}</Text>

                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('PrivacyPolicy.ChangesToPrivacyPolicy')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.ChangesToPrivacyPolicyDescription')}</Text>

                        <Text style={[styles.settingsTitle, { color: COLORS.black }]}>{t('PrivacyPolicy.ContactUs')}</Text>
                        <Text style={[styles.body, { color: COLORS.greyscale900 }]}>{t('PrivacyPolicy.ContactUsDescription')}</Text>
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

export default PrivacyPolicy