import { motion } from "framer-motion";
import {
  Home,
  Search,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import type { AppDispatch } from "../../store";
import NavItem from "../common/NavItem";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    try {
      await axios.post(
        BASE_URL + "/auth/logout",
        {},
        { withCredentials: true }
      );
      dispatch(logout());
    } catch (error) {
      console.log(error);
    }
  };

  const handleNavigation = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-64 h-screen bg-background-lighter border-r border-gray-800 p-4">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"
          >
            <span className="text-xl font-bold">G</span>
          </motion.div>
          <span className="text-xl font-bold">GeekNET</span>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <NavItem
              to="/feed"
              icon={<Home />}
              label="Home"
              onClick={handleNavigation}
            />
            <NavItem
              to="/search"
              icon={<Search />}
              label="Search"
              onClick={handleNavigation}
            />
            <NavItem
              to="/notifications"
              icon={<Bell />}
              label="Notifications"
              onClick={handleNavigation}
            />
            <NavItem
              to="/messages"
              icon={<MessageSquare />}
              label="Messages"
              onClick={handleNavigation}
            />
            <NavItem
              to="/profile"
              icon={<User />}
              label="Profile"
              onClick={handleNavigation}
            />
            <NavItem
              to="/settings"
              icon={<Settings />}
              label="Settings"
              onClick={handleNavigation}
            />
          </ul>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-background rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
