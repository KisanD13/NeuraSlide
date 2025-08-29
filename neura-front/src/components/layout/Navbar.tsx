import { Link, useLocation } from "react-router-dom";
import Logo from "../common/Logo";
import { theme } from "../../config/theme";

interface NavbarProps {
  showAuthButtons?: boolean;
}

export default function Navbar({ showAuthButtons }: NavbarProps) {
  const location = useLocation();
  const isAuthPage = location.pathname.includes("/auth");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-lg border-b border-white/10">
      <div className={theme.spacing.container}>
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Navigation Links - Only show on landing page */}
          {!isAuthPage && (
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className={
                  theme.typography.body + " hover:text-white transition-colors"
                }
              >
                Features
              </a>
              <Link
                to="/pricing"
                className={
                  theme.typography.body + " hover:text-white transition-colors"
                }
              >
                Pricing
              </Link>
              <a
                href="#about"
                className={
                  theme.typography.body + " hover:text-white transition-colors"
                }
              >
                About
              </a>
            </div>
          )}

          {/* Auth Buttons - Only show on landing page */}
          {showAuthButtons && !isAuthPage && (
            <div className="flex items-center space-x-4">
              <Link
                to="/auth/login"
                className="hover:text-white transition-colors border-cyan-400/50 text-cyan-400"
              >
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                className={theme.components.button.primary + " px-4 py-2"}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
