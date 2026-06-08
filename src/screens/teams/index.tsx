import { images } from '@constants';
import { Header, Button, Icon } from '@components';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { publicApi, authenticatedApi } from '@services/api';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const teams = [
  {
    id: 1,
    name: 'Brooklyn Tigers',
    sport: 'Soccer',
    location: 'Brooklyn, NY',
    players: '12 / 15 Players',
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Queens Hoopers',
    sport: 'Basketball',
    location: 'Queens, NY',
    players: '8 / 10 Players',
    image:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Central Smashers',
    sport: 'Tennis',
    location: 'Manhattan, NY',
    players: '6 / 8 Players',
    image:
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=800&auto=format&fit=crop',
  }
];

export default function NoLeaguePage() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('menu.matchups')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Banner */}
        <View style={styles.header}>
          <Image
            source={images.matchups}
            resizeMode="contain"
            style={styles.logo}
          />
        </View>
        {teams.length === 0 ? (
          <View style={styles.content}>
            <Text style={styles.mainTitle}>{t("teams.title")}</Text>
            
            <Text style={styles.subtitle}>
              {t("teams.noTeams")}
            </Text>

            <Text style={styles.description}>
              {t("teams.description")}
            </Text>
          </View>
            
            ) : (
              <>
                <View style={styles.titleContainer}>
                  <Text style={styles.mainTitle}>Find Teams</Text>
                  <Text style={styles.subtitle}>
                    Join teams or challenge them to a matchup
                  </Text>
                </View>

                <View style={styles.teamList}>
                  
                     { teams.map((team) => (
                        <View key={team.id} style={styles.teamCard}>
                          <Image
                            source={{ uri: team.image }}
                            style={styles.teamImage}
                          />

                          <View style={styles.teamInfo}>
                            <Text style={styles.teamName}>{team.name}</Text>

                            <Text style={styles.teamSport}>{team.sport}</Text>

                            <Text style={styles.teamLocation}>
                              {team.location}
                            </Text>

                            <Text style={styles.teamPlayers}>
                              {team.players}
                            </Text>

                            {/* Buttons */}
                            <View style={styles.buttonRow}>
                              <Button
                                filled
                                style={styles.joinButton}
                                title={t('Matchup')}
                              />
                              <Button
                                style={styles.matchupButton}
                                title={t('Join')}
                              />
                            </View>
                          </View>
                        </View>
                      ))}
                  
                </View>
              </>
            )}
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = '#19C2A0';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  header: {
    alignItems: 'center',
    marginTop: 10,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  logo: {
    width: "100%",
    height: 270,
  },

  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },

  teamList: {
    paddingHorizontal: 16,
    gap: 16,
  },

  teamCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },

  teamImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#ddd',
  },

  teamInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },

  teamName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },

  teamSport: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: '600',
    marginTop: 2,
  },

  teamLocation: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },

  teamPlayers: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    marginBottom: 12,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },

  joinButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 10,
    alignItems: 'center',
  },

  joinButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  matchupButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  matchupButtonText: {
    color: PRIMARY,
    fontWeight: '700',
    fontSize: 14,
  },
  mvpBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#E8FFFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  mvpBadgeText: {
    color: '#19C2A0',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  }
});