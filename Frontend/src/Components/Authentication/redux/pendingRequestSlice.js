import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from './axiosInstance';

export const fetchPendingRequests = createAsyncThunk(
  'pendingRequests/fetch',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/carpools/pendingRequests/${userId}`);

      const ridesWithUsers = await Promise.all(
        data.map(async (ride) => {
          const userRes = await axiosInstance.get(`/user/${ride.userId}`);
          return { ...ride, userDetails: userRes.data };
        })
      );

      return ridesWithUsers.map(transformRideToUIFormat);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching pending requests');
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

const pendingRequestsSlice = createSlice({
  name: 'pendingRequests',
  initialState: {
    rides: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateStopStatus: (state, action) => {
      const { stopId, newStatus } = action.payload;
      const ride = state.rides.find((r) => r.id === rideId);

      if (ride) {
        const stop = ride.stops.find((s) => s.id === stopId);
        if (stop) {
          stop.status = newStatus;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.rides = action.payload;
        state.loading = false;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateStopStatus } = pendingRequestsSlice.actions;
export default pendingRequestsSlice.reducer;
