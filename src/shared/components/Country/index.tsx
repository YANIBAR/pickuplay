import React, { FC, useMemo, useState } from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Icon, Text, View } from '@components';
import { COLORS, SIZES } from '@constants';
import { isEmpty } from 'lodash';
import styles from './styles';

interface CountryProps {
  value?: any;
  onValueChange: (value: any, index: number) => void;
  icon?: ImageSourcePropType;
  placeholder?: string;
  label?: string;
  errorText?: string;
}

const Country: FC<CountryProps> = ({
  icon,
  label,
  onValueChange,
  placeholder,
  value,
  errorText,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const onFocus = () => {
    setIsFocused(true);
    console.log('ddddddddddd');
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  const countries = useMemo(
    () => [
      { label: 'Austria', value: 'austria' },
      { label: 'Belgium', value: 'belgium' },
      { label: 'Bulgaria', value: 'bulgaria' },
      { label: 'Croatia', value: 'croatia' },
      { label: 'Cyprus', value: 'cyprus' },
      { label: 'Czech Republic', value: 'czech_republic' },
      { label: 'Denmark', value: 'denmark' },
      { label: 'Estonia', value: 'estonia' },
      { label: 'Finland', value: 'finland' },
      { label: 'France', value: 'france' },
      { label: 'Germany', value: 'germany' },
      { label: 'Greece', value: 'greece' },
      { label: 'Hungary', value: 'hungary' },
      { label: 'Iceland', value: 'iceland' },
      { label: 'Ireland', value: 'ireland' },
      { label: 'Italy', value: 'italy' },
      { label: 'Latvia', value: 'latvia' },
      { label: 'Lithuania', value: 'lithuania' },
      { label: 'Luxembourg', value: 'luxembourg' },
      { label: 'Malta', value: 'malta' },
      { label: 'Netherlands', value: 'netherlands' },
      { label: 'Norway', value: 'norway' },
      { label: 'Poland', value: 'poland' },
      { label: 'Portugal', value: 'portugal' },
      { label: 'Romania', value: 'romania' },
      { label: 'Slovakia', value: 'slovakia' },
      { label: 'Slovenia', value: 'slovenia' },
      { label: 'Spain', value: 'spain' },
      { label: 'Sweden', value: 'sweden' },
      { label: 'Switzerland', value: 'switzerland' },
      { label: 'United Kingdom', value: 'united_kingdom' },
      { label: 'Canada', value: 'canada' },
      { label: 'United States', value: 'united_states' },
    ],
    [],
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: !isEmpty(errorText)
              ? COLORS.red
              : isFocused
              ? COLORS.primary
              : COLORS.greyscale500,
            backgroundColor:
              isFocused && !errorText
                ? COLORS.tansparentPrimary
                : COLORS.greyscale500,
          },
        ]}>
        {icon && (
          <Image
            source={icon}
            style={[
              styles.icon,
              {
                tintColor: isFocused ? COLORS.primary : '#BCBCBC',
              },
            ]}
          />
        )}
        <View style={{ flex: 1 }}>
          <RNPickerSelect
            value={value}
            items={countries}
            onDownArrow={onFocus}
            onUpArrow={onBlur}
            onClose={onBlur}
            onValueChange={onValueChange}
            placeholder={{
              value: '',
              label: placeholder,
            }}
            style={{
              inputIOS: {
                fontSize: SIZES.h5,
                fontFamily: 'Urbanist-light',
                backgroundColor: COLORS.transparent,
              },
              inputAndroid: {
                fontSize: SIZES.h5,
                fontFamily: 'Urbanist-light',
                backgroundColor: COLORS.transparent,
              },
              placeholder: {
                fontFamily: 'Urbanist-light',
                color: COLORS.greyscale600,
              },
            }}
            {...rest}
          />
        </View>
      </View>
      {errorText && (
        <View style={styles.errorContainer}>
          <Icon
            type="feather"
            name="info"
            color={COLORS.error}
            size={12}
            style={{ marginRight: 5 }}
          />
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      )}
    </View>
  );
};

export default Country;
