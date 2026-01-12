import React, { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

const withTranslate = <T extends object>(
  WrappedComponenet: ComponentType<T>,
) => {
  const Component: React.FC<T> = props => {
    const translation = useTranslation();
    return <WrappedComponenet {...translation} {...props} />;
  };

  return Component;
};

export default withTranslate;
