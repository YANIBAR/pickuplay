import React, { ComponentType } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const withSafeAreaProvider = <T extends object>(
  WrappedComponent: ComponentType<T>,
) => {
  const Component: React.FC<T> = props => {
    return (
      <SafeAreaProvider>
        <WrappedComponent {...props} />;
      </SafeAreaProvider>
    );
  };

  return Component;
};

export default withSafeAreaProvider;
