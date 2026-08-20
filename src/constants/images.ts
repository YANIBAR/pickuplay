import { ImageSourcePropType } from 'react-native';

const logo = require('@assets/images/logo.png') as ImageSourcePropType;
const homeLogo = require('@assets/images/home-logo.png') as ImageSourcePropType;
const scanCard = require('@assets/images/scan_card.png');
const icon = require('@assets/images/icon.png');
const matchups = require('@assets/images/matchups.png');
const competitionCover = require('@assets/images/competition-cover.png');

const images = {
  logo,
  homeLogo,
  scanCard,
  icon,
  matchups,
  competitionCover
};

export default images;
