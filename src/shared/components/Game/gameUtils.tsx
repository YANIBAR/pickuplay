const GAME_ICONS: Record<string, string> = {
  '1': 'soccer',
  '2': 'basketball',
  '3': 'volleyball',
  '4': 'hockey-sticks',
  '5': 'tennis',
  '6': 'cricket',
  '7': 'table-tennis',
  '8': 'football',
  '9': 'baseball',
};

export const getGameIcon = (sportTypeId?: number | string): string =>
  GAME_ICONS[String(sportTypeId)] || 'sports';