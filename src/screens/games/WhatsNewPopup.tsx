import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageSourcePropType } from 'react-native';
import { COLORS } from '@constants';
import { POPUP_VERSION } from '@env';
const STORAGE_KEY = 'whats_new_version';

type Slide = {
  image: ImageSourcePropType;
  title: string;
  text: string;
};

// Replace with your own screenshots, e.g. image: require('../assets/whats-new-1.png')
// Edit this list for each release and bump POPUP_VERSION.
const SLIDES: Slide[] = [
  {
    image: require('@assets/newFeatures/V1/VenmoPayment.png'),
    title: 'Pay with Venmo',
    text: 'Send your payment through Venmo within 15 minutes to confirm your spot.',
  },
  {
    image: require('@assets/newFeatures/V1/JoinGameFeatureTips.png'),
    title: 'Choose your team',
    text: 'Select your team when joining a game and let others know if you are bringing a ball.',
  },
  {
    image: require('@assets/newFeatures/V1/PlayersListScrolling.png'),
    title: 'Explore teams and players',
    text: 'Scroll down to discover all teams and see who is playing in each team.',
  },
];

type Props = {
  /** Called after the popup closes when the user finishes with "Explore now". */
  onExplore?: () => void;
};

const WhatsNewPopup = ({ onExplore }: Props) => {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const { width, height } = useWindowDimensions();

  const slideWidth = width - 68; // sheet has 24px horizontal padding
  const imageHeight = Math.min(slideWidth * 0.72, height * 0.34);
  const isLast = index === SLIDES.length - 1;

  const backdrop = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const checkPopup = async () => {
      try {
        const savedVersion = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedVersion !== POPUP_VERSION) {
            setVisible(true);
        }
      } catch {
        // If storage fails, skip the popup rather than block the app.
      }
    };
    checkPopup();
  }, []);

  useEffect(() => {
    if (!visible) return;
    setIndex(0);
    scrollX.setValue(0);
    Animated.parallel([
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 1,
        damping: 18,
        stiffness: 160,
        mass: 0.9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, backdrop, slide, scrollX]);

  const close = useCallback(
    async (explore = false) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, POPUP_VERSION);
      } catch {
        // Ignore: worst case the popup shows once more.
      }
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        if (explore) onExplore?.();
      });
    },
    [backdrop, slide, onExplore]
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / slideWidth));
  };

  const onPrimary = () => {
    if (isLast) {
      close(true);
    } else {
      const next = index + 1;
      scrollRef.current?.scrollTo({ x: next * slideWidth, animated: true });
      setIndex(next);
    }
  };

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.6, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => close(false)}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.scrim, { opacity: backdrop }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => close(false)}
            accessibilityLabel="Dismiss"
          />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
          accessibilityViewIsModal
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>New in PickuPlay</Text>
            </View>
            {!isLast && (
              <Pressable
                onPress={() => close(false)}
                hitSlop={10}
                accessibilityRole="button"
              >
                <Text style={styles.skip}>Skip</Text>
              </Pressable>
            )}
          </View>

          <Animated.ScrollView
            ref={scrollRef as any}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={slideWidth}
            disableIntervalMomentum
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={onMomentumEnd}
            style={{ width: slideWidth, flexGrow: 0 }}
          >
            {SLIDES.map((s) => (
              <View key={s.title} style={{ width: slideWidth }}>
                <Image
                    source={s.image}
                    style={styles.image}
                    resizeMode="contain"
                />
                <Text style={styles.title} accessibilityRole="header">
                  {s.title}
                </Text>
                <Text style={styles.body}>{s.text}</Text>
              </View>
            ))}
          </Animated.ScrollView>

          <View style={styles.dots} accessibilityElementsHidden>
            {SLIDES.map((_, i) => {
              const range = [(i - 1) * slideWidth, i * slideWidth, (i + 1) * slideWidth];
              const dotWidth = scrollX.interpolate({
                inputRange: range,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });
              const dotOpacity = scrollX.interpolate({
                inputRange: range,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={i}
                  style={[styles.dot, { width: dotWidth, opacity: dotOpacity }]}
                />
              );
            })}
          </View>

          <Pressable
            onPress={onPrimary}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.primary,
              pressed && styles.primaryPressed,
            ]}
          >
            <Text style={styles.primaryText}>
              {isLast ? 'Explore now' : 'Next'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => close(false)}
            accessibilityRole="button"
            hitSlop={8}
            style={[styles.secondary, !isLast && styles.secondaryHidden]}
            disabled={!isLast}
          >
            <Text style={styles.secondaryText}>Maybe later</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.scrim,
  },
  sheet: {
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,

    maxHeight: '80%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.line,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    color: COLORS.accentInk,
    fontSize: 13,
    fontWeight: '700',
  },
  skip: {
    color: COLORS.body,
    fontSize: 15,
    fontWeight: '600',
  },
  image: {
    width: 'auto',
    height: "80%",
  },
  title: {
    color: COLORS.ink,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 18,
  },
  body: {
    color: COLORS.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    minHeight: 44, // keeps height steady between slides
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.ink,
  },
  primary: {
    backgroundColor: COLORS.ink,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  secondaryHidden: {
    opacity: 0, // reserves space so the sheet doesn't jump on the last slide
  },
  secondaryText: {
    color: COLORS.body,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default WhatsNewPopup;