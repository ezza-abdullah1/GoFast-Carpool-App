import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


/// userSlice.js
export const signIn = createAsyncThunk("user/signIn", async (data, thunkAPI) => {
  try {
    const response = await axios.post("/api/auth/signin", data);
    sessionStorage.setItem("token", response.data.token); 
    console.log("User data from backend:", response.data.user);  // Log the user data from the backend

    // Dispatch the user data to Redux store
    thunkAPI.dispatch(setUserDetails(response.data.user));  // Assuming setUserDetails action is available in your slice

    return response.data.user;  // Return the user data to the reducer
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.error || "Sign in failed");
  }
});

// userSlice.js
const initialState = {
  email: null, // Store the email from login
  userDetails: null, // Store the detailed user info
  loading: false,
  error: null,
};

// userSlice.js
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails: (state, action) => {
      console.log("Setting user details in Redux:", action.payload);  // Log user data here for debugging
      state.userDetails = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.email = null;
      state.userDetails = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase('SET_USER_DETAILS', (state, action) => {
        state.userDetails = action.payload;
        console.log("User details after setting in Redux:", state.userDetails);  // Log updated user details
      })
      .addCase('FETCH_USER_DETAILS_ERROR', (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { setUserDetails, setError, setLoading, logout } = userSlice.actions;
export default userSlice.reducer;
