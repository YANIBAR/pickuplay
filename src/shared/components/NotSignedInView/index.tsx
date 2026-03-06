import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, icons } from '@constants';
import { useNavigation } from '@react-navigation/native';
import styles from './styles';
import Button from '@components/Button';

interface NotSignedInViewProps {
  heading?: string;
  description?: string;
  signInLabel?: string;
  signUpPrompt?: string;
  signUpLabel?: string;
  signInRoute?: string;
  signUpRoute?: string;
  containerStyle?: object;
  onNavigate?: () => void;
}

const NotSignedInView: React.FC<NotSignedInViewProps> = ({
  heading,
  description,
  signInLabel,
  signUpPrompt,
  signUpLabel,
  signInRoute = 'login',
  signUpRoute = 'register',
  containerStyle,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation(); 
  const handleNavigate = (route: string) => {
    onNavigate?.();        // close modal first
    navigation.navigate(route);
  };
  return (
    <View style={[styles.bottomContainer, { backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 24 }]}
    >
      {/* Icon */}
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: COLORS.primary + '15',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Image
          source={icons.user as ImageSourcePropType}
          resizeMode="contain"
          style={{ width: 40, height: 40, tintColor: COLORS.primary }}
        />
      </View>

      {/* Heading */}
      <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.grayscale900, marginBottom: 8, textAlign: 'center' }}>
        {heading ?? t("You're not signed in")}
      </Text>

      {/* Description */}
      <Text style={{ fontSize: 14, color: COLORS.grayscale700, textAlign: 'center', marginBottom: 10, lineHeight: 20 }}>
        {description ?? t('Sign in to view your profile, stats, and organized games.')}
      </Text>

      {/* Sign In Button */}
       <Button
        filled
        title={t('Sign In')}
        onPress={() => handleNavigate("login")}
        style={styles.button}
      />
      {/* Sign Up Link */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <Text style={{ color: COLORS.grayscale700, fontSize: 14 }}>
          {signUpPrompt ?? t("Don't have an account?")}{'  '}
        </Text>
        <TouchableOpacity onPress={() => handleNavigate("register")} activeOpacity={0.7}>
          <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '600' }}>
            {signUpLabel ?? t('Sign Up')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotSignedInView;