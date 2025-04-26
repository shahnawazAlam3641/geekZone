import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import useDebounce from "../../hooks/useDebounce";
import { BASE_URL } from "../../utils/constants";
import UserCard from "../common/UserCard";
import Spinner from "../common/spinner";
import { User } from "../../store/slices/authSlice";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastUserRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
  }, [debouncedQuery]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedQuery.trim()) return;

      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/users/search?query=${debouncedQuery}&page=${page}&limit=10`,
          { withCredentials: true }
        );

        setUsers((prev) => [...prev, ...res.data.users]);
        setHasMore(res.data.users.length > 0);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedQuery, page]);

  return (
    <div className="container max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4 text-center text-white">
        Search Users
      </h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 text-white placeholder-gray-400 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4 w-full h-[80vh] no-scrollbar  overflow-y-auto pr-2"
      >
        {users.length > 0 ? (
          users.map((user, index) => {
            const isLast = index === users.length - 1;
            return (
              <div key={user._id} ref={isLast ? lastUserRef : null}>
                <UserCard user={user} />
              </div>
            );
          })
        ) : debouncedQuery.trim() && !loading ? (
          <p className="text-muted-foreground text-center">No users found.</p>
        ) : null}

        {loading && <Spinner />}
      </motion.div>
    </div>
  );
}
