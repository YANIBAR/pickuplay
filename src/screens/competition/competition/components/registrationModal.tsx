import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Modal, Pressable, TextInput, Alert } from 'react-native';
import { Button, ConfirmModal, Icon, NotSignedInView } from '@components';
import { JAVA_API } from '@env';
import { COLORS, FONTS, icons,SIZES } from '@constants';
import { useNavigation } from '@react-navigation/native';
import { authenticatedApi } from '@services/api';
import { useTranslation } from 'react-i18next';
import { isStoredTokenExpired } from '@utils/api/auth';
import PriceTag from '@components/PriceTag';
import { useUserData } from '@services/useUserData';

  const getGameIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      1: 'soccer',
      2: 'basketball',
      3: 'volleyball',
      5: 'tennis',
      4: 'hockey-sticks',
      6: 'cricket',
      7: 'table-tennis',
      8: 'football',
      9: 'baseball',
    };
    return iconMap[type] || 'sports';
  };


  export default function GameCard({ game , onRefresh }: GameCardProps) {
    const navigation = useNavigation();
    const { t } = useTranslation();

    const [isLogged, setIsLogged] = useState(false);
    
    const { userData, error, refreshUserData } = useUserData(); 
   
    return (
      <>
      </>
    );
  }
  