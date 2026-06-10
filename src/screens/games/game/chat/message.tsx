import React, { useState } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, Icon } from '@components';
import { COLORS, icons } from '@constants';
import styles from './styles';

const Chat = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [inputMessage, setInputMessage] = useState('');

  const handleInputText = (text: any) => {
    setInputMessage(text);
  };

  return (
    <View style={[styles.contentContainer, { backgroundColor: COLORS.white }]}>
      <View style={[styles.header, { backgroundColor: COLORS.white }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={icons.arrowLeft}
              resizeMode="contain"
              style={[
                styles.headerIcon,
                {
                  tintColor: COLORS.greyscale900,
                },
              ]}
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              {
                color: COLORS.greyscale900,
              },
            ]}>
            Jenny Wilona
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity>
            <Image
              source={icons.call}
              resizeMode="contain"
              style={[
                styles.headerIcon,
                {
                  tintColor: COLORS.greyscale900,
                },
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 16 }}>
            <Image
              source={icons.moreCircle}
              resizeMode="contain"
              style={[
                styles.headerIcon,
                {
                  tintColor: COLORS.greyscale900,
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.chatContainer}></View>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: COLORS.white,
          },
        ]}>
        <View
          style={[
            styles.inputMessageContainer,
            {
              backgroundColor: COLORS.grayscale100,
            },
          ]}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={handleInputText}
            placeholderTextColor={COLORS.greyscale900}
            placeholder="Enter your message..."
          />
          <View style={styles.attachmentIconContainer}>
            <TouchableOpacity>
              <Icon type="feather" name="image" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.microContainer}>
          <Icon
            size={24}
            type="materialCommunityIcons"
            name="microphone"
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Chat;
