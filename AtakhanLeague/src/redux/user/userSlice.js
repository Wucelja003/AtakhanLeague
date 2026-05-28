import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // --- Sign in ---
    signInStart(state) {
      state.loading = true;
      state.error = null;
    },
    signInSuccess(state, action) {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    signInFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // --- Update user ---
    updateUserStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess(state, action) {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateUserFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // --- Delete user ---
    deleteUserStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess(state) {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    deleteUserFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // --- Sign out ---
    signOutUserStart(state) {
      state.loading = true;
      state.error = null;
    },
    signOutUserSuccess(state) {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    signOutUserFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // Quick-reset (legacy from Header)
    signOut(state) {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserStart,
  signOutUserSuccess,
  signOutUserFailure,
  signOut,
} = userSlice.actions;

export default userSlice.reducer;
