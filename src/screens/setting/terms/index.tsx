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

                    {/* Description */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.description.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.description.content')}</Text>

                    {/* Eligibility */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.eligibility.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.eligibility.content')}</Text>

                    {/* Account */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.account.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.account.content')}</Text>

                    {/* Games */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.games.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.games.content')}</Text>

                    {/* Organizers */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.organizers.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.organizers.content')}</Text>

                    {/* Payments */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.payments.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.payments.content')}</Text>

                    {/* Conduct */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.conduct.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.conduct.content')}</Text>

                    {/* Liability */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.liability.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.liability.content')}</Text>

                    {/* Disclaimers */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.disclaimers.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.disclaimers.content')}</Text>

                    {/* Privacy */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.privacy.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.privacy.content')}</Text>

                    {/* Content */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.content.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.content.content')}</Text>

                    {/* Property */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.property.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.property.content')}</Text>

                    {/* Communications */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.communications.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.communications.content')}</Text>

                    {/* Termination */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.termination.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.termination.content')}</Text>

                    {/* Governance */}
                    <Text style={styles.settingsTitle}>{t('terms.sections.governance.title')}</Text>
                    <Text style={styles.body}>{t('terms.sections.governance.content')}</Text>

                    {/* Safety */}
                    <Text style={styles.settingsTitle}>{t('terms.safety.title')}</Text>
                    {t('terms.safety.items', { returnObjects: true }).map((item, index) => (
                    <Text key={index} style={styles.body}>• {item}</Text>
                    ))}

                    {/* Modifications */}
                    <Text style={styles.settingsTitle}>{t('terms.modifications.title')}</Text>
                    <Text style={styles.body}>{t('terms.modifications.content')}</Text>

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
        marginTop: 16,
    },
    body: {
        fontSize: 14,
        fontFamily: "regular",
        color: COLORS.black,
        marginTop: 4
    }
})

export default Terms