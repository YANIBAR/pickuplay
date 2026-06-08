import React, { useEffect, useState } from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import styles from './styles';
import ScheduleHeader from './components/Header';
import DayCard from './components/DayCard';
import GameModal from './components/GameModal';
import { authenticatedApi } from '@services/api';
import { isStoredTokenExpired } from '@utils/api/auth';
import { Header } from '@components';
import { useTranslation } from 'react-i18next';

interface Participant {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  status: string;
  joinedAt: string;
}

interface Game {
  id: number;
  title: string;
  description: string;
  sportType: string;
  city: string;
  address: string;
  startTime: string;
  endTime: string;
  nbrSpots: number;
  currentParticipants: number;
  creatorId: number;
  creatorName: string;
  isPrivate: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  status?: string;
  price?: string;
}

interface FormData {
  address: string;
  date: Date | null;
  startTime: string;
  endTime: string;
  numPlayers: string;
  isFree: boolean;
  pricePerPlayer: string;
}

export default function HomeScreen({ route }) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [cancelledGames, setCancelledGames] = useState<number[]>([]);
  const [startTimeDate, setStartTimeDate] = useState(new Date());
  const [endTimeDate, setEndTimeDate] = useState(new Date());

  const [isLogged, setIsLogged] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    address: '',
    date: null,
    startTime: '',
    endTime: '',
    numPlayers: '',
    isFree: true,
    pricePerPlayer: '',
  });

  const fetchMyGames = async () => {
    try {
      const response = await authenticatedApi.get(`profile/games/joined`);
      // Check if response is ok
      if (response.status != 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Set the games with API data
      if (response.result.data && Array.isArray(response.result.data.games)) {
        setGames(response.result.data.games); 
      }

      console.log('Fetched games:', games); 
    } catch (error) {
      console.error('Error fetching games:', error);
    } 
  };
  useEffect(() => {
    const checkToken = async () => {
      const expired = await isStoredTokenExpired();
      setIsLogged(!expired);

      if (!expired) {
        fetchMyGames(); // call directly here, don't rely on isLogged state
      }
    };
    
    checkToken();
  }, []);
  
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }; 

  const isPastDay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate <= today;
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const openModal = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      address: '',
      date,
      startTime: '',
      endTime: '',
      numPlayers: '',
      isFree: true,
      pricePerPlayer: '',
    });
    setStartTimeDate(new Date());
    setEndTimeDate(new Date());
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDate(null);
  };

  const handleCreateGame = (game: Game) => {

    if (!formData.isFree && !formData.pricePerPlayer) {
      alert('Please enter price per player');
      return;
    }
    console.log('Creating game with form data:', game);
    const newGame: Game = {
      id: game.id,
      title: game.title,
      description: game.description,
      sportType: game.sportType,
      city: game.city,
      address: game.address,
      startTime: game.startTime,
      endTime: game.endTime,
      nbrSpots: 1,
      currentParticipants: 1,
      creatorId: 0,
      creatorName: '',
      isPrivate: (game.isPrivate == true) ? "false" : "true",
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('Creating game with data:', newGame);
    setGames([...games, newGame]);
    closeModal();
  };

  const handleCancelGame = (gameId: number) => {
    setCancelledGames([...cancelledGames, gameId]);
  };

  const getGamesForDate = (date: Date) => {
    return games.filter((game) => {
      const gameDate = new Date(game.startTime);
      return gameDate.toDateString() === date.toDateString();
    }); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={t('menu.schedule')} />
      <ScheduleHeader
        weekStart={weekStart}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {weekDays.map((date, index) => {
          const dayGames = getGamesForDate(date);
          return (
            <DayCard
              key={index}
              date={date}
              games={dayGames}
              cancelledGames={cancelledGames}
              isPastDay={isPastDay(date)}
              onPress={() => openModal(date)}
              onCancelGame={handleCancelGame}
            />
          );
        })}
      </ScrollView>

      <GameModal
        visible={modalVisible}
        selectedDate={selectedDate}
        formData={formData}
        startTimeDate={startTimeDate}
        endTimeDate={endTimeDate}
        onFormDataChange={setFormData}
        onStartTimeDateChange={setStartTimeDate}
        onEndTimeDateChange={setEndTimeDate}
        onCreateGame={handleCreateGame}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}