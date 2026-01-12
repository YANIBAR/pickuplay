import React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import ActivityCard, { Activity } from './ActivityCard';

type ActivityGridProps = {
  activities: Activity[];
  membershipId?: string; // Added this prop to match your usage
};

export default function ActivityGrid({ activities, membershipId }: ActivityGridProps) {
  return (
    <FlatList
      data={activities}
      keyExtractor={(item, index) => `${item.id}-${index}`} // Combine ID with index
      renderItem={({ item }) => (
        <ActivityCard 
          activity={item}
          membershipId={membershipId}
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