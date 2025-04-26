import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import SuggestedUsers from "./SuggestedUsers";
import { useLocation } from "react-router";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex overflow-hidden h-screen bg-background relative">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-80"
        } lg:translate-x-0 transition-transform duration-200 ease-in-out lg:relative fixed inset-y-0 left-0 z-40`}
      >
        <Sidebar />
      </div>

      {/* Main content + Suggested Users */}
      <main className="flex flex-1  max-h-screen overflow-y-hidden">
        <div className="flex-1 container mx-auto px-4 ">{children}</div>

        {/* Right-side suggested users */}
        {location.pathname === "/feed" && (
          <SuggestedUsers isSidebarOpen={isSidebarOpen} />
        )}
      </main>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black opacity-80 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`${
          isSidebarOpen && "left-50"
        } fixed top-4 left-4 z-50 p-2 lg:hidden cursor-pointer rounded-lg bg-background-lighter border border-gray-800 hover:bg-background transition-colors`}
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
}
