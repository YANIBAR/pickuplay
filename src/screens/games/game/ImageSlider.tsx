import { API_BACKEND_URL, JAVA_API } from '@env';
import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, Pressable } from 'react-native';

const { width } = Dimensions.get('window');

interface ImageSliderProps {
  images: string[];
}

export default function ImageSlider({ images }: ImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = ({ item }: { item: string }) => (
    <Image
      source={{ uri: item }}
      style={styles.image}
      resizeMode="cover"
    />
  );

  const renderDot = (index: number) => (
    <View
      key={index}
      style={[
        styles.dot,
        { backgroundColor: index === activeIndex ? '#fff' : 'rgba(255,255,255,0.5)' }
      ]}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={e => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(newIndex);
        }}
        scrollEventThrottle={16}
      />

        <View style={styles.pagination}>
          {images.map((_, index) => renderDot(index))}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 240,
    position: 'relative',
  },
  image: {
    width,
    height: 240,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});