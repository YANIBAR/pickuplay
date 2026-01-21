import { View, Text, TouchableOpacity, useWindowDimensions, Image, ListRenderItem } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, icons, images } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { messsagesData } from '../../shared/data';
import { FlatList } from 'react-native-gesture-handler';
import styles from './styles';

// inbox tabs
const Inbox = () => {
  const { navigate } = useNavigation<Nav>();

  /**
   * render header
   */
  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Image
            source={images.logo}
            resizeMode='contain'
            style={styles.headerLogo}
          />
          <Text style={[styles.headerTitle, {
            color: COLORS.greyscale900
          }]}>Inbox</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Image
              source={icons.search}
              resizeMode='contain'
              style={[styles.searchIcon, {
                tintColor: COLORS.greyscale900
              }]}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={icons.moreCircle}
              resizeMode='contain'
              style={[styles.moreCircleIcon, {
                tintColor: COLORS.greyscale900
              }]}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  interface MessageData {
    id: string;
    fullName: string;
    lastMessage: string;
    lastMessageTime: string;
    isOnline: boolean;
    userImg: any;
    messageInQueue: number;
  }
  const renderItem: ListRenderItem<MessageData> = ({ item, index }) => (
    <TouchableOpacity
        key={index}
        onPress={() =>
            navigate('chat', {
                userName: item.fullName,
            })
        }
        style={[
            styles.userContainer,
            {
                borderBottomWidth: 1,
            },
            index % 2 !== 0 ? {
                backgroundColor: COLORS.tertiaryWhite,
                borderBottomWidth: 1,
                borderTopWidth: 0
            } : null,
        ]}>
        <View style={styles.userImageContainer}>
            {item.isOnline && (
                <View style={styles.onlineIndicator} />
            )}
            <Image
                source={item.userImg}
                resizeMode="contain"
                style={styles.userImage}
            />
        </View>
        <View style={{ flexDirection: "row", width: SIZES.width - 104 }}>
          <View style={styles.userInfoContainer}>
              <Text style={[styles.userName, { color: COLORS.black }]}>
                  {item.fullName}
              </Text>
              <Text style={styles.lastSeen}>{item.lastMessage}</Text>
          </View>
          <View style={{
              position: "absolute",
              right: 4,
              alignItems: "center"
          }}>
              <Text style={[styles.lastMessageTime, { color: COLORS.black }]}>
                  {item.lastMessageTime}
              </Text>
              {item.messageInQueue > 0 && (
                  <TouchableOpacity style={{
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: COLORS.primary,
                      marginTop: 12
                  }}>
                      <Text style={styles.messageInQueue}>{item.messageInQueue}</Text>
                  </TouchableOpacity>
              )}
          </View>
        </View>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        {renderHeader()}
          <View>
            <FlatList
                data={messsagesData}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
            />
          </View>
      </View>
    </SafeAreaView>
  )
};

export default Inbox