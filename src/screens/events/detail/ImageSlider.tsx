import { API_BACKEND_URL } from '@env';
import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList } from 'react-native';

const { width } = Dimensions.get('window');

interface ImageSliderProps {
  images: string[];
  folder?: 'events' | 'partners' | 'activities'; // Add flexibility for different folders
}

export default function ImageSlider({ images, folder = 'events' }: ImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = ({ item }: { item: string }) => (
    <Image
      source={{ uri: `${API_BACKEND_URL}/${folder}/${item || 'placeholder.png'}` }}
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
        keyExtractor={(item, index) => `${item}-${index}`}
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
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
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