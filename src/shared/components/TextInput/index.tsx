/* eslint-disable react-native/no-inline-styles */
import React, { FC, useState } from 'react';
import {
  TextInput,
  TextInputProps,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { isEmpty } from 'lodash';
import { Icon, Text, View } from '@components';
import { COLORS, icons } from '@constants';
import styles from './styles';

interface InputProps extends TextInputProps {
  icon?: ImageSourcePropType;
  label?: string;
  errorText?: string;
  placeholder?: string;
  password?: boolean;
  inputContainerStyle?: StyleProp<ViewStyle>;
}

const Component: FC<InputProps> = ({
  icon,
  label,
  errorText,
  placeholder,
  password,
  inputContainerStyle,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(
    password || false,
  );

  const onFocus = () => {
    setIsFocused(true);
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          inputContainerStyle,
          {
            borderColor: !isEmpty(errorText)
              ? COLORS.red
              : isFocused
              ? COLORS.primary
              : COLORS.transparentDarkPrimary,
            backgroundColor:
              isFocused && !errorText
                ? COLORS.transparentPrimary
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
        <TextInput
          {...rest}
          onBlur={onBlur}
          onFocus={onFocus}
          autoCapitalize="none"
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          secureTextEntry={secureTextEntry}
          style={[styles.input, { color: COLORS.black }]}
        />
        {password && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSecureTextEntry(!secureTextEntry)}
            style={styles.toggle}>
            <Image
              source={secureTextEntry ? icons.eye : icons.hidden}
              style={[
                styles.eye,
                {
                  tintColor: isFocused ? COLORS.primary : '#BCBCBC',
                },
              ]}
            />
          </TouchableOpacity>
        )}
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

export default Component;
