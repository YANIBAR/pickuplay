import React from 'react';
import DatePicker, { DatePickerProps } from 'react-native-date-picker';
import styles from './styles';

interface Props extends DatePickerProps {
  date: Date;
  open?: boolean;
  onConfirm?: (date: Date) => void;
  onCancel?: () => void;
}

const Component: React.FC<Props> = ({
  open,
  date = new Date(),
  onConfirm,
  onCancel,
  ...props
}: Props) => (
  <DatePicker
    modal
    open={open}
    date={date}
    onCancel={onCancel}
    onConfirm={onConfirm}
    style={styles.inputContainer}
    {...props}
  />
);

export default Component;
