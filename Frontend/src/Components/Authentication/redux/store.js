import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import upcomingRidesReducer from "./upcomingRidesSlice";
import pendingRequestsReducer from "./pendingRequestSlice";
const store = configureStore({
  reducer: {
    user: userReducer,
    upcomingRides: upcomingRidesReducer,
     pendingRequests: pendingRequestsReducer,
  },
});

export default store;