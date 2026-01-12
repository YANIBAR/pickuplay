import * as yup from 'yup';
import i18n from 'i18next';

export default yup.object().shape({
  identifier: yup.string().required(i18n.t('errors.usernameOrEmailRequired')),
  password: yup.string().required(i18n.t('errors.passwordRequired')),
});
