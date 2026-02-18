import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameCard, { Game } from './gameCard';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authenticatedApi, publicApi } from '@services/api';
import { Header } from '@components';

export default function GamesScreen() {
  const navigation = useNavigation();
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch games from the API
     const response = await publicApi.get(`games`);

      // Handle different response structures
      let gamesData = [];
        gamesData = response.result.data;

      console.log('Raw responsssse:', gamesData);
      // Ensure gamesData is always an array
      if (!Array.isArray(gamesData)) {
        console.warn('Games data is not an array:', gamesData);
        gamesData = [];
      }
      
      setGames(gamesData);
      console.log('Fetched games:', gamesData);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(t('game.errorLoading') || 'Failed to load games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGamePress = (game: Game) => {
    // Navigate to game detail screen
    navigation.navigate('gameDetail', { game });
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>{t('game.loading') || 'Loading games...'}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (games.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {t('game.noGames') || 'No games available'}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPress={handleGamePress}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
    <Header title={t('game.title') || 'Games'} />
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});