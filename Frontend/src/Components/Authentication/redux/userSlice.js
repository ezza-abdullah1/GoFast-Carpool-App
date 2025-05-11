import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { io } from "socket.io-client";

// Thunk: sign in and open socket connection
export const signIn = createAsyncThunk(
  "user/signIn",
  async (credentials, thunkAPI) => {
    try {
      const { data } = await axios.post("/api/auth/signin", credentials);
      const user = data.user;
      const token = data.token;
      sessionStorage.setItem("token", token);

      // Create Socket.IO client and store it
      const socket = io("http://localhost:5000", {
        auth: { token }
      });

      // When server broadcasts the current online users:
      socket.on("onlineUsers", (users) => {
        thunkAPI.dispatch(setOnlineUsers(users));
      });

      return { user, socket };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Sign in failed"
      );
    }
  }
);

const initialState = {
  authUser: null,       // signed-in user details
  socket: null,         // socket instance
  onlineUsers: [],      // array of user IDs
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      // clean up socket
      if (state.socket) {
        state.socket.disconnect();
      }
      state.authUser = null;
      state.socket = null;
      state.onlineUsers = [];
      state.error = null;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
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
        state.authUser = action.payload.user;
        state.socket = action.payload.socket;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setOnlineUsers } = userSlice.actions;
export default userSlice.reducer;
