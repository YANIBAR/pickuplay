import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Button } from '@components';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';

type Nav = {
  navigate: (value: string) => void;
};

interface FormData {
  ageGroup: string;
  respondingAs: string;
  numberOfChildren: number;
  activities: string[];
  barriers: string[];
  attractiveFeatures: string[];
  suggestions: string;
}

const OnBoardingForm = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigation<Nav>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [formData, setFormData] = useState<FormData>({
    ageGroup: '',
    respondingAs: '',
    numberOfChildren: 0,
    activities: [],
    barriers: [],
    attractiveFeatures: [],
    suggestions: ''
  });

  // Question 1: Age groups
  const ageGroups = [
    { key: '18-25', label: '18-25', labelAr: '18-25' },
    { key: '26-35', label: '26-35', labelAr: '26-35' },
    { key: '36-45', label: '36-45', labelAr: '36-45' },
    { key: '46-55', label: '46-55', labelAr: '46-55' },
    { key: '55+', label: '55+', labelAr: '55+' }
  ];

  // Question 2: Responding as
  const respondingAsOptions = [
    { key: 'young_with_kids', label: 'Jeune avec enfants', labelAr: 'شاب مع أطفال' },
    { key: 'young_without_kids', label: 'Jeune sans enfants', labelAr: 'شاب بدون أطفال' }
  ];

  // Question 4: Activities
  const activities = [
    { key: 'zoos', label: 'Zoos & aquariums', labelAr: 'حدائق الحيوان' },
    { key: 'museums', label: 'Musées', labelAr: 'المتاحف' },
    { key: 'fairs', label: 'Foires', labelAr: 'معارض' },
    { key: 'outdoor_sports', label: 'Sports en plein air', labelAr: 'رياضات خارجية' },
    { key: 'indoor_games', label: 'Jeux électroniques', labelAr: 'ألعاب إلكترونية' },
    { key: 'cinema', label: 'Cinéma', labelAr: 'السينما' },
    { key: 'live_shows', label: 'Spectacles en direct', labelAr: 'العروض المباشرة' },
    { key: 'farm', label: 'Ferme', labelAr: 'مزرعة' },
    { key: 'sports_events', label: 'Événements sportifs', labelAr: 'أحداث رياضية' },
    { key: 'aquatic', label: 'Aquatique & piscine', labelAr: 'مسابح ومائية' }
  ];

  // Question 5: Barriers
  const barriers = [
    { key: 'time', label: 'Manque de temps', labelAr: 'نقص الوقت' },
    { key: 'information', label: 'Manque d\'information', labelAr: 'نقص المعلومات' },
    { key: 'expensive', label: 'Trop cher', labelAr: 'مكلف جداً' },
    { key: 'other', label: 'Autre', labelAr: 'أخرى' }
  ];

  // Question 6: Attractive features
  const attractiveFeatures = [
    { key: 'flexibility', label: 'Flexibilité', labelAr: 'مرونة' },
    { key: 'price', label: 'Prix', labelAr: 'السعر' },
    { key: 'premium_access', label: 'Accès à des lieux premium', labelAr: 'الوصول لأماكن مميزة' },
    { key: 'mobile_app', label: 'Application mobile avec offres', labelAr: 'تطبيق جوال مع عروض' },
    { key: 'new_places', label: 'Ajout mensuel de nouveaux lieux', labelAr: 'إضافة أماكن جديدة شهرياً' },
    { key: 'loyalty_rewards', label: 'Récompenses de fidélité', labelAr: 'مكافآت الولاء' }
  ];

  const questions = [
    {
      id: 1,
      titleFr: "Quel est votre groupe d'âge ?",
      titleAr: "كم عمرك؟",
      type: 'single_choice',
      options: ageGroups,
      required: true
    },
    {
      id: 2,
      titleFr: "Répondez-vous en tant que :",
      titleAr: "تجيب بصفتك:",
      type: 'single_choice',
      options: respondingAsOptions,
      required: true
    },
    {
      id: 3,
      titleFr: "Combien d'enfants y a-t-il dans votre foyer ?",
      titleAr: "كم عدد الأطفال في منزلك؟",
      type: 'number_input',
      required: true,
      showIf: () => formData.respondingAs === 'young_with_kids'
    },
    {
      id: 4,
      titleFr: "Quels types d'activités appréciez-vous le plus ?",
      titleAr: "ما هي أنواع الأنشطة التي تستمتع بها أكثر؟",
      type: 'multiple_choice',
      options: activities,
      required: true
    },
    {
      id: 5,
      titleFr: "Qu'est-ce qui vous empêche de participer plus souvent à ces activités ?",
      titleAr: "ما الذي يمنعك من القيام بهذه الأنشطة بشكل أكثر تكراراً؟",
      type: 'multiple_choice',
      options: barriers,
      required: true
    },
    {
      id: 6,
      titleFr: "Quelles caractéristiques rendraient ce Pack le plus attractif ?",
      titleAr: "ما الذي يجعل هذا الاشتراك أكثر جاذبية بالنسبة لك؟",
      type: 'multiple_choice',
      options: attractiveFeatures,
      required: true
    },
    {
      id: 7,
      titleFr: "Suggestions pour rendre le pass plus attrayant ?",
      titleAr: "هل لديك أي اقتراحات لجعل الإشتراك أكثر جاذبية؟",
      type: 'text_input',
      required: false
    }
  ];

  // Filter questions based on conditions
  const getVisibleQuestions = () => {
    return questions.filter(question => {
      if (question.showIf) {
        return question.showIf();
      }
      return true;
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const currentQuestionData = visibleQuestions[currentQuestion];

  const handleSingleChoice = (questionId: number, value: string) => {
    switch (questionId) {
      case 1:
        setFormData({ ...formData, ageGroup: value });
        break;
      case 2:
        setFormData({ ...formData, respondingAs: value });
        break;
    }
  };

  const handleMultipleChoice = (questionId: number, value: string) => {
    let updatedArray: string[] = [];
    
    switch (questionId) {
      case 4:
        updatedArray = formData.activities.includes(value)
          ? formData.activities.filter(item => item !== value)
          : [...formData.activities, value];
        setFormData({ ...formData, activities: updatedArray });
        break;
      case 5:
        updatedArray = formData.barriers.includes(value)
          ? formData.barriers.filter(item => item !== value)
          : [...formData.barriers, value];
        setFormData({ ...formData, barriers: updatedArray });
        break;
      case 6:
        updatedArray = formData.attractiveFeatures.includes(value)
          ? formData.attractiveFeatures.filter(item => item !== value)
          : [...formData.attractiveFeatures, value];
        setFormData({ ...formData, attractiveFeatures: updatedArray });
        break;
    }
  };

  const handleNumberInput = (value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData({ ...formData, numberOfChildren: numValue });
  };

  const handleTextInput = (value: string) => {
    setFormData({ ...formData, suggestions: value });
  };

  const isCurrentQuestionAnswered = () => {
    const question = currentQuestionData;
    
    if (!question.required) return true;
    
    switch (question.id) {
      case 1:
        return formData.ageGroup !== '';
      case 2:
        return formData.respondingAs !== '';
      case 3:
        return formData.numberOfChildren > 0;
      case 4:
        return formData.activities.length > 0;
      case 5:
        return formData.barriers.length > 0;
      case 6:
        return formData.attractiveFeatures.length > 0;
      case 7:
        return true; // Optional question
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentQuestion < visibleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      // Save form data and complete onboarding
      try {
        await AsyncStorage.setItem('onboardingData', JSON.stringify(formData));
        await AsyncStorage.setItem('hasLaunched', 'true');
        console.log('Onboarding completed with data:', formData);
        navigate('prize');
      } catch (error) {
        console.error('Error saving onboarding data:', error);
        navigate('prize');
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const renderQuestion = () => {
    const question = currentQuestionData;
    
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>
          {currentQuestion + 1} / {visibleQuestions.length}
        </Text>
        
        <View style={styles.questionTitleContainer}>
          <Text style={styles.questionTitleFr}>{question.titleFr}</Text>
          <Text style={styles.questionTitleAr}>{question.titleAr}</Text>
        </View>

        {question.type === 'single_choice' && (
          <View style={styles.optionsContainer}>
            {question.options?.map((option) => {
              const isSelected = question.id === 1 
                ? formData.ageGroup === option.key
                : formData.respondingAs === option.key;
              
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => handleSingleChoice(question.id, option.key)}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOptionButton
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText
                  ]}>
                    {`${option.label} | ${option.labelAr}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {question.type === 'multiple_choice' && (
          <View style={styles.optionsContainer}>
            {question.options?.map((option) => {
              let isSelected = false;
              switch (question.id) {
                case 4:
                  isSelected = formData.activities.includes(option.key);
                  break;
                case 5:
                  isSelected = formData.barriers.includes(option.key);
                  break;
                case 6:
                  isSelected = formData.attractiveFeatures.includes(option.key);
                  break;
              }
              
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => handleMultipleChoice(question.id, option.key)}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOptionButton
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText
                  ]}>
                    {`${option.label} | ${option.labelAr}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {question.type === 'number_input' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.numberInput}
              value={formData.numberOfChildren.toString()}
              onChangeText={handleNumberInput}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        )}

        {question.type === 'text_input' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={formData.suggestions}
              onChangeText={handleTextInput}
              placeholder="Vos suggestions... | اقتراحاتك..."
              multiline={true}
              numberOfLines={4}
            />
          </View>
        )}
      </View>
    );
  };

  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === visibleQuestions.length - 1;

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderQuestion()}
      </ScrollView>
      
      <View style={styles.buttonsContainer}>
        <Button 
          onPress={handlePrevious}
          title={t('onboarding.previousButton')}
          disabled={isFirstQuestion}
          style={[
            styles.navigationButton,
            styles.previousButton,
            isFirstQuestion && styles.hiddenButton
          ]}
        />
        
        <Button 
          onPress={handleNext}
          title={isLastQuestion 
            ? t('onboarding.finishButton') 
            : t('onboarding.nextButton')
          }
          disabled={!isCurrentQuestionAnswered()}
          style={[styles.navigationButton, styles.nextButton]}
        />
      </View>
    </View>
  );
};

export default OnBoardingForm;