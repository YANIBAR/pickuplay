import React, { ComponentType } from 'react';
import { Provider } from 'react-redux';
import store from '../../app/store';

const withReduxProvider = <T extends object>(
  WrappedComponent: ComponentType<T>,
) => {
  const Component: React.FC<T> = props => {
    return (
      <Provider store={store}>
        <WrappedComponent {...props} />;
      </Provider>
    );
  };

  return Component;
};

export default withReduxProvider;
