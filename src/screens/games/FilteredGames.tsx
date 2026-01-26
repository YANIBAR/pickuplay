import { View } from '@components';
import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-gesture-handler';

type GameGridProps = {
  games: Game[];
};

export default function FilteredGames({ games}: GameGridProps) {

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<Game['type'] | null>(null);
  return (
   <View style={styles.filters}>
    <Text onPress={() => setSelectedCity(null)}>All Cities</Text>
    <Text onPress={() => setSelectedCity('Casablanca')}>Casablanca</Text>
    <Text onPress={() => setSelectedCity('Rabat')}>Rabat</Text>

    <Text onPress={() => setSelectedSport(null)}>All Sports</Text>
    <Text onPress={() => setSelectedSport('soccer')}>Soccer</Text>
    <Text onPress={() => setSelectedSport('basketball')}>Basketball</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  }
});