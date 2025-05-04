import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


// Async thunk to handle sign-in
export const signIn = createAsyncThunk("user/signIn", async (data, thunkAPI) => {
  try {
    const response = await axios.post("/api/auth/signin", data); 
    return response.data.user;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.error || "Sign in failed");
  }
});
const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.currentUser = null;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = userSlice.actions;
export default userSlice.reducer;
