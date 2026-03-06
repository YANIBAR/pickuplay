import moment from 'moment';
import i18next from 'i18next';
import { DATE_FORMAT_EN, DATE_FORMAT_FR } from '@constants';
import storage from './storage';

export const getLocale = () => i18next.language || storage.getItem('lng');

export const dateFormat = (date: any) => {
  return getLocale() === 'en'
    ? moment(date).format(DATE_FORMAT_EN)
    : moment(date).format(DATE_FORMAT_FR);
};

export const toTitleCase = (str: string) =>
  str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
export const imagePickerHelper = () => {};
