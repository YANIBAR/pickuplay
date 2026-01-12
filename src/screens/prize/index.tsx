// screens/ActivityWinScreen.tsx

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import theme from './styles';
import ActivityCarousel, { Activity } from './ActivityCarousel';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';

type RouteParams = {
  params?: {
    choice?: string;
  };
};

export default function ActivityWinScreen() {
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const navigation = useNavigation();
  const choice = route?.params?.choice ?? 'jump';

  const activities: Activity[] = [
    {
      key: 'trampoline',
      title: 'Trampoline Park',
      subtitle: 'Jump, flip & fly',
      image: 'kojump_cover.webp',
    },
    {
      key: 'bowling',
      title: 'Bowling',
      subtitle: 'Play bowling and anjoy your time',
      image: 'tamaris_bowling_cover.jpg',
    },
    {
      key: 'pool',
      title: 'Swimming Pool',
      subtitle: 'Dive in & relax',
      image: 'shems_park_cover.jpg',
    },
    {
      key: 'laser',
      title: 'Laser Tag',
      subtitle: 'Gaming in the arena',
      image: 'LaserGameEvolution_cover1.webp',
    },
  ];

  const choiceMap: Record<string, string> = {
    jump: 'trampoline',
    swim: 'pool',
    watch: 'bowling',
    gaming: 'laser',
  };

  const matchedKey = choiceMap[choice.toLowerCase()] ?? 'trampoline';
  const initialIndex = activities.findIndex((a) => a.key === matchedKey);
  const matchedActivity = activities[initialIndex] ?? activities[0];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Prize</Text>
        <View style={{ width: 64 }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.cheer}>Congratulations!</Text>
        <Text style={styles.subtitle}>You won 1 free visit to</Text>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>{matchedActivity.title}</Text>
        </View>

        {/* Pass stopAtIndex so carousel will auto-advance and stop on the matched activity */}
        <ActivityCarousel 
          activities={activities} 
          initialIndex={initialIndex >= 0 ? initialIndex : 0}
          stopAtIndex={initialIndex >= 0 ? initialIndex : 0}
        />

        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.claimButton} onPress={() => { /* placeholder for claim action */ }}>
            <Text style={styles.claimText}>Claim Prize</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.laterButton} onPress={() => navigation.goBack()}>
            <Text style={styles.laterText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  backButton: {
    width: 64,
  },
  backText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: theme.typography.titleLarge,
    fontWeight: '700',
    color: theme.colors.text,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  cheer: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  banner: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: theme.typography.titleMedium,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  claimButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  claimText: {
    color: theme.colors.onPrimary,
    fontWeight: '700',
  },
  laterButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginLeft: theme.spacing.sm,
  },
  laterText: {
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
});