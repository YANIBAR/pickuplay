// components/ActivityCarousel.tsx

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import theme from './styles';
import { API_BACKEND_URL } from '@env';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.round(width * 0.72);
const CARD_SPACING = theme.spacing.md;

export type Activity = {
  key: string;
  title: string;
  subtitle: string;
  image: any; // require or uri
};

export default function ActivityCarousel({
  activities,
  initialIndex = 0,
  stopAtIndex, // when provided, autoplay will advance until this index then stop
  autoplayInterval = 3500,
  onIndexChange,
}: {
  activities: Activity[];
  initialIndex?: number;
  stopAtIndex?: number | null;
  autoplayInterval?: number;
  onIndexChange?: (index: number) => void;
}) {
  const scrollRef = useRef<ScrollView | null>(null);
  const [index, setIndex] = useState(() => Math.max(0, Math.min(initialIndex, activities.length - 1)));
  const timerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    // Initial scroll to the requested index (no animation for a snappier start)
    setTimeout(() => scrollToIndex(index, true), 60);

    // Start autoplay only when there are multiple items
    if (activities.length > 1) startAutoAdvanceIfNeeded();

    return () => {
      isMountedRef.current = false;
      stopAutoAdvance();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If the parent changes the desired stopAtIndex after mount, try to start autoplay again
    if (stopAtIndex != null) {
      // If already at stop index, ensure autoplay is stopped
      if (index === stopAtIndex) stopAutoAdvance();
      else startAutoAdvanceIfNeeded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopAtIndex]);

  function startAutoAdvanceIfNeeded() {
    // Don't start multiple timers
    if (timerRef.current != null) return;
    // If stopAtIndex equals current index, no need to advance
    if (stopAtIndex != null && stopAtIndex === index) return;

    timerRef.current = setInterval(() => {
      // If component unmounted, bail
      if (!isMountedRef.current) return;

      setIndex((prev) => {
        const next = (prev + 1) % activities.length;
        scrollToIndex(next, true);
        onIndexChange?.(next);

        // If we have a stop target and we just hit it, clear timer
        if (stopAtIndex != null && next === stopAtIndex) {
          stopAutoAdvance();
        }
        return next;
      });
    }, autoplayInterval) as unknown as number;
  }

  function stopAutoAdvance() {
    if (timerRef.current) {
      clearInterval(timerRef.current as unknown as number);
      timerRef.current = null;
    }
  }

  function scrollToIndex(i: number, animated = true) {
    const x = i * (CARD_WIDTH + CARD_SPACING);
    scrollRef.current?.scrollTo({ x, animated });
  }

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / (CARD_WIDTH + CARD_SPACING));
    const normalized = Math.max(0, Math.min(i, activities.length - 1));
    setIndex(normalized);
    onIndexChange?.(normalized);

    // If user scrolled manually and there's a stopAtIndex, stop the autoplay so it doesn't fight the user
    stopAutoAdvance();
  }

  function handleTouchStart(_e: GestureResponderEvent) {
    // Pause autoplay while interacting
    stopAutoAdvance();
  }

  function handleTouchEnd(_e: GestureResponderEvent) {
    // If there's no stop target, we can resume autoplay after user interaction
    if (stopAtIndex == null && activities.length > 1) {
      // small delay so momentum finishes
      setTimeout(() => startAutoAdvanceIfNeeded(), 500);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: CARD_SPACING }}
        onMomentumScrollEnd={handleScrollEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={16}
      >
        {activities.map((a, i) => {
          const isActive = i === index;
          return (
            <TouchableOpacity key={a.key} activeOpacity={0.9} style={[styles.card, isActive && styles.cardActive]}>
              <Image 
                      source={{ uri: `${API_BACKEND_URL}/partners/${a.image || 'placeholder.png'}` }}
                      style={styles.image} 
                    />
              <View style={styles.meta}>
                <Text style={[styles.title]} numberOfLines={1}>{a.title}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>{a.subtitle}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.pagination}>
        {activities.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.outline,
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  cardActive: {
    transform: [{ scale: 1 }],
    opacity: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#E2E8F0',
  },
  meta: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.titleMedium,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.outline,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    width: 18,
    borderRadius: 9,
  },
});