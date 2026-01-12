import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from 'src/app/store';
import api from '@services/api';
import { User } from '@types';
import { API_BACKEND_URL } from '@env';

// Define proper payload types
interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPwd: string;
  image?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

interface UserUpdatePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const userRegister = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`${API_BACKEND_URL}/user/register`, payload);
      return data;
    } catch (error: any) {
      console.log(error);
      if (!error.response) {
        return rejectWithValue('Network error');
      }
      return rejectWithValue(error.response.data || 'An error occurred');
    }
  }
);

export const userUpdate = createAsyncThunk(
  'user/update', // Fixed action type
  async (payload: UserUpdatePayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/edit', payload);
      return data;
    } catch (error: any) {
      console.log(error);
      if (!error.response) {
        return rejectWithValue('Network error');
      }
      return rejectWithValue(error.response.data || 'An error occurred');
    }
  }
);

export const userLogin = createAsyncThunk(
  'auth/login',
  async (formData: LoginPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/user/login', formData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  },
);

export const userForgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (formData: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/forgot-password/', formData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  },
);

export const userResetPassword = createAsyncThunk(
  'auth/resetPassword', // ✅ Fixed: was duplicate 'auth/register'
  async (formData: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/reset-password/', formData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state: AuthState) => {
      state.user = null;
      state.token = null; // Also clear token
      state.error = null; // Clear any errors
    },
    setCredentials: (state: AuthState, action: PayloadAction<any>) => {
      state.user = action.payload.user;
      state.token = action.payload.token; // Also set token if provided
    },
    clearError: (state: AuthState) => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Register cases
      .addCase(userRegister.pending, (state: AuthState) => {
        state.isLoading = true;
        state.error = null; // ✅ Clear previous errors
      })
      .addCase(userRegister.fulfilled, (state: AuthState, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(userRegister.rejected, (state: AuthState, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Login cases
      .addCase(userLogin.pending, (state: AuthState) => {
        state.isLoading = true;
        state.error = null; // ✅ Fixed: don't set user to undefined
      })
      .addCase(userLogin.fulfilled, (state: AuthState, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(userLogin.rejected, (state: AuthState, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update cases
      .addCase(userUpdate.pending, (state: AuthState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(userUpdate.fulfilled, (state: AuthState, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.user = action.payload.user || action.payload;
        state.error = null;
      })
      .addCase(userUpdate.rejected, (state: AuthState, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Forgot password cases
      .addCase(userForgotPassword.pending, (state: AuthState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(userForgotPassword.fulfilled, (state: AuthState) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(userForgotPassword.rejected, (state: AuthState, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Reset password cases
      .addCase(userResetPassword.pending, (state: AuthState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(userResetPassword.fulfilled, (state: AuthState, action: PayloadAction<any>) => {
        state.isLoading = false; 
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(userResetPassword.rejected, (state: AuthState, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const authSelector = (state: RootState) => state.auth;

const { reducer, actions } = authSlice;

export const { logout, setCredentials, clearError } = actions;

export default reducer;