import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "./postSlice";

interface UserProfile {
  friends: string[];
  sentFriendRequests: string[];
  recievedFriendRequests: string[];
  _id: string;
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  posts: Post[];
  savedPosts: Post[];
  likedPosts: Post[];
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
      state.isOwnProfile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    addUserProfilePostLike: (state, action) => {
      const { postIndex, userId } = action.payload;
      if (state.profile && state.profile.posts) {
        if (postIndex !== -1) {
          state.profile?.posts[postIndex]?.likes.push(userId);
        }
      }
    },
    removeUserProfilePostLike: (state, action) => {
      const { postIndex, userId } = action.payload;
      if (state.profile && state.profile.posts) {
        if (postIndex !== -1) {
          const likeIndex = state.profile.posts[postIndex].likes.findIndex(
            (like) => {
              return like === userId;
            }
          );

          state.profile.posts[postIndex].likes.splice(likeIndex, 1);
        }
      }
    },
    updateUserProfilePost: (state, action) => {
      if (state.profile && state.profile.posts) {
        const index = state.profile.posts.findIndex((post) => {
          return post._id === action.payload?._id;
        });
        if (index !== -1) {
          state.profile.posts[index] = action.payload;
        }
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
  addUserProfilePostLike,
  removeUserProfilePostLike,
  updateUserProfilePost,
} = userProfileSlice.actions;

export default userProfileSlice.reducer;
