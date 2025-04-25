import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  UserPlus,
  Check,
  Edit2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  AlertTriangle,
  Clock1,
  X,
  MessageCircleOff,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import {
  setIsOwnProfile,
  setLoading,
  setProfile,
  setError,
} from "../../store/slices/userProfileSlice";
import Post from "../common/Post";
import EditProfileModal from "./EditProfileModal";
import { useParams } from "react-router";
import { setUser } from "../../store/slices/authSlice";

interface ApiError {
  message: string;
  status?: number;
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface Post {
  _id: string;
  content: string;
  image: string;
  author: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  likes: Array<{
    _id: string;
    username: string;
    profilePicture: string;
  }>;
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      username: string;
      profilePicture: string;
    };
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
}

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  coverPicture: string;
  followers: string[];
  following: string[];
  posts: Post[];
  savedPosts: Post[];
  likedPosts: Post[];
  friends: string[];
  pendingFriendRequests: string[];
  recievedFriendRequests: string[];
  sentFriendRequests: string[];
}

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profile, loading, error, isOwnProfile } = useAppSelector(
    (state) => state.userProfile
  );
  const currentUser = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "liked">(
    "posts"
  );
  const [retryCount, setRetryCount] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const convId = [currentUser?._id, userId].sort().join("_");

  console.log(useParams());

  const fetchUserProfile = async (userId: string): Promise<void> => {
    try {
      dispatch(setLoading(true));
      const response = await axios.get(`${BASE_URL}/users/${userId}`, {
        withCredentials: true,
      });

      console.log(response);

      if (response?.data?._id === currentUser?._id) {
        dispatch(setIsOwnProfile(true));
      }
      dispatch(setProfile(response.data));
    } catch (error) {
      const apiError = error as ApiError;
      dispatch(
        setError(apiError.response?.data?.message || "Failed to fetch profile")
      );
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/friends/request/${profile?._id}`,
        {},
        { withCredentials: true }
      );
      dispatch(setProfile(response.data.otherUser));
      dispatch(setUser(response.data.currentUser));
    } catch (error: any) {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to send connection request"
        )
      );
    }
  };

  const handleUnfriend = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/friends/unfriend/${profile?._id}`,
        {},
        { withCredentials: true }
      );
      dispatch(setProfile(response.data.otherUser));
      dispatch(setUser(response.data.currentUser));
    } catch (error: any) {
      console.log(error);
      dispatch(
        setError(
          error.response?.data?.message || "Failed to accept connection request"
        )
      );
    }
  };

  const handleAcceptFriendRequest = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/friends/accept/${profile?._id}`,
        {},
        { withCredentials: true }
      );
      dispatch(setProfile(response.data.otherUser));
      dispatch(setUser(response.data.currentUser));
    } catch (error: any) {
      console.log(error);
      dispatch(
        setError(
          error.response?.data?.message || "Failed to accept connection request"
        )
      );
    }
  };

  const handleRejectFriendRequest = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/users/friends/reject/${userId}`,
        {},
        { withCredentials: true }
      );

      dispatch(setProfile(response.data.otherUser));
      dispatch(setUser(response.data.currentUser));
    } catch (error: any) {
      console.log(error);
      dispatch(
        setError(
          error.response?.data?.message || "Failed to accept connection request"
        )
      );
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
      dispatch(setIsOwnProfile(userId === currentUser?._id));
    }
  }, [userId, currentUser?._id, retryCount]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setActionError(null);
  };

  const handleEditProfile = () => {
    if (profile) {
      setIsEditModalOpen(true);
    }
  };

  const handleProfileUpdate = async (updatedProfile: {
    username: string;
    bio: string;
    profilePicture: string;
  }) => {
    if (!profile) return;

    try {
      const response = await axios.put(
        `${BASE_URL}/users/profile/edit`,
        updatedProfile,
        { withCredentials: true }
      );
      dispatch(setProfile(response.data));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleSendMessage = () => {
    navigate(`/messages/${convId}`);
  };
  const getCurrentTabContent = () => {
    const content =
      activeTab === "posts"
        ? profile?.posts
        : activeTab === "saved"
        ? profile?.savedPosts
        : profile?.likedPosts;

    if (!content || content.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 space-y-4"
        >
          <div className="bg-gray-800/50 p-4 rounded-full">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-300">
              No {activeTab} yet
            </h3>
            <p className="text-gray-400">
              {isOwnProfile
                ? `You haven't ${
                    activeTab === "posts"
                      ? "created any posts"
                      : activeTab === "saved"
                      ? "saved any posts"
                      : "liked any posts"
                  } yet`
                : `This user hasn't ${
                    activeTab === "posts"
                      ? "created any posts"
                      : activeTab === "saved"
                      ? "saved any posts"
                      : "liked any posts"
                  } yet`}
            </p>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {content.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400"
        >
          Loading profile...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-screen space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-red-500/10 p-4 rounded-full"
        >
          <AlertCircle className="w-12 h-12 text-red-500" />
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-red-500">
            Error Loading Profile
          </h2>
          <p className="text-gray-400 max-w-md">{error}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRetry}
          className="btn-primary flex items-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Try Again</span>
        </motion.button>
      </motion.div>
    );
  }

  if (!profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-screen space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-gray-500/10 p-4 rounded-full"
        >
          <AlertCircle className="w-12 h-12 text-gray-500" />
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-400">
            Profile Not Found
          </h2>
          <p className="text-gray-500">
            The profile you're looking for doesn't exist or has been removed.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="btn-secondary flex items-center space-x-2"
        >
          <span>Go Back</span>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen overflow-y-auto py-5  bg-background no-scrollbar text-gray-100"
    >
      {/* Action Error Alert */}
      {actionError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-red-500">{actionError}</p>
          </div>
        </motion.div>
      )}

      {/* Profile Info */}
      <div className="max-w-6xl mx-auto px-4   z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row items-center  md:items-end space-y-4 md:space-y-0 md:space-x-6"
        >
          <motion.div whileHover={{ scale: 1.02 }} className="relative">
            <img
              src={
                profile.profilePicture ||
                `https://api.dicebear.com/5.x/initials/svg?seed=${profile.username}`
              }
              alt="Profile"
              className="w-40 h-40 object-cover rounded-full border-4 border-background shadow-xl"
            />
            {isOwnProfile && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEditProfile}
                className="absolute bottom-0 right-0 bg-primary p-2 rounded-full"
              >
                <Edit2 className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold"
            >
              {profile.username}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 mt-2"
            >
              {profile.bio}
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex space-x-4"
          >
            {isOwnProfile ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEditProfile}
                className="btn-primary flex items-center space-x-2"
              >
                <Edit2 size={20} />
                <span>Edit Profile</span>
              </motion.button>
            ) : (
              <>
                {profile?.friends?.includes(currentUser?._id || "") && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <MessageSquare size={20} />
                    <span>Message</span>
                  </motion.button>
                )}

                {profile.recievedFriendRequests?.includes(
                  currentUser?._id || ""
                ) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Clock1 size={20} />

                    <span>Request Pending</span>
                  </motion.button>
                )}
                {profile.sentFriendRequests?.includes(
                  currentUser?._id || ""
                ) && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAcceptFriendRequest}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Check size={20} />

                      <span>Accept </span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRejectFriendRequest}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <X size={20} />

                      <span>Reject </span>
                    </motion.button>
                  </>
                )}

                {console.log(
                  !profile.sentFriendRequests?.includes(currentUser?._id || ""),
                  !profile.recievedFriendRequests?.includes(
                    currentUser?._id || ""
                  ),
                  !profile?.friends?.includes(currentUser?._id || "")
                )}
                {!profile.sentFriendRequests?.includes(
                  currentUser?._id || ""
                ) &&
                  !profile.recievedFriendRequests?.includes(
                    currentUser?._id || ""
                  ) &&
                  !profile?.friends?.includes(currentUser?._id || "") && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendFriendRequest}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <UserPlus size={20} />

                      <span>Add Friend</span>
                    </motion.button>
                  )}
                {profile?.friends?.includes(currentUser?._id || "") && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleUnfriend}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <MessageCircleOff size={20} />

                    <span>Unfriend</span>
                  </motion.button>
                )}
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-between mt-8 border-b border-gray-800 pb-4"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center cursor-pointer"
          >
            <div className="text-2xl font-bold">
              {profile.posts?.length || 0}
            </div>
            <div className="text-gray-400">Posts</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center cursor-pointer"
          >
            <div className="text-2xl font-bold">
              {profile.followers?.length || 0}
            </div>
            <div className="text-gray-400">Followers</div>
          </motion.div>{" "}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center cursor-pointer"
          >
            <div className="text-2xl font-bold">
              {profile.following?.length || 0}
            </div>
            <div className="text-gray-400">Following</div>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex space-x-8 mt-4 border-b border-gray-800"
        >
          {["posts", "saved", "liked"].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab as "posts" | "saved" | "liked")}
              className={`pb-4 capitalize ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {getCurrentTabContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={{
            username: profile.username,
            bio: profile.bio,
            profilePicture: profile.profilePicture,
          }}
          onUpdate={handleProfileUpdate}
        />
      )}
    </motion.div>
  );
};

export default UserProfile;
