import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  email: '',
  password: '',
  isSignedIn: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signIn: (state, action) => {
      state.email = action.payload.email;
      state.password = action.payload.password;
      state.isSignedIn = true;
    },
    signOut: (state) => {
      state.email = '';
      state.password = '';
      state.isSignedIn = false;
    }
  }
});

// export const { signIn, signOut } = userSlice.actions;
export default userSlice.reducer;
export const {signIn,signOut}=userSlice.actions;
