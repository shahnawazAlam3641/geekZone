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
  },
});

export const {
  setProfile,
  setLoading,
  setError,
  setIsOwnProfile,
  updateProfile,
} = userProfileSlice.actions;

export default userProfileSlice.reducer;
