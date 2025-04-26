import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ChevronLeft, SendHorizonal } from "lucide-react";
import {
  addMessage,
  Message,
  setMessages,
  setTypingUser,
} from "../../store/slices/chatSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import { BASE_URL } from "../../utils/constants";
import { format } from "date-fns";
import { socket } from "../../utils/socket";
import MessageContent from "../common/MessageContent";

interface Friend {
  _id: string;
  isVerified: boolean;
  profilePicture: string;
  username: string;
  email: string;
}

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { messages, typingUser } = useAppSelector((state) => state.chat);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [input, setInput] = useState("");
  const [isOnline, setIsOnline] = useState<Record<string, boolean>>({});

  const messageEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showFriends, setShowFriends] = useState(true);
  const loggedInUserId = user?._id;

  const fetchOldMessages = async () => {
    try {
      console.log("fetching old messages");
      dispatch(setMessages([]));
      const response = await axios.get(
        `${BASE_URL}/conversation/get/${selectedFriend?._id}`,
        { withCredentials: true }
      );
      console.log(response.data);

      dispatch(setMessages(response.data.messages));
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/friends`, {
        withCredentials: true,
      });

      console.log(response?.data.friends);
      setFriends(response.data.friends);
      if (conversationId) {
        const currentFriendChat = response.data.friends.filter(
          (friend: Friend) => {
            return (
              [loggedInUserId, friend._id].sort().join("_") === conversationId
            );
          }
        );
        setSelectedFriend(currentFriendChat[0]);
      }
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log(isOnline);
  }, [isOnline]);

  useEffect(() => {
    try {
      if (!conversationId) return;

      fetchOldMessages();

      if (user?._id) {
        socket.auth = { userId: user._id };
        socket.connect();
      }

      socket.emit("join-room", { conversationId });
      socket.on("receive-message", (message: Message) => {
        dispatch(addMessage({ ...message }));
      });
      socket.on("user-typing", ({ username }) => {
        console.log(username, "is typing");
        dispatch(setTypingUser(username));
      });
      socket.on("user-stop-typing", () => {
        console.log("stopped typing");
        dispatch(setTypingUser(null));
      });
    } catch (error) {
      console.log(error);
    }

    return () => {
      socket.emit("leave-room", { conversationId });
      socket.off("receive-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [conversationId, selectedFriend]);

  useEffect(() => {
    fetchFriends();

    socket.on("update-online-users", (onlineIds: string[]) => {
      const onlineMap: Record<string, boolean> = {};
      onlineIds.forEach((id) => (onlineMap[id] = true));
      setIsOnline(onlineMap);
    });

    return () => {
      socket.off("update-online-users");
    };
  }, []);

  useEffect(() => {
    if (user?._id) {
      socket.emit("user-online", user._id);
    }
  }, [user]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView();
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = {
      content: input,
      sender: loggedInUserId,
      createdAt: new Date(),
    };

    socket.emit("send-message", { conversationId, message: msg });
    setInput("");
    socket.emit("stop-typing", { conversationId, username: loggedInUserId });
  };

  const handleTyping = () => {
    socket.emit("typing", { conversationId, username: loggedInUserId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { conversationId, username: loggedInUserId });
    }, 1000);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Friends List */}
      <div
        className={`${
          showFriends ? "block" : "hidden"
        } md:block md:w-1/3 bg-[#1f1f1f] text-white p-4 w-full overflow-y-auto`}
      >
        <div className="flex gap-3 items-center mb-4">
          <button
            onClick={() => {
              setShowFriends(true);
              setSelectedFriend(null);
              navigate("/feed");
            }}
            className=" bg-[#333] p-1 rounded hover:bg-primary cursor-pointer transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold ">Messages</h2>
        </div>
        {friends.length === 0 ? (
          <p className="text-gray-400 text-sm">You have no friends yet.</p>
        ) : (
          friends.map((friend) => {
            const convId = [loggedInUserId, friend._id].sort().join("_");
            return (
              <div
                key={friend._id}
                onClick={() => {
                  setSelectedFriend(friend);
                  navigate(`/messages/${convId}`);
                  if (window.innerWidth < 768) setShowFriends(false); // collapse list on mobile
                }}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer 
                  ${
                    selectedFriend?._id === friend._id
                      ? "bg-primary-dark"
                      : "hover:bg-[#2a2a2a]"
                  }`}
              >
                <img
                  src={
                    friend.profilePicture ||
                    `https://api.dicebear.com/5.x/initials/svg?seed=${friend.username}`
                  }
                  alt={friend?.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{friend.username}</p>
                  <p
                    className={` ${
                      isOnline[friend._id] && "text-green-400"
                    } text-xs text-gray-400`}
                  >
                    {isOnline[friend._id] ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col bg-[#141414] text-white relative">
        {selectedFriend ? (
          <>
            <div className="p-4 border-b border-[#333]  flex items-center gap-3">
              {/* Back Button on mobile */}
              <button
                onClick={() => {
                  setShowFriends(true);
                  setSelectedFriend(null);
                  navigate("/messages");
                }}
                className="md:hidden bg-[#333] p-1 rounded cursor-pointer hover:bg-primary transition-colors duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div
                onClick={() => navigate(`/profile/${selectedFriend._id}`)}
                className="flex gap-3 items-center h-5 cursor-pointer group"
              >
                <img
                  alt="img"
                  src={
                    selectedFriend.profilePicture ||
                    `https://api.dicebear.com/5.x/initials/svg?seed=${selectedFriend.username}`
                  }
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <span className="font-semibold group-hover:underline">
                    {selectedFriend.username}
                  </span>
                  {typingUser === selectedFriend._id && (
                    <p className="text-sm text-gray-400 animate-pulse">
                      typing...
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 relative overflow-y-auto p-4 space-y-2">
              {messages.map((msg: Message, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`relative w-fit max-w-xs px-4 py-2 rounded-lg break-words ${
                    msg.sender === loggedInUserId
                      ? "bg-primary ml-auto before:content-[''] before:absolute before:top-2 before:right-[-15px] before:border-8 before:border-transparent before:border-l-primary"
                      : "bg-[#2c2c2c] before:content-[''] before:absolute before:top-2 before:left-[-15px] before:border-8 before:border-transparent before:border-r-[#2c2c2c]"
                  }`}
                >
                  <MessageContent content={msg.content} />
                  <div className="text-[10px] text-gray-300 text-right">
                    {format(msg.createdAt, "MMM d, yyyy h:mm a")}
                  </div>
                </motion.div>
              ))}
              <div ref={messageEndRef}></div>
            </div>

            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2 border-t border-[#333] p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onInput={handleTyping}
                placeholder="Type a message..."
                className="flex-1 p-2 bg-[#222] rounded-lg outline-none text-white"
              />
              <button
                className="bg-primary-dark p-1.5 rounded-lg"
                onClick={sendMessage}
              >
                <SendHorizonal />
              </button>
            </motion.form>
          </>
        ) : (
          <div className="flex-1 md:flex hidden items-center justify-center  text-gray-400 text-lg">
            <p>Select a conversation to start chatting 💬</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
