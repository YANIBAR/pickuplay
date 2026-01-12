import api from '@services/api';
import { loginFormData, registerFormData } from '@types';

export default {
  login: async (data: loginFormData) => await api.post('users', data),
  register: async (data: registerFormData) =>
    await api.post('/user/register', data),
  verify: async (otp: string) => await api.post('/otp/verification', otp),
  resetPassword: async (otp: string) =>
    await api.post('/auth/reset-password/', otp),
};
