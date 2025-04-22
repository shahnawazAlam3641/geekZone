import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { motion } from "framer-motion";
import { SendHorizonal } from "lucide-react";
import {
  addMessage,
  setMessages,
  setTypingUser,
} from "../../store/slices/chatSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import { BASE_URL } from "../../utils/constants";
import { format } from "date-fns";
import { socket } from "../../utils/socket";

// const socket = io("http://localhost:3001");

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { messages, typingUser } = useAppSelector((state: any) => state.chat);

  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [input, setInput] = useState("");
  const [isOnline, setIsOnline] = useState<Record<string, boolean>>({});

  const messageEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loggedInUserId = user?._id;

  const fetchOldMessages = async () => {
    try {
      console.log("fetching old messages");
      dispatch(setMessages([]));
      const response = await axios.get(
        `${BASE_URL}/conversation/get/${selectedFriend._id}`,
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

      setFriends(response.data.friends);
      if (conversationId) {
        const currentFriendChat = response.data.friends.filter((friend) => {
          return (
            [loggedInUserId, friend._id].sort().join("_") === conversationId
          );
        });
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
      socket.on("receive-message", (message: any) => {
        dispatch(addMessage({ ...message, status: "seen" }));
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
      //   status: "sent",
      createdAt: new Date(),
      //   .toLocaleTimeString([], {
      //     hour: "2-digit",
      //     minute: "2-digit",
      //   }),
    };
    // dispatch(addMessage(msg));
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
    <div className="flex h-screen w-full overflow-hidden">
      {/* Friends List */}
      <div className="w-1/3 bg-[#1f1f1f] text-white p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        {friends.map((friend) => {
          const convId = [loggedInUserId, friend._id].sort().join("_");
          return (
            <div
              key={friend._id}
              onClick={() => {
                console.log(friend);
                setSelectedFriend(friend);
                navigate(`/messages/${convId}`);
              }}
              className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-[#2a2a2a]"
            >
              <img
                src={friend.profilePicture || "https://i.pravatar.cc/150"}
                alt={friend.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{friend.username}</p>
                <p className="text-xs text-gray-400">
                  {isOnline[friend._id] ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Section */}
      {selectedFriend && (
        <div className="w-2/3 flex flex-col bg-[#141414] text-white relative">
          <div className="p-4 border-b border-[#333] flex items-center gap-3">
            <img
              alt="img"
              src={selectedFriend.profilePicture || "https://i.pravatar.cc/150"}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <span className="font-semibold">{selectedFriend.username}</span>

              {typingUser === selectedFriend._id && (
                <p className="text-sm text-gray-400 animate-pulse">typing...</p>
              )}
            </div>
          </div>

          <div className="flex-1  overflow-y-auto p-4 space-y-2">
            {messages.map((msg: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`max-w-xs px-4 py-2  rounded-lg ${
                  msg.sender === loggedInUserId
                    ? "bg-primary ml-auto"
                    : "bg-[#2c2c2c]"
                }`}
              >
                <p className="overflow-x-auto break-all">{msg.content}</p>
                <div className="text-[10px] text-gray-300 text-right">
                  {format(msg.createdAt, "MMM d, yyyy h:mm a")}
                  {/* {msg.senderId === loggedInUserId &&
                    (msg.status === "seen" ? "✓✓" : "✓")} */}
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
              <SendHorizonal className="" />
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
};

export default Messages;
