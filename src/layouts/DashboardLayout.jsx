import { Menu } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [collapsed, setCollapsed] = useState(false); // desktop

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
      />

      {/* Overlay (Mobile only) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col w-full h-screen overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white shadow-sm px-4 lg:px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setSidebarOpen(true);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-lg font-semibold text-gray-800">
            Dashboard Panel
          </h1>
        </header>

        {/* Content (ONLY scroll here) */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
