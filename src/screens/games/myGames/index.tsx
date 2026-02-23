import { View, StyleSheet, ScrollView, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameCard, { Game } from './gameCard';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authenticatedApi } from '@services/api';
import { Header } from '@components';
import { COLORS } from '@constants';

type Nav = {
  navigate: (value: string) => void;
};

export default function GamesScreen() {
  const navigation = useNavigation<Nav>();
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthError, setIsAuthError] = useState(false);
  const { t } = useTranslation();

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsAuthError(false);

      const response = await authenticatedApi.get(`profile/games`);
            
      let gamesData = [];
      gamesData = response.result.data;

      if (!Array.isArray(gamesData)) {
        console.warn('Games data is not an array:', gamesData);
        gamesData = [];
      }
      
      setGames(gamesData);
    } catch (err: any) {
      console.error('Error fetching games:', err);

      const status = err?.response?.status ?? err?.status;
      const isUnauthorized = status === 401 || status === 403;
      const isNetworkError = !err?.response && (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK');

      if (isUnauthorized || isNetworkError) {
        setIsAuthError(true);
        setError(t('errors.notConnected') || 'You need to log in to view your games.');
      } else {
        setError(t('errors.errorLoadingGames') || 'Failed to load games. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGamePress = (game: Game) => {
    navigation.navigate('gameDetail', { game });
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
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
          {isAuthError ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('login')}>
                <Text style={styles.loginButtonText}>{t('c.login') || 'Log In'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('register')}>
                <Text style={styles.cancelButtonText}>{t('c.signUp') || 'Sign Up'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.retryButton} onPress={fetchGames}>
              <Text style={styles.retryButtonText}>{t('common.retry') || 'Try Again'}</Text>
            </TouchableOpacity>
          )}
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
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
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

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    borderWidth: 1,
    borderColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
});