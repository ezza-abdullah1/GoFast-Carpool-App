import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from './axiosInstance';

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
  async (rideId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/carpools/${rideId}`);
      return rideId; // Return the ID of the removed ride
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
      available: Math.max(0, (ride.numberOfSeats ?? 0) - (ride.stops?.length ?? 0)),
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
      console.log("remove stop id", stopId);
      console.log('Ride ID:', rideId);
      if (ride) {
        ride.stops = ride.stops.filter((stop) => stop.id !== stopId);
        console.log('Updated stops:', ride.stops);
      }
    },
    // You can add a reducer here to directly remove the ride from the state
    removeUpcomingRideLocal: (state, action) => {
      state.rides = state.rides.filter(ride => ride.id !== action.payload);
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
        // When the async action is successful, update the state
        state.rides = state.rides.filter(ride => ride.id !== action.payload);
      })
      .addCase(removeUpcomingRide.rejected, (state, action) => {
        state.error = action.payload; // Optionally handle the error
      });
  },
});

export const { removeStopFromRide, removeUpcomingRideLocal } = upcomingRidesSlice.actions;

export default upcomingRidesSlice.reducer;