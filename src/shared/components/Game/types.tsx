export interface GameParticipant {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  status: string;
  joinedAt: string;
  number_guest?: number;
}

export interface Game {
  id: number;
  title: string;
  description: string;
  sportType: { id: number; name: string };
  city: string;
  address: string;
  startTime: string;
  endTime: string;
  nbrSpots: number;
  availableSpots: number;
  currentParticipants?: number;
  imageUrl: string;
  creatorId: number;
  creatorName: string;
  price: number;
  isPrivate: boolean;
  status: string;
  participants: GameParticipant[];
  createdAt: string;
  updatedAt: string;
  canceledAt: string;
}