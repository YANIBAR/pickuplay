import React, { FC } from 'react';
import { TextInput } from '@components';
import { Controller } from 'react-hook-form';
import { ImageSourcePropType } from 'react-native';

interface InputProps {
  icon: ImageSourcePropType;
  name: string;
  control: any;
  defaultValue?: string;
}

const Input: FC<InputProps> = ({
  icon,
  name,
  control,
  defaultValue,
  ...rest
}) => {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <TextInput
          icon={icon}
          value={value}
          onBlur={onBlur}
          onChangeText={onChange}
          errorText={error?.message}
          {...rest}
        />
      )}
    />
  );
};

export default Input;
