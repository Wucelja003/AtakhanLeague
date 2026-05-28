import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import userReducer from './user/userSlice';

// Direct localStorage adapter — avoids redux-persist's default storage import
// issue with Vite (storage.getItem is not a function).
const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
};

const rootReducer = combineReducers({
  user: userReducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['user'], // only persist user slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist uses non-serializable actions
    }),
});

export const persistor = persistStore(store);
