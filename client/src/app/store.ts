// src/app/store.ts

import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import dashboardReducer from '../features/dashboard/dashboardSlice';
import sessionReducer from '../features/sessions/sessionSlice';
import userReducer from '../features/userSlice';
import templateReducer from '../features/templateSlice';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';


// ✅ 1. Combine all your slices into one root reducer
const rootReducer = combineReducers({
  dashboard: dashboardReducer,
  session: sessionReducer,
  user: userReducer,
  templates: templateReducer,
});

// ✅ 2. Create persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['session'], // Persist only the session slice
};

// ✅ 3. Wrap with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ 4. Create the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['session.mediaRecorder'],
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// ✅ 5. Create persistor
export const persistor = persistStore(store);

// ✅ 6. Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
