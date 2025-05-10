import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import upcomingRidesReducer from "./upcomingRidesSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    upcomingRides: upcomingRidesReducer,
  },
});

export default store;