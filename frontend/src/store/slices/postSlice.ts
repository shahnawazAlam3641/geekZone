import { createSlice } from "@reduxjs/toolkit";

export interface Post {
  _id: string;
  author: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  content: string;
  image: string;
  likes: string[];
  comments: {
    _id: string;
    user: {
      _id: string;
      username: string;
      profilePicture: string;
    };
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
}

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
  hasMore: true,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addNewPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex((post) => {
        return post._id === action.payload?._id;
      });
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    appendPosts: (state, action) => {
      state.posts = [...state.posts, ...action.payload];
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    resetPosts: (state) => {
      state.posts = [];
      state.hasMore = true;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  addNewPost,
  updatePost,
  appendPosts,
  setHasMore,
  resetPosts,
} = postSlice.actions;

export default postSlice.reducer;
