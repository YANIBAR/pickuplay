import * as yup from 'yup';
import i18n from 'i18next';

export default yup.object().shape({
  firstName: yup.string().required(i18n.t('errors.firstNameRequired')),
  lastName: yup.string().required(i18n.t('errors.lastNameRequired')),
  email: yup
    .string()
    .required(i18n.t('errors.emailAddressRequired'))
    .email(i18n.t('errors.invalidEmail')),
  phone: yup
    .string()
    .required(i18n.t('errors.phoneNumberRequired'))
    .matches(/^\d+$/, i18n.t('errors.phoneNumberDigits'))
    .min(6, i18n.t('errors.phoneNumberTooShort'))
    .max(15, i18n.t('errors.phoneNumberTooLong')),
  password: yup
    .string()
    .required(i18n.t('errors.passwordRequired'))
    .min(8, i18n.t('errors.passwordMinLength'))
    .matches(
      /^(?=.*[A-Za-z])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
      i18n.t('errors.passwordSpecialCharacter'),
    ),
  confirmPwd: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password')], i18n.t('errors.passwordMatch')),
});
