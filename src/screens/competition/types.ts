export interface CompetitionTeam {
  id: string;
  name: string;
  logoUrl: string;
  playersCount: number;
  maxPlayers: number;
  // Present on teams returned from the competition endpoint (not on the
  // COMPETITION_TEAMS mock list). Optional so both shapes satisfy this type.
  members?: CompetitionMember[];
}

export interface CompetitionPlayer {
  id: string;
  name: string;
  avatarUrl: string;
  position: string;
  firstName?: string;
  lastName?: string;
}

export interface CompetitionMember {
  entryId: number;
  status: string;
  isTeam: number;
  guestCount: number;
  joinedAt: string;
  player: CompetitionPlayer;
}

export interface Competition {
  id: number;
  organizerId: number;
  name: string;
  sportType: string;
  city: string;
  address: string;
  dateTime: string;
  description: string | null;
  startRegistration: string;
  endRegistration: string;
  nbrOfTeams: number;
  teamSize: number;
  nbrOfSubs: number;
  format: string;
  pricePlayer: string;
  gender: string;
  minimumAge: number;
  comment: string | null;
  logo: string | null;
  coverPhoto: string | null;
  referee: number;
  prize: number;
  pennies: number;
  JoinedPlayersCount: number;
  teams: CompetitionTeam[];
}