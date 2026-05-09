import { StyleSheet, FlatList, RefreshControl } from 'react-native';
import GameCard, { Game } from './GameCard';
import { COLORS } from '@constants';

interface GameGridProps {
  games: Game[];
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function GameGrid({ games, refreshing = false, onRefresh }: GameGridProps) {
  return (
    <FlatList
      data={games}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={({ item }) => (
        <GameCard 
          game={item}
          onRefresh={onRefresh}  // 👈 pass it down
        />
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
    paddingBottom: 70
  }
});