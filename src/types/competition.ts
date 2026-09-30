
export type Format = 'RoundRobin' | 'DoubleRoundRobin' | 'Knockout' | 'GroupStage' | 'Custom';
export type Gender = 'Male' | 'Female' | 'CoEd';

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

export interface CompetitionForm {
  name: string;
  city: string;
  address: string;
  sportTypeId: string;
  startDate: string;          // e.g. 2026-10-01T10:00:00
  startRegistration: string;  // e.g. 2026-08-20T00:00:00
  endRegistration: string;    // e.g. 2026-09-30T00:00:00
  nbrOfTeams: string;
  teamSize: string;
  nbrOfSubs: string;
  format: Format;
  pricePlayer: string;
  gender: Gender;
  minimumAge: string;
  teamNames: string[];
  comment: string;
  logo: PickedImage | null;
  coverPhoto: PickedImage | null;
  pennies: boolean;
  prize: boolean;
  referee: boolean;
}

export interface EditCompetitionScreenProps {
  navigation?: any;
  route?: {
    params?: {
      competitionId: string;
      initialCompetition?: import('@services/competitionApi').ApiCompetition;
      authToken?: string;
    };
  };
}