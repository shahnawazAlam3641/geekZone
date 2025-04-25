import { motion } from "framer-motion";
import { Home, Search, Bell, MessageSquare, User, LogOut } from "lucide-react";
import NavItem from "../common/NavItem";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  addNotification,
  setNotifications,
} from "../../store/slices/notificatonSlice";
import { BASE_URL } from "../../utils/constants";
import axios from "axios";
import { useEffect } from "react";
import { socket } from "../../utils/socket";

// interface SidebarProps {
//   onClose?: () => void;
// }

const Sidebar = () => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const { unreadCount } = useAppSelector((state) => state.notification);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const fetchNotifications = async () => {
    const response = await axios.get(`${BASE_URL}/notifications`, {
      withCredentials: true,
    });
    dispatch(setNotifications(response.data.notifications));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (user?._id) {
      socket.auth = { userId: user._id };
      socket.connect();
    }

    socket.on("new-notification", (notification) => {
      console.log("got something");
      dispatch(addNotification(notification));
    });

    return () => {
      socket.off("new-notification");
      socket.disconnect();
    };
  }, [user?._id]);

  // const handleNavigation = () => {
  //   if (onClose) {
  //     onClose();
  //   }
  // };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className=" left-0 top-0 h-full w-64 bg-background-lighter border-r border-gray-800 p-4 z-50"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-2xl font-bold text-primary">GeekZone</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem
            icon={<Home className="w-6 h-6" />}
            label="Home"
            to="/feed"
          />
          <NavItem
            icon={<Search className="w-6 h-6" />}
            label="Search"
            to="/search"
          />
          <NavItem
            icon={
              <div className="relative">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs text-white px-1.5 bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            }
            label="Notifications"
            to="/notifications"
          />
          <NavItem
            icon={<MessageSquare className="w-6 h-6" />}
            label="Messages"
            to="/messages"
          />
          <NavItem
            icon={<User className="w-6 h-6" />}
            label="Profile"
            to={`/profile/${user?._id}`}
          />
        </nav>
        <NavItem
          icon={<LogOut className="w-6 h-6" />}
          label="Logout"
          to="#"
          onClick={handleLogout}
        />
      </div>
    </motion.div>
  );
};

export default Sidebar;
