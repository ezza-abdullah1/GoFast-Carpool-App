// actions/userActions.js

import axiosInstance from './axiosInstance';

export const fetchUserDetails = (email) => async (dispatch) => {
  try {
    const response = await axiosInstance.get(`/api/user/details?email=${email}`);  // Fetch user data by email
    dispatch({
      type: 'SET_USER_DETAILS',
      payload: response.data,  // This is the user data returned from the API
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    dispatch({
      type: 'FETCH_USER_DETAILS_ERROR',
      payload: 'Failed to fetch user details',
    });
  }
};
