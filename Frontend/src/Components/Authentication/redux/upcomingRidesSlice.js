import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from './axiosInstance';
import { decrementRidesOffered } from './userSlice';
export const fetchUpcomingRides = createAsyncThunk(
  'upcomingRides/fetchUpcoming',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/carpools/upcomingRides/${userId}`);

      const ridesWithUsers = await Promise.all(
        data.map(async (ride) => {
          const userRes = await axiosInstance.get(`/user/${ride.userId}`);
          return { ...ride, userDetails: userRes.data };
        })
      );

      return ridesWithUsers.map(transformRideToUIFormat);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching upcoming rides');
    }
  }
);

export const removeUpcomingRide = createAsyncThunk(
  'upcomingRides/remove',
  async (rideId, { dispatch, rejectWithValue, getState }) => { 
    try {
      await axiosInstance.delete(`/carpools/${rideId}`);
      return rideId; 
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error cancelling carpool');
    }
  }
);

const transformRideToUIFormat = (ride) => {
  const isValidDate = (dateStr) => {
    const parsed = new Date(dateStr);
    return !isNaN(parsed.getTime());
  };
  return {
    id: ride._id,
    driver: {
      name: ride.userDetails?.fullName ?? 'Unknown',
      rating: ride.userDetails?.rating ?? 0,
      department: ride.userDetails?.department ?? 'N/A',
      driverId: ride.userDetails?._id, 
    },
    route: {
      pickup: {
        name: ride.pickup.name,
        latitude: ride.pickup.latitude,
        longitude: ride.pickup.longitude,
      },
      dropoff: {
        name: ride.dropoff.name,
        latitude: ride.dropoff.latitude,
        longitude: ride.dropoff.longitude,
      },
    },
    schedule: {
      date: isValidDate(ride.date)
        ? new Date(ride.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })
        : 'Invalid date',
      time: ride.time ?? 'N/A',
    },
    seats: {
      total: ride.numberOfSeats ?? 0,
      available: ride.numberOfSeats?ride.numberOfSeats:0 ,
    },
    preferences: Array.isArray(ride.preferences) ? ride.preferences : [],
    stops: Array.isArray(ride.stops)
      ? ride.stops.map((stop) => ({
          id: stop._id,
          userId: stop.userId,
          location: stop.location,
          status: stop.status,
        }))
      : [],
  };
};

const upcomingRidesSlice = createSlice({
  name: 'upcomingRides',
  initialState: {
    rides: [],
    loading: false,
    error: null,
  },
  reducers: {
    removeStopFromRide: (state, action) => {
      const { rideId, stopId } = action.payload;
      const ride = state.rides.find((r) => r.id === rideId);
  
      if (ride) {
        ride.stops = ride.stops.filter((stop) => stop.id !== stopId);
   
      }
    },
    removeUpcomingRideLocal: (state, action) => {
      state.rides = state.rides.filter(ride => ride.id !== action.payload);
    },
   addUpcomingRide: (state, action) => {
      const backendRide = action.payload;
      const formattedRideForSlice = {
        _id: backendRide.id,
        driver: backendRide.driver,
        pickup: backendRide.route?.pickup,
        dropoff: backendRide.route?.dropoff,
        date: backendRide.schedule?.date,
        time: backendRide.schedule?.time,
        numberOfSeats: backendRide.numberOfSeats,
        preferences: backendRide.preferences,
        stops: backendRide.stops || [],
      };
      state.rides.push(transformRideToUIFormat({ ...formattedRideForSlice, userDetails: {} }));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingRides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingRides.fulfilled, (state, action) => {
        state.rides = action.payload;
        state.loading = false;
      })
      .addCase(fetchUpcomingRides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeUpcomingRide.fulfilled, (state, action) => {
        state.rides = state.rides.filter(ride => ride.id !== action.payload);
      })
      .addCase(removeUpcomingRide.rejected, (state, action) => {
        state.error = action.payload; 
      });
  },
});

export const { removeStopFromRide, removeUpcomingRideLocal, addUpcomingRide } = upcomingRidesSlice.actions;

export default upcomingRidesSlice.reducer;