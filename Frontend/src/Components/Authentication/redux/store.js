import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import upcomingRidesReducer from "./upcomingRidesSlice";
import pendingRequestsReducer from "./pendingRequestSlice";
import carpoolHistoryReducer from "./carpoolHistorySlice"; 

const store = configureStore({
  reducer: {
    user: userReducer,
    upcomingRides: upcomingRidesReducer,
    pendingRequests: pendingRequestsReducer,
    carpoolHistory: carpoolHistoryReducer,
  },
});

export default store;
