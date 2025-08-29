import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "warning" | "info";

type ToastProps = {
  type: ToastType;
  message: string;
  duration?: number;
  onClose: () => void;
};

const Toast = ({ type, message, duration = 4000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-gradient-to-r from-green-500 to-emerald-600",
          icon: "✅",
          border: "border-green-400",
        };
      case "error":
        return {
          bg: "bg-gradient-to-r from-red-500 to-pink-600",
          icon: "❌",
          border: "border-red-400",
        };
      case "warning":
        return {
          bg: "bg-gradient-to-r from-yellow-500 to-orange-600",
          icon: "⚠️",
          border: "border-yellow-400",
        };
      case "info":
        return {
          bg: "bg-gradient-to-r from-blue-500 to-cyan-600",
          icon: "ℹ️",
          border: "border-blue-400",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-500 to-gray-600",
          icon: "💬",
          border: "border-gray-400",
        };
    }
  };

  const styles = getToastStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`max-w-sm w-full ${styles.bg} ${styles.border} border-2 rounded-xl shadow-2xl backdrop-blur-sm`}
        >
          <div className="flex items-center p-4 text-white">
            <div className="flex-shrink-0 mr-3 text-xl">{styles.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-5">{message}</p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="flex-shrink-0 ml-3 text-white/80 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className="h-1 bg-white/30 rounded-b-xl"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
