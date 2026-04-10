import Onboarding from 'react-native-onboarding-swiper';
import { Image, View, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import styles from './styles';
import { Button } from '@components';
import { COLORS } from '@constants';

type Nav = {
  navigate: (value: string) => void;
};

const onboardingPages = [
  {
    backgroundColor: COLORS.white,
    image: <Image source={require('../../assets/illustrations/onboarding/step1.png')} style={{ width: 200, height: 400 }} />,
    title: 'Find Your Game',
    subtitle: 'Filter by city, sport, and day to quickly discover games near you. \nPick what fits your schedule and jump in.',
  },
  {
    backgroundColor: COLORS.white,
    image: <Image source={require('../../assets/illustrations/onboarding/step2.png')} style={{ width: 200, height: 200 }} />,
    title: 'Real-time Notifications',
    subtitle: 'Tap Join, choose players, bring a guest, and apply a discount code if you have one. \nYou\'re in instantly.',
  },
  {
    backgroundColor: COLORS.white,
    image: <Image source={require('../../assets/illustrations/onboarding/step3.png')} style={{ width: 200, height: 200 }} />,
    title: 'Never Miss an Update',
    subtitle: 'Get notified if the game is updated, canceled, or full. \nReceive reminders before kickoff so you`re always on time.',
  },
  {
    backgroundColor: COLORS.white,
    image: <Image source={require('../../assets/illustrations/onboarding/onboarding1.png')} style={{ width: 200, height: 200 }} />,
    title: 'Play & Connect',
    subtitle: 'Meet new players, enjoy the game, and bring positive vibes. \n Pickuplay is all about fun, community, and good energy ⚽',
  },
];

export default function OnboardingScreen() {

  const { t } = useTranslation(); 
  const { navigate } = useNavigation<Nav>();
  const handleDone = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    navigate('welcome');
  };

  return (
    
    <Onboarding
      pages={onboardingPages}
      bottomBarColor={COLORS.white}
      onDone={handleDone}
      onSkip={handleDone}
      bottomBarHighlight={false}
      showSkip
      showNext
      showDone
      titleStyles={{ fontFamily: 'YourCustomFont-Bold', fontSize: 24 }}
      subTitleStyles={{ fontFamily: 'YourCustomFont-Regular', fontSize: 16 }}
      containerStyles={{ paddingBottom: 40 }}
      // You can also customize buttons and dots here
       NextButtonComponent={({ isLight, ...NextButtonProps }) => (
        <Button 
        onPress={NextButtonProps.onPress}
          title={t('onboarding.nextButton')}
          style={[
            styles.navigationButton,
            styles.nextButton
          ]}
        />
      )}
      SkipButtonComponent={({ isLight, ...SkipButtonProps }) => (
        <Button 

        onPress={SkipButtonProps.onPress}
          title={t('onboarding.skipButton')}
          style={[
            styles.navigationButton,
            styles.nextButton
          ]}
        />
      )}
    />
  );
}