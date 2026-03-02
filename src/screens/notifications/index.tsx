import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, icons } from '@constants';

import { NavigationProp } from '@react-navigation/native';
import { ScrollView } from 'react-native-virtualized-view';
import { notifications } from '@data';
import NotificationCard from '@components/NotificationCard';
import { useNavigation } from '@react-navigation/native';

const Notifications = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  /**
  * render header
  */
  const renderHeader = () => {
      return (
          <View style={styles.headerContainer}>
              <View style={styles.headerLeft}>
                  <TouchableOpacity
                      onPress={() => navigation.goBack()}>
                      <Image
                          source={icons.back}
                          style={[styles.backIcon, {
                              tintColor: COLORS.black
                          }]} />
                  </TouchableOpacity>
                  <Text style={[styles.headerTitle, {
                      color: COLORS.black
                  }]}>Notification</Text>
              </View>
              {/*<TouchableOpacity>
                  <Image
                      source={icons.setting2Outline}
                      style={[styles.moreIcon, {
                          tintColor: COLORS.black
                      }]}
                  />
              </TouchableOpacity>*/}
          </View>
      )
  };

  return (
      <SafeAreaView style={[styles.area, { backgroundColor: COLORS.white }]}>
          <View style={[styles.container, { backgroundColor: COLORS.white }]}>
              {renderHeader()}
              <ScrollView showsVerticalScrollIndicator={false}>
                  <FlatList
                      data={notifications}
                      keyExtractor={item => item.id}
                      renderItem={({ item, index }) => (
                          <NotificationCard
                              title={item.title}
                              description={item.description}
                              date={item.date}
                              time={item.time}
                              type={item.type}
                              isNew={item.isNew}
                          />
                      )}
                  />
              </ScrollView>
          </View>
      </SafeAreaView>
  )
};

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 16
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 16
    },
    scrollView: {
        backgroundColor: COLORS.tertiaryWhite
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center"
    },
    backIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.black,
        marginRight: 16
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "bold",
        color: COLORS.black
    },
    moreIcon: {
        width: 24,
        height: 24,
        tintColor: COLORS.black
    },
})

export default Notifications