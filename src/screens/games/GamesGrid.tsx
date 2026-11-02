import { StyleSheet, FlatList, RefreshControl } from 'react-native';
import GameCard, { Game } from './GameCard';
import { COLORS } from '@constants';
import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeToken } from '@services/auth/auth.utils';

interface GameGridProps {
  games: Game[];
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function GameGrid({ games, refreshing = false, onRefresh }: GameGridProps) {
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
      } catch (err) {
        console.error('Failed to fetch role:', err);
        setRole(null);
      }
    };
    fetchRole();
  }, []);

  const isAdmin = role === 'ADMIN';
  // Only admins can see private games
  const visibleGames = useMemo(
    () => (isAdmin ? games : games.filter((game) => !game.isPrivate)),
    [games, isAdmin]
  );

  return (
    <FlatList
      data={visibleGames}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <GameCard game={item} onRefresh={onRefresh} />
      )}
      numColumns={1}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingBottom: 70,
  },
});