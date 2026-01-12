import React from 'react';
import RNPickerSelect from 'react-native-picker-select';
import styles from './styles';

type Items = {
  key?: string;
  label: string;
  value: string;
  inputLabel?: string;
};
interface Props {
  value?: any;
  items: Array<Items>;
  disabled?: boolean;
  placeholder?: string;
  onValueChange: (value: any, index: number) => void;
}

const Component: React.FC<Props> = ({
  items,
  value,
  disabled,
  placeholder,
  onValueChange,
}: Props) => (
  <RNPickerSelect
    items={items}
    value={value}
    disabled={disabled}
    placeholder={{
      label: placeholder,
      value: '',
    }}
    onValueChange={onValueChange}
    useNativeAndroidPickerStyle={false}
    style={{
      placeholder: styles.placeholder,
      inputAndroid: styles.inputAndroid,
    }}
  />
);

export default Component;
