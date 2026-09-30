/**
 * Redux Toolkit Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import { staffReducer } from '../api/staff/staffSlice';
import { clientReducer } from '../api/client/clientSlice';
import { toastReducer } from './toastSlice';

export const store = configureStore({
  reducer: {
    staff: staffReducer,
    client: clientReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
