import React, { useEffect, useState } from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import styles from './styles';
import Header from './components/Header';
import DayCard from './components/DayCard';
import GameModal from './components/GameModal';
import { JAVA_API } from '@env';
import { authenticatedApi } from '@services/api';
import { Text } from '@components';
import { formatDateShort } from '@utils/dateUtils';

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
  maxPlayers: number;
  currentParticipants: number;
  creatorId: number;
  creatorName: string;
  visibility: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [cancelledGames, setCancelledGames] = useState<number[]>([]);
  const [startTimeDate, setStartTimeDate] = useState(new Date());
  const [endTimeDate, setEndTimeDate] = useState(new Date());

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
      const response = await authenticatedApi.get(`${JAVA_API}profile/games/joined?date=` + formatDateShort(weekStart));
      // Check if response is ok
      if (response.status != 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Set the games with API data
      if (response.result.data && Array.isArray(response.result.data)) {
        setGames(response.result.data); 
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    } 
  };
  useEffect(() => {
    console.log("la data ", weekStart);
     fetchMyGames();
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
    return checkDate < today;
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

  const handleCreateGame = () => {

    if (!formData.isFree && !formData.pricePerPlayer) {
      alert('Please enter price per player');
      return;
    }

    const newGame: Game = {
      id: Date.now(),
      title: formData.address,
      description: `${formData.numPlayers} players`,
      sportType: '',
      city: '',
      address: formData.address,
      startTime: formData.startTime,
      endTime: formData.endTime,
      maxPlayers: parseInt(formData.numPlayers) || 0,
      currentParticipants: 0,
      creatorId: 0,
      creatorName: '',
      visibility: 'PUBLIC',
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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
      <Header
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