import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from './axiosInstance';

export const fetchCarpoolHistory = createAsyncThunk(
  'carpoolHistory/fetch',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/carpools/history/${userId}`);

      const ridesWithUsers = await Promise.all(
        data.map(async (ride) => {
          const userRes = await axiosInstance.get(`/user/${ride.userId}`);
          return { ...ride, userDetails: userRes.data };
        })
      );

      return ridesWithUsers.map(transformRideToUIFormat);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching carpool history');
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

const carpoolHistorySlice = createSlice({
  name: 'carpoolHistory',
  initialState: {
    rides: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarpoolHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarpoolHistory.fulfilled, (state, action) => {
        state.rides = action.payload;
        state.loading = false;
      })
      .addCase(fetchCarpoolHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default carpoolHistorySlice.reducer;
