import React, { ComponentType } from 'react';
import { ActivityIndicator } from 'react-native';

const withLoader = <T extends object>(WrappedComponent: ComponentType<T>) => {
  const Component: React.FC<T & { loading: boolean }> = ({
    loading,
    ...props
  }: { loading: boolean } & T) => {
    if (loading) {
      <ActivityIndicator />;
    }
    return <WrappedComponent {...(props as T)} />;
  };

  return Component;
};

export default withLoader;
