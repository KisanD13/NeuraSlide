import { Link } from "react-router-dom";

interface LogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({
  showText = true,
  size = "md",
  className = "",
}: LogoProps) {
  const sizeClasses = {
    sm: {
      icon: "w-8 h-8",
      text: "text-lg",
    },
    md: {
      icon: "w-10 h-10",
      text: "text-2xl",
    },
    lg: {
      icon: "w-12 h-12",
      text: "text-3xl",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <Link to="/" className={`inline-flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${currentSize.icon} flex items-center justify-center`}>
        <img
          src="/images/neuraslide-logo.svg"
          alt="NeuraSlide Logo"
          className="w-full h-full"
        />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-cyan-400 tracking-wide">
            Neura
          </span>
          <span
            className={`${currentSize.text} font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600`}
          >
            Slide
          </span>
        </div>
      )}
    </Link>
  );
}
