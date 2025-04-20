import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

interface UserProfile {
  friends: any;
  sentFriendRequests: any;
  recievedFriendRequests: any;
  pendingFriendRequests: any;
  _id: string;
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  coverPicture: string;
  followers: string[];
  following: string[];
  posts: any[];
  savedPosts: any[];
  likedPosts: any[];
  connectionRequests: string[];
}

interface UserProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isOwnProfile: boolean;
}

const initialState: UserProfileState = {
  profile: null,
  loading: false,
  error: null,
  isOwnProfile: false,
};

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setIsOwnProfile: (state, action: PayloadAction<boolean>) => {
      console.log("runnnnnnnnnnnnnnnnnnn");
      state.isOwnProfile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
});

export const {
  setProfile,
  setLoading,
  setError,
  setIsOwnProfile,
  updateProfile,
} = userProfileSlice.actions;

// Thunk actions
// export const fetchUserProfile = (userId: string) => async (dispatch: any) => {
//   try {
//     dispatch(setLoading(true));
//     const response = await axios.get(`/api/v1/users/${userId}`, {
//       withCredentials: true,
//     });
//     console.log(response.data);
//     dispatch(setProfile(response.data));
//   } catch (error: any) {
//     dispatch(
//       setError(error.response?.data?.message || "Failed to fetch profile")
//     );
//   }
// };

export const sendConnectionRequest =
  (userId: string) => async (dispatch: any) => {
    try {
      await axios.post(
        `${BASE_URL}/users//friends/request/${userId}`,
        {},
        { withCredentials: true }
      );
    } catch (error: any) {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to send connection request"
        )
      );
    }
  };

export const acceptConnectionRequest =
  (userId: string) => async (dispatch: any) => {
    try {
      await axios.post(
        `${BASE_URL}/users/friends/accept/${userId}`,
        {},
        { withCredentials: true }
      );
    } catch (error: any) {
      console.log(error);
      dispatch(
        setError(
          error.response?.data?.message || "Failed to accept connection request"
        )
      );
    }
  };

export const rejectConnectionRequest =
  (userId: string) => async (dispatch: any) => {
    try {
      await axios.post(
        `${BASE_URL}/users/friends/reject/${userId}`,
        {},
        { withCredentials: true }
      );
    } catch (error: any) {
      console.log(error);
      dispatch(
        setError(
          error.response?.data?.message || "Failed to accept connection request"
        )
      );
    }
  };

export const unfriendUser = (userId: string) => async (dispatch: any) => {
  try {
    await axios.post(
      `${BASE_URL}/users/friends/unfriend/${userId}`,
      {},
      { withCredentials: true }
    );
  } catch (error: any) {
    console.log(error);
    dispatch(
      setError(
        error.response?.data?.message || "Failed to accept connection request"
      )
    );
  }
};

export default userProfileSlice.reducer;
