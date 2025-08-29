import { useAuthContext } from "../../contexts/AuthContext";
import { logout } from "../../pages/auth/api";
import { Bell, Settings, ChevronDown, Menu } from "lucide-react";
import { Link } from "react-router-dom";

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuthContext();

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  return (
    <header className="h-16 bg-white/10 backdrop-blur-lg border-b border-white/20 fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Mobile menu and Page title */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-white font-semibold text-lg">Dashboard</h1>
            <p className="text-white/60 text-sm hidden sm:block">
              Welcome back, {user?.name}
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-white/70 hover:text-white transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="w-3 h-3 bg-red-500 rounded-full -translate-y-1 translate-x-1"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer">
            <Settings className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-white/70" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="p-2">
                <div className="px-3 py-2 text-white/60 text-sm border-b border-white/10">
                  Signed in as <span className="text-white">{user?.email}</span>
                </div>
                <button className="w-full text-left px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer">
                  Profile Settings
                </button>
                <button className="w-full text-left px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer">
                  Account Settings
                </button>
                <Link
                  to="/pricing"
                  className="w-full text-left px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer block"
                >
                  Pricing & Plans
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
