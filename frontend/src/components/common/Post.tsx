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
  Share2,
} from "lucide-react";
import { FieldValues, useForm } from "react-hook-form";
import { setLoading, updatePost } from "../../store/slices/postSlice";
import { Link } from "react-router";

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

const Post = ({ post }: { post: PostSchema }) => {
  const { register, handleSubmit } = useForm();
  const [showComments, setShowComments] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.posts);

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/posts/${post._id}/like`,
        {},
        { withCredentials: true }
      );
      dispatch(updatePost(response.data.post));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async (data: FieldValues) => {
    if (!data.newComment.trim() || loading) return;

    dispatch(setLoading(true));
    try {
      const response = await axios.post(
        `${BASE_URL}/posts/${post._id}/comments`,
        { content: data?.newComment.trim() },
        { withCredentials: true }
      );
      dispatch(updatePost(response.data.post));
      setShowComments(true);
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const isLiked = user && post?.likes?.includes(user._id);
  // console.log(post);
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-background-lighter rounded-xl p-4 sm:p-6 border border-gray-800"
    >
      {/* Post Header */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={
            post?.author?.profilePicture ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
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
            {formatDistanceToNow(new Date(post?.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>

      {/* Post Content */}
      {post?.content && (
        <p className="text-gray-200 mb-4 whitespace-pre-wrap">
          {post?.content}
        </p>
      )}

      {/* Post Image - if not undefined*/}
      {
        post?.image && (
          <img
            src={post?.image}
            alt="Post content"
            className="w-full h-64 object-cover rounded-lg mb-4"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/default-post.jpg";
            }}
          />
        )
        // (
        //   <div className="w-full h-32 bg-gray-800/50 rounded-lg mb-4 flex items-center justify-center">
        //     <p className="text-gray-400 text-center px-4">
        //       {post?.content || "No content available"}
        //     </p>
        //   </div>
        // )
      }

      {/* Post Actions */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-400">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${
            isLiked ? "text-primary" : "hover:text-primary"
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
          <span>{post?.likes?.length}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post?.comments?.length}</span>
          {showComments ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        <button className="flex items-center gap-2 hover:text-primary transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button className="ml-auto hover:text-primary transition-colors">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-800"
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
                className="flex-1 bg-background rounded-lg px-4 py-2 border border-gray-700 focus:border-primary focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <img
                    src={
                      comment.user.profilePicture ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                    }
                    alt={comment.user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-background rounded-lg px-4 py-2">
                      <p className="font-semibold text-sm">
                        {comment.user.username}
                      </p>
                      <p className="text-gray-300">{comment.content}</p>
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
