declare module 'react-native-snap-carousel' {
  import React from 'react';

  export interface CarouselProps<T> {
    data: T[];
    renderItem: (item: { item: T; index: number }) => React.ReactElement;
    itemWidth: number;
    sliderWidth: number;
    firstItem?: number;
    onSnapToItem?: (index: number) => void;
    loop?: boolean;
    autoplay?: boolean;
    autoplayInterval?: number;
    [key: string]: any;
  }

  export default class Carousel<T> extends React.Component<CarouselProps<T>> {}
}