import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                ✦ NeuraSlide
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/auth/login"
                className="btn bg-gray-300 text-gray-600 hover:bg-gray-400 border-none hover:shadow-neutral"
              >
                Log In
              </Link>
              <Link
                to="/auth/signup"
                className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white border-none"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-blue-500/10 to-purple-600/5"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                Transform Your Instagram
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Outreach with AI Autopilot.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                NeuraSlide empowers businesses to automate direct messages and
                comments, engage followers in real-time, and drive conversions
                effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/auth/signup"
                  className="btn bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-none px-6 sm:px-8 py-3 text-base sm:text-lg shadow-lg shadow-cyan-500/25 w-full sm:w-auto"
                >
                  Get Started Free
                </Link>
                <button className="btn btn-outline border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400 px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto">
                  Learn More
                </button>
              </div>
            </motion.div>

            {/* Right Content - 3D Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="relative transform rotate-6 sm:rotate-12 hover:rotate-3 sm:hover:rotate-6 transition-transform duration-500">
                <img
                  src="/images/dashboard-mockup.svg"
                  alt="NeuraSlide Dashboard Mockup"
                  className="w-full h-auto max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-auto drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* More sections will be added */}
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-600">
          More sections coming soon...
        </h2>
      </div>
    </div>
  );
}
