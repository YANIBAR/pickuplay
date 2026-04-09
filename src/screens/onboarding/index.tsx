import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Button } from '@components';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import styles from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nav = {
  navigate: (value: string) => void;
};

interface FormData {
  ageGroup: string;
  respondingAs: string;
  numberOfChildren: number;
  games: string[];
  barriers: string[];
  attractiveFeatures: string[];
  suggestions: string;
}

const OnBoardingForm = () => {
  const { t } = useTranslation(); 
  const { navigate } = useNavigation<Nav>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [formData, setFormData] = useState<FormData>({
    ageGroup: '',
    respondingAs: '',
    numberOfChildren: 0,
    games: [],
    barriers: [],
    attractiveFeatures: [],
    suggestions: ''
  });

  const slides = [
    {
      id: 1,
      title: "Find Your Game",
      description:
        "Use filters like sport, city, and date to discover games near you.",
      icon: "🔍"
    },
    {
      id: 2,
      title: "Check Game Details",
      description:
        "View location, time, players, and level before joining.",
      icon: "📋"
    },
    {
      id: 3,
      title: "Join Easily",
      description:
        "Pick number of players, apply promo code, and confirm instantly.",
      icon: "⚡"
    },
    {
      id: 4,
      title: "Play & Enjoy",
      description:
        "Meet players, have fun, and enjoy your game with Pickuplay.",
      icon: "🎉"
    }
  ];

  const currentSlideData = slides[currentSlide];


  const handleNext = async () => {
  if (isLastSlide) {
    await AsyncStorage.setItem("hasLaunched", "true");
    navigate("welcome");
    return;
  }
  setCurrentSlide(currentSlide + 1);
  scrollViewRef.current?.scrollTo({ y: 0, animated: true });
};

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const renderSlide = () => {
    const slide = currentSlideData;
    
    return (
      <View style={styles.slideContainer}>
        <Text style={styles.slideNumber}>
          {currentSlide + 1}
        </Text>
        
        <View style={styles.slideTitleContainer}>
          <Text style={styles.slideTitleFr}>{slide.title}</Text>
        </View>
        <Text style={[ styles.optionText]}>
          {`${slide.description}`}
        </Text>
      </View>
    );
  };

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSlide()}
      </ScrollView>
      
      <View style={styles.buttonsContainer}>
        <Button 
          onPress={handlePrevious}
          title={t('onboarding.previousButton')}
          disabled={isFirstSlide}
          style={[
            styles.navigationButton,
            styles.previousButton,
            isFirstSlide && styles.hiddenButton
          ]}
        />
        
        <Button 
          onPress={handleNext}
          title={isLastSlide 
            ? t('onboarding.finishButton') 
            : t('onboarding.nextButton')
          }
          style={[styles.navigationButton, styles.nextButton]}
        />
      </View>
    </View>
  );
};

export default OnBoardingForm;