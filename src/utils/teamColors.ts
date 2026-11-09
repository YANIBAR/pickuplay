import { COLORS } from "@constants";

const TEAM_COLORS: Record<string, string> = {
  black: COLORS.black,
  blue: COLORS.blue,
  gray: COLORS.gray,
  green: COLORS.green,
  orange: COLORS.orange,
  pink: COLORS.pink,
  purple: COLORS.purple,
  red: COLORS.red,
  skin: COLORS.skin,
  white: COLORS.white,
  yellow: COLORS.yellow,
};
 
export const getTeamColor = (name?: string) =>
  TEAM_COLORS[name?.toLowerCase() ?? ''] ?? '#BDBDBD';