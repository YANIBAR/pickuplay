import * as yup from 'yup';
import i18n from 'i18next';

export default yup.object().shape({
  email: yup
    .string()
    .required(i18n.t('errors.emailAddressRequired'))
    .email(i18n.t('errors.invalidEmail')),
});
