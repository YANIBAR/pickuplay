import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  MatchupsScreen,
  mapFieldsScreen,
  GamesScreen,
  ProfileScreen,
  AddGameScreen
} from '@screens';
import Icon from '@components/Icon';
import TabBar from '@components/TabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { decodeToken } from '@services/auth/auth.utils';
import { COLORS } from '@constants';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useTranslation();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          setRole(null);
          return;
        }
        const userInfo = decodeToken(token);
        setRole(userInfo?.role ?? null);
      } catch (error) {
        console.error('Failed to fetch role:', error);
        setRole(null);
      }
    };
    fetchRole();
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Games"
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}>

      <Tab.Screen
        name="Games"
        component={GamesScreen}
        options={{
          tabBarLabel: t('menu.games'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" type="ionicons" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Fields"
        component={mapFieldsScreen}
        options={{
          tabBarLabel: t('menu.fields'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="navigate" type="ionicons" color={color} size={size} />
          ),
        }}
      />

      {/* Center raised button — only navigable for ORGANIZER, but always visible */}
      {role === 'ORGANIZER' && (
          <Tab.Screen
            name="addGame"
            component={AddGameScreen}
            options={{
              tabBarLabel: '',
              tabBarIcon: ({ color, size }) => (
                <Icon name="add-circle" type="ionicons" color={COLORS.primary} size={size * 2.5} />
              ),
            }}
          />
      )}

      <Tab.Screen
        name="Matchups"
        component={MatchupsScreen}
        options={{
          tabBarLabel: t('menu.matchups'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="sword-cross" type="materialCommunityIcons" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('menu.user'),
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" type="ionicons" color={color} size={size} />
          ),
        }}
      />

    </Tab.Navigator>
  );
};

export default TabNavigator;