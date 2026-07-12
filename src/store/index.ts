import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from 'redux-persist';
import hydrationReducer from './slices/hydrationSlice';
import settingsReducer from './slices/settingsSlice';

import { NativeModules, Platform } from 'react-native';

// Memory fallback store if AsyncStorage is unavailable (e.g. running in an unbuilt custom client)
const memoryStore: Record<string, string> = {};

// Safe detection of native module to avoid triggering package throw
const isAsyncStorageSupported = !!(
  Platform.OS === 'web' ||
  NativeModules?.RNCAsyncStorage ||
  NativeModules?.RNC_AsyncStorage ||
  NativeModules?.PlatformLocalStorage
);

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (!isAsyncStorageSupported) {
      return memoryStore[key] || null;
    }
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch (error) {
      return memoryStore[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (!isAsyncStorageSupported) {
      memoryStore[key] = value;
      return;
    }
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      memoryStore[key] = value;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (!isAsyncStorageSupported) {
      delete memoryStore[key];
      return;
    }
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      delete memoryStore[key];
    }
  },
};

const rootReducer = combineReducers({
    hydration: hydrationReducer,
    settings: settingsReducer,
});

// Configure Redux Persist
const persistConfig = {
    key: 'root',
    storage: safeStorage,
    whitelist: ['hydration', 'settings'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
