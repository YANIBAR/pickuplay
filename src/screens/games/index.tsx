import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Game } from './GameCard';
import GameGrid from './GamesGrid';
import { API_BACKEND_URL } from '@env';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Header } from '@components';
import { useTranslation } from 'react-i18next';

// Mock data 
const mockGames: Game[] = [];

export default function HomeScreen({route}) {
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[]>([]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BACKEND_URL}/activities/`);
      
      const data = response.data;
      let newItems = [];
      if (Array.isArray(data.data)) {
        // API returns paginated format with data property
        newItems = data.data;
      } else if (Array.isArray(data)) {
        // API returns direct array of requests
        newItems = data;
      }
      setGames(newItems);
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Fallback to mock data if API call fails
      setGames(mockGames);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []); 
  
  

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('games_header')} />
      
      <View style={styles.content}>
        <GameGrid 
          games={games}
        />
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
  },
  content: {
    flex: 1,
  },
});