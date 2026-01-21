import React, { useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import GameCard, { Game } from './GameCard';

type GameGridProps = {
  games: Game[];
};

export default function GameGrid({ games}: GameGridProps) {

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
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  }
});