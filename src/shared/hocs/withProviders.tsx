import React, { ComponentType } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import i18n from '@services/localisation';
import store from '../../app/store';

const withProviders = <T extends object>(
  WrappedComponent: ComponentType<T>,
) => {
  const Component: React.FC<T> = props => {
    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <I18nextProvider i18n={i18n}>
            <WrappedComponent {...props} />
          </I18nextProvider>
        </SafeAreaProvider>
      </Provider>
    );
  };

  return Component;
};

export default withProviders;
