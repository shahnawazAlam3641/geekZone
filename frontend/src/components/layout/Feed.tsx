import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  setLoading,
  setError,
  appendPosts,
  setHasMore,
  addNewPost,
} from "../../store/slices/postSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import Post, { PostSchema } from "../common/Post";
import { FieldValues, useForm } from "react-hook-form";

const Feed = () => {
  const { register, handleSubmit } = useForm();
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver>(null);
  const dispatch = useAppDispatch();
  const { posts, loading, hasMore } = useAppSelector((state) => state.posts);

  const lastPostRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading]
  );

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    if (!hasMore || loading) return;

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await axios.get(`${BASE_URL}/posts?page=${page}`, {
        withCredentials: true,
      });
      dispatch(appendPosts(response.data.posts));
      dispatch(setHasMore(response.data.hasMore));
    } catch (error) {
      dispatch(setError("Error fetching posts"));
      console.error("Error fetching posts:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCreatePost = async (data: FieldValues) => {
    if (!data.content.trim()) return;

    try {
      const response = await axios.post(
        BASE_URL + "/posts/create",
        { content: data.content },
        { withCredentials: true }
      );
      dispatch(addNewPost(response.data.post));
    } catch (error) {
      dispatch(setError("Error creating post"));
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-lighter rounded-xl p-4 mb-8 border border-gray-800"
        onSubmit={handleSubmit((data: FieldValues) => {
          handleCreatePost(data);
        })}
      >
        <textarea
          {...register("content")}
          placeholder="Share your thoughts..."
          className="w-full bg-background rounded-lg p-4 border border-gray-700 focus:border-primary focus:outline-none transition-colors resize-none"
          rows={3}
        />
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </div>
      </motion.form>

      {/* Posts */}
      {posts ? (
        <AnimatePresence mode="popLayout">
          <div className="space-y-6">
            {posts.map((post: PostSchema, index: number) => (
              <div
                key={post._id}
                ref={index === posts.length - 1 ? lastPostRef : undefined}
              >
                <Post key={post._id} post={post} />
              </div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <h1>No posts found</h1>
      )}

      {/* Loading  */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default Feed;
