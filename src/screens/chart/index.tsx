import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VenueStats from './VenueStats';

export default function HomeScreen() {

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <VenueStats />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});