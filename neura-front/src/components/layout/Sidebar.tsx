import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Package,
  BarChart3,
  User,
} from "lucide-react";
import { useAuthContext } from "../../contexts/AuthContext";

const navigationItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: "Conversations",
    path: "/conversations",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    name: "Automations",
    path: "/automations",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    name: "Products",
    path: "/products",
    icon: <Package className="w-5 h-5" />,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    name: "Account",
    path: "/account",
    icon: <User className="w-5 h-5" />,
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuthContext();

  return (
    <div className="w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 h-screen fixed left-0 top-0 z-40">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="text-white font-semibold text-lg">NeuraSlide</span>
        </div>

        {/* User Info */}
        <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {user?.name || "User"}
              </p>
              <p className="text-white/60 text-xs">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-500/30"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg border border-cyan-500/30"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center space-x-3">
                  <span
                    className={`${isActive ? "text-cyan-400" : "text-white/60 group-hover:text-white"}`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
