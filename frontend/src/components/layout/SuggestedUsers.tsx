import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import UserCard from "../common/UserCard";
import { BASE_URL } from "../../utils/constants";

interface Props {
  isSidebarOpen: boolean;
}

export default function SuggestedUsers({ isSidebarOpen }: Props) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/users/all`, {
          withCredentials: true,
        });
        console.log(res.data);
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <motion.aside
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="hidden lg:flex lg:w-72 w-64 shrink-0 p-4 border-l border-gray-800 border-border bg-background h-screen overflow-y-auto no-scrollbar"
      style={{
        display:
          window.innerWidth >= 1024 ||
          (window.innerWidth >= 768 && !isSidebarOpen)
            ? "block"
            : "none",
      }}
    >
      <h3 className="text-lg font-semibold mb-3">People you may know</h3>
      <div className="space-y-2">
        {users.map((user) => (
          <UserCard key={user._id} user={user} />
        ))}
      </div>
    </motion.aside>
  );
}
