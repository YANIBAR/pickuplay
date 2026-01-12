import React, { useMemo } from 'react';
import { FlatList, FlatListProps, StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, NoData } from '@components';
import { isEmpty } from 'lodash';
import styles from './styles';

interface Props<ItemT> extends FlatListProps<ItemT> {
  data: Array<ItemT> | undefined;
  loading?: boolean;
  loadMore?: () => void;
  onRefresh?: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const Component = <ItemT,>({
  data,
  loading,
  loadMore,
  onRefresh,
  contentContainerStyle,
  ...props
}: Props<ItemT>) => {
  const _isEmpty = useMemo(() => isEmpty(data), [data]);

  const listEmptyComponent = (): JSX.Element =>
    loading ? <ActivityIndicator /> : <NoData />;

  const listFooterComponent = (): JSX.Element => <ActivityIndicator />;

  return (
    <FlatList
      data={data}
      onRefresh={onRefresh}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={listEmptyComponent}
      ListFooterComponent={listFooterComponent}
      ListFooterComponentStyle={styles.listFooterComponent}
      contentContainerStyle={_isEmpty ? styles.noData : contentContainerStyle}
      {...props}
    />
  );
};

export default Component;
