import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaClipboardList, FaSignOutAlt, FaUser } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { Link } from "react-router";
import logo from "../assets/images/logo.webp";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 md:px-8 h-16  flex items-center justify-between">
        {/* Logo Left */}
        <img src={logo} alt="Logo" className="h-10 object-contain" />

        {/* Avatar Right */}
        <div className="relative">
          <button
            className="cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img
              src={
                user.avatar ||
                "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_rp_progressive&w=740&q=80"
              }
              alt={user.name}
              className="h-11 w-11 rounded-full border border-gray-300"
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0, originY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0, originY: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute right-0  mt-0 w-72"
              >
                {/* Main Grey Card */}
                <div className="bg-gray-100 rounded-xl shadow-xl p-5">
                  {/* Header Section */}
                  <div className="mb-4 flex justify-between">
                    <div>
                      <h3 className="text-gray-800 font-semibold text-lg">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs px-2 font-semibold py-1 text-center rounded-full bg-yellow-400 text-[#131518] capitalize mt-1">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-300 mb-3"></div>

                  {/* Menu Items */}
                  <div className="space-y-3 text-gray-700">
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center gap-3 hover:text-black transition"
                    >
                      <FaUser />
                      Profile
                    </Link>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 hover:text-black transition"
                    >
                      <MdDashboard />
                      Dashboard
                    </Link>

                    <Link
                      to="/bookings"
                      className="flex items-center gap-3 hover:text-black transition"
                    >
                      <FaClipboardList />
                      My Bookings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex cursor-pointer items-center gap-3 hover:text-red-500 transition w-full text-left"
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  );
}
