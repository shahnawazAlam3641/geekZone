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
import NavItem from "../common/NavItem";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../store";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const handleNavigation = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-full w-64 bg-background-lighter border-r border-gray-800 p-4 z-50"
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
            icon={<Bell className="w-6 h-6" />}
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
          <NavItem
            icon={<Settings className="w-6 h-6" />}
            label="Settings"
            to="/settings"
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
