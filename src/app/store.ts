import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './slices';

const store = configureStore({
  devTools: __DEV__,
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({}).concat(),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
