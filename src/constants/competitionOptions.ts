import type { Format, Gender } from '@types/competition';

export const SPORT_TYPES: { id: string; label: string; icon: string }[] = [
  { id: 'Soccer', label: 'Soccer',        icon: 'soccer' },
  { id: 'Basketball', label: 'Basketball',    icon: 'basketball' },
  { id: 'Volleyball', label: 'Volleyball',    icon: 'volleyball' },
  { id: 'Football', label: 'Football', icon: 'football' },
  { id: 'Tennis & pickle ball', label: 'pickle ball', icon: 'tennis' },
  { id: 'Cricket', label: 'Cricket', icon: 'cricket' },
  { id: 'Baseball', label: 'Baseball', icon: 'baseball' },
  { id: 'Hockey', label: 'Hockey', icon: 'hockey-sticks' },
];

export const GENDERS: { value: Gender; label: string; icon: string }[] = [
  { value: 'CoEd',   label: 'Co-Ed',  icon: 'account-multiple' },
  { value: 'Men',   label: 'Men',   icon: 'gender-male' },
  { value: 'Women', label: 'Women', icon: 'gender-female' },
];

export const FORMATS: { value: Format; label: string; icon: string; sub: string }[] = [
  { value: 'RoundRobin',       label: 'Round Robin',        icon: 'rotate-right', sub: 'Every team plays each other once' },
  { value: 'DoubleRoundRobin', label: 'Double Round Robin', icon: 'sync',         sub: 'Every team plays each other twice' },
  { value: 'Knockout',         label: 'Knockout',           icon: 'tournament',   sub: 'Single-elimination bracket' },
  { value: 'GroupStage',       label: 'Group Stage',        icon: 'view-grid',    sub: 'Groups then knockout rounds' },
  { value: 'Custom',           label: 'Custom',             icon: 'pencil-ruler', sub: 'Define your own structure' },
];

export const TOGGLES: { key: 'pennies' | 'prize' | 'referee'; label: string; sub: string; icon: string }[] = [
  { key: 'pennies', label: 'Pennies', sub: 'Provide pennies/bibs for teams',  icon: 'tshirt-crew' },
  { key: 'prize',   label: 'Prize',   sub: 'This competition awards a prize', icon: 'trophy-award' },
  { key: 'referee', label: 'Referee', sub: 'Referees are assigned to matches', icon: 'whistle' },
];