import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { useAppSelector } from "../../store";
import { Bell } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Post, { PostSchema } from "../common/Post";

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  type: "like" | "comment" | "friend_request";
  post: {
    _id: string;
    content: string;
  };
  isRead: boolean;
  createdAt: string;
}

export default function NotificationPage() {
  const { notifications } = useAppSelector((state) => state.notification);
  const [selectedPost, setSelectedPost] = useState<PostSchema | null>(null);

  const navigate = useNavigate();

  const fetchPost = async (postId: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/posts/${postId}`, {
        withCredentials: true,
      });
      setSelectedPost(response.data.post);
    } catch (error) {
      console.log(error);
    }
  };

  const markAllNotificationAsRead = async () => {
    try {
      await axios.put(
        `${BASE_URL}/notifications/readAll`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    markAllNotificationAsRead();
  }, []);

  const renderMessage = (n: (typeof notifications)[number]) => {
    if (n.type === "like") return `${n.sender.username} liked your post`;
    if (n.type === "comment")
      return `${n.sender.username} commented on your post`;
    if (n.type === "friend_request")
      return `${n.sender.username} sent you a friend request`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 relative">
      {selectedPost && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <Post
              post={selectedPost}
              isModal={true}
              setSelectedPost={setSelectedPost}
            />
          </div>
          <div className="top-0 bottom-0 right-0 left-0 absolute bg-[#000000bf] z-40"></div>
        </>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Bell className="w-7 h-7 text-blue-600" />
          Notifications
        </h1>
        {/* {unreadCount > 0 && (
          <button
            onClick={() => {
              notifications
                .filter((n) => !n.isRead)
                .forEach((n) => markNotificationAsRead(n._id));
              dispatch(markAllAsRead());
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Mark all as read
          </button>
        )} */}
      </div>

      {notifications.length === 0 ? (
        <p className="text-center text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-4  h-[89vh] no-scrollbar overflow-y-scroll">
          {notifications.map((n) => (
            <motion.li
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={(e) => {
                navigate(`/profile/${n.sender._id}`);
                e.stopPropagation();
              }}
              key={n._id}
              className={`p-4 rounded-xl border shadow-sm flex flex-wrap justify-between  w-full items-center gap-4 transition card  cursor-pointer ${
                !n.isRead ? "bg-background-lighter" : "bg-background"
              }`}
            >
              <div className="flex justify-center h-full  min-w-[70%] gap-3">
                <img
                  src={
                    n.sender.profilePicture ||
                    `https://api.dicebear.com/5.x/initials/svg?seed=${n?.sender?.username}`
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div className="flex-1">
                  <p className="text-white font-medium">{renderMessage(n)}</p>
                  <p className="text-xs text-white">
                    {format(n.createdAt, "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className=""
              >
                {n.type !== "friend_request" ? (
                  <div className="">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        fetchPost(n.post?._id);
                      }}
                      className=" bg-primary p-2 rounded-md cursor-pointer"
                    >
                      View Post
                    </motion.button>
                  </div>
                ) : null}
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
