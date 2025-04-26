import { createSlice } from "@reduxjs/toolkit";

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  isVerified: boolean;
  bio: string;
  friends: string[];
  sentFriendRequests: string[];
  recievedFriendRequests: string[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
    },
    addCurrentUserFriendRequest: (state, action) => {
      state?.user?.sentFriendRequests.push(action.payload);
    },
    removeCurrentUserFriend: (state, action) => {
      const indexOfFriend = state.user?.friends.findIndex((friend) => {
        return friend == action.payload;
      });
      if (indexOfFriend) {
        state.user?.friends.splice(indexOfFriend, 1);
      }
    },

    addCurrentUserFriend: (state, action) => {
      state.user?.friends.push(action.payload);
    },
  },
});

export const {
  setUser,
  setLoading,
  setError,
  clearError,
  logout,
  addCurrentUserFriendRequest,
  removeCurrentUserFriend,
  addCurrentUserFriend,
} = authSlice.actions;
export default authSlice.reducer;
