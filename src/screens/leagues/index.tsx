import { COLORS, images } from '@constants';
import { Button, Header } from '@components';
import { useTranslation } from 'react-i18next';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeToken } from '@services/auth/auth.utils';
import { useNavigation } from '@react-navigation/native';

export default function NoLeaguePage() {
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          setRole(null);
          return;
        }
        const userInfo = decodeToken(token);
        setRole(userInfo?.role ?? null);
      } catch (error) {
        console.error('Failed to fetch role:', error);
        setRole(null);
      }
    };
    fetchRole();
  }, []);
  const teams = [
  {
    id: 1,
    name: 'KC soccer league',
    sport: 'Soccer',
    location: 'Brooklyn, NY',
    players: '2 / 8 Teams',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9mP_-oztGsSD-RKJt0Ck03lbVDpnGGuDJDQ&s',
  },
  {
    id: 2,
    name: 'SoftBall tournament',
    sport: 'Softball',
    location: 'Queens, NY',
    players: '8 / 16 Teams',
    image:
      'https://images-platform.99static.com/Rug1Q_WUXj3wLPTHItuD3zOeLEU=/354x6:1587x1239/500x500/top/smart/99designs-contests-attachments/66/66435/attachment_66435050',
  },
  {
    id: 3,
    name: 'CO ED tournament',
    sport: 'Tennis',
    location: 'Manhattan, NY',
    players: '6 / 10 Teams',
    image:
      'https://upload.wikimedia.org/wikipedia/en/9/95/FC_Kansas_City_logo1.png',
  }
];
  return (
    <SafeAreaView style={styles.container}>
        
      <Header title={t('menu.leagues')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={images.leagueCover}
            resizeMode="contain"
            style={styles.logo}
          />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.mainTitle}>{t("leagues.startLeague")}</Text>

          <Text style={styles.subtitle}>
            {t("leagues.noLeagues")}
          </Text>

          <Text style={styles.description}>
            {t("leagues.description")}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {(role === 'ORGANIZER' || role === 'ADMIN') && (
              <TouchableOpacity style={styles.primaryButton}  onPress={() => navigate("addLeague")}>
                  <Text style={styles.primaryButtonText}>
                    {t("leagues.createLeague")}
                  </Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigate("teams")}>
              <Text style={styles.secondaryButtonText}>
                {t("leagues.findTeams")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.leagueList}>
                  
                { teams.map((team) => (
                  <TouchableOpacity key={team.id} style={styles.leagueCard} onPress={() => navigate("leagueDetail")}>
                    <Image
                      source={{ uri: team.image }}
                      style={styles.leagueImage}
                    />

                    <View style={styles.leagueInfo}>
                      <Text style={styles.leagueName}>{team.name}</Text>

                      <Text style={styles.leagueSport}>{team.sport}</Text>

                      <Text style={styles.leagueLocation}>
                        {team.location}
                      </Text>

                      <Text style={styles.leaguePlayers}>
                        {team.players}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            
          </View>
          {(role === 'ORGANIZER' || role === 'ADMIN') && (
            <View style={styles.joinSection}>
              <Text style={styles.joinTitle}>{t("leagues.joinLeague")}</Text>
              <Text style={styles.joinDescription}>
                {t("leagues.joinLeagueDescription")}
              </Text>

              <View style={styles.joinButtonContainer}>
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>
                    {t("leagues.joinAsPlayer")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>
                    {t("leagues.joinAsTeam")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 12,
  },
  whistleIcon: {
    width: 180,
    height: 180
  },
  logo: {
    width: 400,
    height: 270,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1FAC9B',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
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
  illustrationContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f5f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 60,
  },
  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#1FAC9B',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1FAC9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1FAC9B',
  },
  secondaryButtonText: {
    color: '#1FAC9B',
    fontSize: 16,
    fontWeight: '600',
  },
  joinSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  joinTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  joinDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  joinButtonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#1FAC9B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1FAC9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  featuresContainer: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  leagueList: {
    gap: 16,
  },

  leagueCard: {
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

  leagueImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#ddd',
  },

  leagueInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },

  leagueName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },

  leagueSport: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },

  leagueLocation: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },

  leaguePlayers: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    marginBottom: 12,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },



  matchupButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  matchupButtonText: {
    color: COLORS.primary,
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