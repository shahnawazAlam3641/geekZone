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
import { X, AlertCircle } from "lucide-react";

const Feed = () => {
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const dispatch = useAppDispatch();
  const { posts, loading, hasMore } = useAppSelector((state) => state.posts);
  const { user } = useAppSelector((state) => state.auth);
  const content = watch("content");

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

  const handleEnhanceText = async () => {
    // Reset any previous error state
    setEnhanceError(null);

    // Check if text is too short to enhance
    if (
      !content ||
      content.trim().length < 10 ||
      content.split(" ").length < 5
    ) {
      setEnhanceError("Text too short to enhance. Please add more content.");
      return;
    }

    try {
      setIsEnhancing(true);
      const response = await axios.post(
        `${BASE_URL}/ai/enhanceText`,
        { prompt: content },
        {
          withCredentials: true,
        }
      );

      // Update the text area with the enhanced content
      if (response.data && response.data.enhancedText) {
        setValue("content", response.data.enhancedText);
      }
    } catch (error) {
      console.error("Error enhancing text:", error);
      setEnhanceError("Failed to enhance text. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      if (!hasMore || loading || !isMounted) return;
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
        console.error(error);
      } finally {
        if (isMounted) dispatch(setLoading(false));
      }
    };

    if (posts.length < 1) {
      fetchPosts();
    }

    return () => {
      isMounted = false;
    };
  }, [page]);

  const handleCreatePost = async (data: FieldValues) => {
    if (!data.content.trim()) return;

    const formData = new FormData();
    formData.append("content", data.content);
    if (selectedImage) {
      formData.append("postPicture", selectedImage);
    }

    try {
      const response = await axios.post(`${BASE_URL}/posts/create`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(addNewPost(response.data.post));
      reset();
      setSelectedImage(null);
      setPreviewURL(null);
      setShowModal(false);
    } catch (error) {
      dispatch(setError("Error creating post"));
      console.error(error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-5 max-h-screen overflow-y-scroll">
      {/* Open Post Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background-lighter rounded-xl p-4 mb-8 border border-gray-800"
        onClick={() => setShowModal(true)}
      >
        <textarea
          placeholder="What's on your mind?"
          className="w-full bg-background rounded-lg p-4 border border-gray-700 focus:outline-none transition-colors resize-none cursor-pointer"
          rows={3}
          value=""
          onClick={() => setShowModal(true)}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            onClick={() => setShowModal(true)}
            className="btn-primary cursor-pointer"
          >
            Post
          </button>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000a1] bg-opacity-60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-background max-w-lg w-full mx-4 rounded-xl p-6 relative border border-gray-900"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* User Info */}
              <div className="flex items-center mb-4">
                <img
                  src={user?.profilePicture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <h3 className="font-semibold">{user?.username}</h3>
                  <p className="text-sm text-gray-400">Post to Everyone</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(handleCreatePost)}>
                <textarea
                  {...register("content")}
                  placeholder="Write something..."
                  maxLength={500}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-background-lighter border border-gray-700 focus:outline-none resize-none"
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {content?.length || 0}/500
                </div>

                {/* Enhancement Error Message */}
                {enhanceError && (
                  <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{enhanceError}</span>
                  </div>
                )}

                {/* Image Upload */}
                <div className="mt-4">
                  {previewURL ? (
                    <div className="relative w-full">
                      <img
                        src={previewURL}
                        alt="Preview"
                        className="rounded-lg max-h-60 object-cover w-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewURL(null);
                        }}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="block mt-2 border border-dashed border-gray-500 rounded-lg p-4 text-center cursor-pointer hover:bg-background-lighter transition">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <span className="text-sm text-gray-400">
                        Click to upload an image
                      </span>
                    </label>
                  )}
                </div>

                {/* AI Button + Submit */}
                <div className="mt-4 flex justify-between items-center">
                  <button
                    type="button"
                    className="text-sm px-4 py-2 cursor-pointer border border-primary rounded-md hover:bg-primary hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    onClick={handleEnhanceText}
                    disabled={isEnhancing || !content?.trim()}
                  >
                    {isEnhancing ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></span>
                        Enhancing...
                      </>
                    ) : (
                      "Enhance with AI"
                    )}
                  </button>
                  <button
                    type="submit"
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!content?.trim()}
                  >
                    Post
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
