import React, { FC, ReactNode, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Image,
  TextInputProps,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { isEmpty } from 'lodash';
import { View, Text, ChildrenModal, Icon } from '@components';
import { COLORS, SIZES, icons } from '@constants';
import styles from './styles';

interface AreasCodesProps {
  visible: boolean;
  onClose?: () => void;
  children: ReactNode;
}

const AreasCodesModal: FC<AreasCodesProps> = ({
  visible,
  onClose,
  children,
}) => (
  <ChildrenModal visible={visible}>
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            height: 400,
            width: SIZES.width * 0.8,
            backgroundColor: COLORS.white,
            borderRadius: 12,
          }}>
          {children}
        </View>
      </View>
    </TouchableWithoutFeedback>
  </ChildrenModal>
);

interface InputProps extends TextInputProps {
  icon?: ImageSourcePropType;
  label?: string;
  errorText?: string;
  placeholder?: string;
  inputContainerStyle?: StyleProp<ViewStyle>;
  onSelectCode?: (code: string) => void; // 👈 new prop
}

interface CountryData {
  code: string;
  name: string;
  callingCode: string;
  flag: string;
  emoji: string;
}

const Phone: FC<InputProps> = ({
  label,
  style,
  errorText,
  placeholder,
  ...rest
}) => {
  const [areas, setAreas] = useState<CountryData[]>([]);
  const [selectedArea, setSelectedArea] = useState<CountryData | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onFocus = () => {
    setIsFocused(true);
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  useEffect(() => {
    const loadCountries = () => {
      setIsLoading(true);
      
      // Static data for the 5 required countries
      const selectedCountries: CountryData[] = [
        {
          code: 'US',
          name: 'United States',
          callingCode: '+1',
          flag: 'https://flagcdn.com/w320/us.png',
          emoji: '🇺🇸'
        },
        {
          code: 'CA',
          name: 'Canada',
          callingCode: '+1',
          flag: 'https://flagcdn.com/w320/ca.png',
          emoji: '🇨🇦'
        },
        {
          code: 'FR',
          name: 'France',
          callingCode: '+33',
          flag: 'https://flagcdn.com/w320/fr.png',
          emoji: '🇫🇷'
        },
        {
          code: 'MA',
          name: 'Morocco',
          callingCode: '+212',
          flag: 'https://flagcdn.com/w320/ma.png',
          emoji: '🇲🇦'
        },
        {
          code: 'AE',
          name: 'United Arab Emirates',
          callingCode: '+971',
          flag: 'https://flagcdn.com/w320/ae.png',
          emoji: '🇦🇪'
        },
      ];

      console.log(`Loaded ${selectedCountries.length} countries`);
      setAreas(selectedCountries);
      
      // Set default to US
      setSelectedArea(selectedCountries[0]); // US is first in the array
      setIsLoading(false);
    };

    loadCountries();
  }, []);

  const renderItem = ({ item }: { item: CountryData }) => {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          setSelectedArea(item);
          setVisible(false);
          rest.onSelectCode?.(item.callingCode); // 👈 send back calling code
        }}>
        <Image
          source={{ uri: item.flag }}
          resizeMode="contain"
          style={{
            height: 30,
            width: 40,
            marginRight: 10,
            borderRadius: 4,
          }}
          onError={(error) => {
            console.log('Flag image failed to load for', item.name, error.nativeEvent.error);
          }}
        />
        <View style={{ flex: 1 }}>
          <Text size="h4" numberOfLines={1}>{item.name}</Text>
        </View>
        <Text style={{ color: COLORS.gray, fontSize: 12, marginLeft: 10 }}>
          {item.callingCode}
        </Text>
      </TouchableOpacity>
    );
  };

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
        <TouchableOpacity
          style={styles.flagContainer}
          onPress={() => !isLoading && setVisible(true)}
          disabled={isLoading}>
          <View style={{ justifyContent: 'center', marginLeft: 5 }}>
            <Image
              source={icons.arrowDown}
              resizeMode="contain"
              style={[styles.downIcon, { opacity: isLoading ? 0.5 : 1 }]}
            />
          </View>
          <View style={{ justifyContent: 'center', marginLeft: 5 }}>
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : selectedArea?.flag ? (
              <Image
                source={{ uri: selectedArea.flag }}
                resizeMode="contain"
                style={[styles.flagIcon, { borderRadius: 2 }]}
                onError={() => console.log('Selected flag failed to load:', selectedArea.name)}
              />
            ) : (
              <View
                style={[
                  styles.flagIcon,
                  { backgroundColor: COLORS.greyscale300, borderRadius: 2 }
                ]}
              />
            )}
          </View>
          <View style={{ justifyContent: 'center', marginLeft: 5 }}>
            <Text style={{ color: COLORS.black, fontSize: 12 }}>
              {isLoading ? '...' : selectedArea?.callingCode || '+1'}
            </Text>
          </View>
        </TouchableOpacity>
        <TextInput
          {...rest}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          keyboardType="numeric"
          style={[styles.input, style]}
        />

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
      <AreasCodesModal visible={visible} onClose={() => setVisible(false)}>
        {isLoading ? (
          <View style={{ 
            padding: 20, 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 200 
          }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 10, color: COLORS.gray }}>
              Loading countries...
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <View style={{ 
              padding: 15, 
              borderBottomWidth: 1, 
              borderBottomColor: COLORS.greyscale300 
            }}>
              <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>
                Select Country ({areas.length} countries)
              </Text>
            </View>
            <FlatList
              data={areas}
              renderItem={renderItem}
              keyExtractor={item => item.code}
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 10 }}
              showsVerticalScrollIndicator={true}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={5}
              getItemLayout={(data, index) => ({
                length: 60,
                offset: 60 * index,
                index,
              })}
            />
          </View>
        )}
      </AreasCodesModal>
    </View>
  );
};

export default Phone;