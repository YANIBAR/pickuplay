import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions } from 'react-native';
import Carousel, { CarouselProps } from 'react-native-snap-carousel';
import styles from './styles';

const { width } = Dimensions.get('window');

interface OwlCarouselProps<T,> extends CarouselProps<T> {
  data: T[];
  firstItem?: number;
  renderItem: (item: { item: T; index: number }) => React.ReactElement;
  onSnapToItem?: (slideIndex: number) => void;
  sliderWidth?: number;
  itemWidth?: number;
}

const OwlCarousel = <T,>({
  data,
  firstItem,
  renderItem,
  onSnapToItem,
  itemWidth = width,
  sliderWidth = width,
  ...props
}: OwlCarouselProps<T>) => {
  const [slideIndex, setSlideIndex] = useState<number>(firstItem || 0);

  const dotsLength = useMemo(() => data.length, [data.length]);

  const _onSnapToItem = useCallback(
    (index: number) => {
      setSlideIndex(index);
      onSnapToItem && onSnapToItem(index);
    },
    [onSnapToItem],
  );

  return (
    <>
      <Carousel
        data={data}
        itemWidth={itemWidth}
        renderItem={renderItem}
        sliderWidth={sliderWidth}
        onSnapToItem={_onSnapToItem}
        {...props}
      />
    </>
  );
};

export default OwlCarousel;
