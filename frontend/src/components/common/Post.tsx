import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { AnimatePresence, motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { FieldValues, useForm } from "react-hook-form";
import { setLoading, updatePost } from "../../store/slices/postSlice";
import { Link } from "react-router";
import {
  addUserProfilePostLike,
  removeUserProfilePostLike,
  updateUserProfilePost,
} from "../../store/slices/userProfileSlice";

interface Comment {
  _id: string;
  user: Author;
  content: string;
  createdAt: string;
}
interface Author {
  _id: string;
  username: string;
  profilePicture: string;
}

export interface PostSchema {
  _id: string;
  content: string;
  createdAt: string;
  author: Author;
  likes: string[];
  comments: Comment[];
  image?: string;
}

const Post = ({
  post,
  isModal,
  setSelectedPost,
}: {
  post: PostSchema | null;
  isModal?: boolean;
  setSelectedPost?: (post: PostSchema | null) => void;
}) => {
  const { register, handleSubmit, reset } = useForm();
  const [showComments, setShowComments] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.posts);
  const { profile } = useAppSelector((state) => state.userProfile);

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/posts/${post?._id}/like`,
        {},
        { withCredentials: true }
      );
      dispatch(updatePost(response.data.post));

      if (profile?.posts) {
        const postIndex = profile?.posts?.findIndex((p) => {
          return p._id === post?._id;
        });

        if (
          user &&
          profile &&
          !profile.posts[postIndex].likes.includes(user?._id)
        ) {
          dispatch(addUserProfilePostLike({ postIndex, userId: user._id }));
        } else if (
          user &&
          profile &&
          profile.posts[postIndex].likes.includes(user?._id)
        ) {
          dispatch(removeUserProfilePostLike({ postIndex, userId: user._id }));
        }
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async (data: FieldValues) => {
    if (!data.newComment.trim() || loading) return;

    dispatch(setLoading(true));
    try {
      const response = await axios.post(
        `${BASE_URL}/posts/${post?._id}/comments`,
        { content: data?.newComment.trim() },
        { withCredentials: true }
      );
      dispatch(updatePost(response.data.post));
      setShowComments(true);
      reset();

      if (profile?.posts) {
        dispatch(updateUserProfilePost(response.data.post));
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const isLiked = user && post?.likes?.includes(user._id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-background-lighter rounded-xl  p-4 sm:p-6 border border-gray-800 ${
        isModal &&
        " w-[800px] max-w-[90vw] max-h-[85vh] overflow-y-auto md:gap-8"
      }`}
    >
      <div>
        {/* Post Header */}
        <div className="flex justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={
                post?.author?.profilePicture ||
                `https://api.dicebear.com/5.x/initials/svg?seed=${post?.author?.username}`
              }
              alt={post?.author?.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <Link to={`/profile/${post?.author?._id}`}>
                <h3 className="font-semibold hover:underline">
                  {post?.author?.username}
                </h3>
              </Link>
              <p className="text-sm text-gray-400">
                {formatDistanceToNow(new Date(post?.createdAt || ""), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          {isModal && (
            <X
              onClick={() => {
                if (setSelectedPost) {
                  setSelectedPost(null);
                }
              }}
              className="w-8 h-8 hover:text-primary cursor-pointer transition-colors duration-200 text-white"
            />
          )}
        </div>

        {/* Post Content */}
        {post?.content && (
          <p className="text-gray-200 mb-4 whitespace-pre-wrap break-words">
            {post?.content}
          </p>
        )}

        {/* Post Image - if not undefined*/}
        {post?.image && (
          <img
            src={post?.image}
            alt="Post content"
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        )}

        {/* Post Actions */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-400">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors cursor-pointer ${
              isLiked ? "text-primary" : "hover:text-primary"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{post?.likes?.length}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post?.comments?.length}</span>
            {showComments ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button className="ml-auto hover:text-primary transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-4 pt-4 border-t border-gray-800 ${
              isModal && "min-w-[50%] flex flex-col-reverse gap-2 "
            }`}
          >
            {/* Add Comment */}
            <form
              onSubmit={handleSubmit((data) => {
                handleAddComment(data);
              })}
              className="flex gap-2 mb-4"
            >
              <input
                {...register("newComment")}
                type="text"
                placeholder="Write a comment..."
                className="w-full bg-background rounded-lg px-4 py-2 border border-gray-700 focus:border-primary focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="btn-primary px-4 py-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4 max-h-[40vh] overflow-y-auto">
              {post?.comments.map((comment) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <img
                    src={
                      comment.user.profilePicture ||
                      `https://api.dicebear.com/5.x/initials/svg?seed=${comment?.user?.username}`
                    }
                    alt={comment.user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="  w-full overflow-hidden">
                    <div className="bg-background rounded-lg px-4 py-2">
                      <p className="font-semibold text-sm">
                        {comment.user.username}
                      </p>
                      <p className="text-gray-300 break-words">
                        {comment.content}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default Post;
