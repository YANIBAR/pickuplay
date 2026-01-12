import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import {
  WelcomeScreen,
  SettingScreen,
  EventsScreen,
  ChartScreen,
  ScanQRCodeScreen,
  PhotoIdScreen,
  MembershipScreen
} from '@screens';
import Icon from '@components/Icon';
import TabBar from '@components/TabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  
  const getUserData = async () => {
    try {
      const keys = ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'profileImage'];
      const result = await AsyncStorage.multiGet(keys);
            
      // Convert the array of key-value pairs into an object
      const userData = {};
      result.forEach(([key, value]) => {
        if (value !== null) {
          userData[key] = value;
        }
      });
      
      console.log("Parsed user data:", userData);
      return userData;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  };

  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        const user = await getUserData();
        
        // If no user data, retry once after a short delay
        if (!user || Object.keys(user).length === 0) {
          console.log("No user data found, retrying...");
          await new Promise(resolve => setTimeout(resolve, 200));
          const retryUser = await getUserData();
          setUserData(retryUser);
        } else {
          setUserData(user);
        }
        
        setIsLoading(false);
      };
      
      fetchData();
    }, [])
  );

  // Show a loading state while fetching user data
  if (isLoading || !userData) {
    return null; // Or a loading spinner component
  }

  const isPartner = userData?.role === 'Partner';
  

  return (
    <Tab.Navigator
      initialRouteName={isPartner ? "Charts" : "Memberships"}
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}>

      {!isPartner && (
        <Tab.Screen
          name="Memberships"
          component={MembershipScreen}
          options={{
            tabBarLabel: t('menu.memberships'),
            tabBarIcon: ({ color, size }) => (
              <Icon name="qrcode" type="antDesign" color={color} size={size} />
            ),
          }}
        />
      )}
      
      {isPartner && (
        <>
          <Tab.Screen
            name="Charts"
            component={ChartScreen}
            options={{
              tabBarLabel: t('menu.charts'),
              tabBarIcon: ({ color, size }) => (
                <Icon name="pie-chart" type="feather" color={color} size={size} />
              ),
            }}
          /> 
          <Tab.Screen
            name="ScanQRCode"
            component={ScanQRCodeScreen}
            options={{
              tabBarLabel: t('menu.scan_qr'),
              tabBarIcon: ({ color, size }) => (
                <Icon name="qrcode-scan" type="materialCommunityIcons" color={color} size={size} />
              ),
            }}
          />
        </>
      )}

      {!isPartner && (
        <Tab.Screen
          name="Events"
          component={EventsScreen}
          options={{
            tabBarLabel: t('menu.events'),
            tabBarIcon: ({ color, size }) => (
              <Icon name="calendar" type="feather" color={color} size={size} />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{
          tabBarLabel: t('menu.menu'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="menu" type="feather" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
