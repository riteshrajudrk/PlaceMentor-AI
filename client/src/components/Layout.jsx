import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Code2,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "DSA Tracker", path: "/dsa", icon: Code2 },
    { name: "Resume Analyzer", path: "/resume", icon: FileText },
    { name: "Mock Interview", path: "/mock", icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-[#030712] flex">

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-black/80 backdrop-blur-xl border-r border-white/5 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-[#3B82F6]">Place</span>
              <span className="text-white">Mentor</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              AI-Powered Placement Prep
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User + Logout */}
          <div className="p-4 border-t border-white/5">
            <div className="mb-4 p-3 rounded-xl bg-white/5">
              <p className="text-xs text-gray-500">Logged in as</p>
              <p className="text-sm font-semibold text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">

        {/* Top Bar */}
        <header className="sticky top-0 h-16 bg-black/50 backdrop-blur-lg border-b border-white/5 flex items-center justify-between px-6 z-30">
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="text-right">
            <p className="text-xs text-gray-500">
              Readiness Score
            </p>
            <p className="text-xl font-bold text-[#3B82F6]">
              {user?.readinessScore?.toFixed(1) || "0.0"}%
            </p>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}