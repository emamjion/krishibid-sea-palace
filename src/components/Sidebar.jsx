import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  CreditCardIcon,
  LayoutDashboard,
  LogOut,
  SquarePercent,
  User,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import logo from "../assets/images/logo.webp";

const Sidebar = ({ sidebarOpen, setSidebarOpen, collapsed }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
      setUser(decoded);
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!role) return null;

  const menuItems =
    role === "admin"
      ? [
          { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          {
            name: "Manage Clients",
            path: "/dashboard/manage-clients",
            icon: Users,
          },
          {
            name: "Manage Sales Team",
            path: "/dashboard/manage-sales",
            icon: UsersRound,
          },
          {
            name: "Manage Bookings",
            path: "/dashboard/manage-bookings",
            icon: ClipboardList,
          },
          {
            name: "Manage Offers",
            path: "/dashboard/manage-offers",
            icon: SquarePercent,
          },
        //   {
        //     name: "Payment History",
        //     path: "/dashboard/payment-history",
        //     icon: CreditCardIcon,
        //   },
          { name: "Profile", path: "/dashboard/profile", icon: User },
        ]
      : role === "sales"
        ? [
            { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
            {
              name: "My Clients",
              path: "/dashboard/my-clients",
              icon: BookOpen,
            },
            { name: "Profile", path: "/dashboard/profile", icon: User },
          ]
        : [
            { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
            {
              name: "My Bookings",
              path: "/dashboard/my-bookings",
              icon: BookOpen,
            },
            {
              name: "Payment History",
              path: "/dashboard/payment-history",
              icon: CreditCard,
            },
            { name: "Profile", path: "/dashboard/profile", icon: User },
          ];

  return (
    <motion.aside
      initial={false}
      animate={{
        x: window.innerWidth < 1024 ? (sidebarOpen ? 0 : "-100%") : 0,
        width: collapsed ? 80 : 260,
      }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 h-screen w-[260px] bg-[#131518] text-white flex flex-col overflow-hidden z-50 lg:static"
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-800 flex items-center justify-between shrink-0">
        {!collapsed && (
          <img src={logo} alt="logo" className="w-28 object-contain" />
        )}

        <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
          <X size={20} />
        </button>
      </div>

      {/* Menu (ONLY scroll area) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center ${
                  collapsed ? "justify-center" : "gap-3"
                } px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-[#ebb93a] text-black"
                    : "text-gray-300 hover:bg-gray-800"
                }`
              }
            >
              <Icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom (fixed, no scroll) */}
      <div className="border-t border-gray-800 p-4 space-y-4 shrink-0">
        {user && (
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <img
              src={
                user.avatar || `https://ui-avatars.com/api/?name=${user.name}`
              }
              className="w-10 h-10 rounded-full"
            />

            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs text-gray-400">{user.email}</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-3"
          } w-full px-4 py-3 text-sm text-red-400 hover:bg-gray-800 rounded-xl`}
        >
          <LogOut size={20} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
