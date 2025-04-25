import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
  posts: any[];
  savedPosts: any[];
  likedPosts: any[];
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
      console.log(action.payload);
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
    // addRecievedUserProfileFriendRequest: (state, action) => {
    //   state.profile?.recievedFriendRequests.push(action.payload);
    // },
    // removeUserProfileFriend: (state, action) => {
    //   const indexOfFriend = state.profile?.friends.findIndex(
    //     (friend: string) => {
    //       return friend == action.payload;
    //     }
    //   );
    //   state.profile?.friends.splice(indexOfFriend, 1);
    // },
    // addUserProfileFriend: (state, action) => {
    //   console.log("ran but not worked");
    //   state.profile?.friends.push(action.payload);
    // },

    // updateUserProfile: (state, action) => {
    //   state.profile = { ...action.payload };
    // },
  },
});

export const {
  setProfile,
  setLoading,
  setError,
  setIsOwnProfile,
  updateProfile,
  // updateUserProfile,
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

// export const sendConnectionRequest =
//   (userId: string) => async (dispatch: any) => {
//     try {
//       await axios.post(
//         `${BASE_URL}/users//friends/request/${userId}`,
//         {},
//         { withCredentials: true }
//       );
//       dispatch(updateRecievedFriendRequests(userId));
//       dispatch(updateSentFriendRequests(userId));
//     } catch (error: any) {
//       dispatch(
//         setError(
//           error.response?.data?.message || "Failed to send connection request"
//         )
//       );
//     }
//   };

// export const acceptConnectionRequest =
//   (userId: string) => async (dispatch: any) => {
//     try {
//       await axios.post(
//         `${BASE_URL}/users/friends/accept/${userId}`,
//         {},
//         { withCredentials: true }
//       );
//     } catch (error: any) {
//       console.log(error);
//       dispatch(
//         setError(
//           error.response?.data?.message || "Failed to accept connection request"
//         )
//       );
//     }
//   };

// export const rejectConnectionRequest =
//   (userId: string) => async (dispatch: any) => {
//     try {
//       await axios.post(
//         `${BASE_URL}/users/friends/reject/${userId}`,
//         {},
//         { withCredentials: true }
//       );
//     } catch (error: any) {
//       console.log(error);
//       dispatch(
//         setError(
//           error.response?.data?.message || "Failed to accept connection request"
//         )
//       );
//     }
//   };

// export const unfriendUser = (userId: string) => async (dispatch: any) => {
//   try {
//     await axios.post(
//       `${BASE_URL}/users/friends/unfriend/${userId}`,
//       {},
//       { withCredentials: true }
//     );
//   } catch (error: any) {
//     console.log(error);
//     dispatch(
//       setError(
//         error.response?.data?.message || "Failed to accept connection request"
//       )
//     );
//   }
// };

export default userProfileSlice.reducer;
