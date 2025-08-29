import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Package,
  BarChart3,
  User,
  X,
} from "lucide-react";
import Logo from "../common/Logo";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

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

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 h-screen bg-white/10 backdrop-blur-lg border-r border-white/20 transition-transform duration-300 ease-in-out w-64 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:fixed`}
      >
        <div className="p-6">
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="pb-8">
            <Logo />
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
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
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
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
    </>
  );
}
