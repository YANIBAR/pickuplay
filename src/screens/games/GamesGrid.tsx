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
      keyExtractor={(item, index) => `${item.id}-${index}`} // Combine ID with index
      renderItem={({ item }) => (
        <GameCard 
          game={item}
        />
      )}
      numColumns={1}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}       // Android
          tintColor={COLORS.primary}      // iOS
        />
      }
    />
    
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  }
});