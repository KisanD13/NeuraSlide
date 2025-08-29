import { motion } from "framer-motion";

export default function DashboardSkeleton() {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-white/10 rounded-lg w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-white/10 rounded-lg w-64 animate-pulse"></div>
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-8 bg-white/10 rounded w-16 mb-2 animate-pulse"></div>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg animate-pulse"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Metrics Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="h-6 bg-white/10 rounded w-32 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 bg-white/10 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded w-12 animate-pulse"></div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions and System Health Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
        >
          <div className="h-6 bg-white/10 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-20 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-white/10 rounded w-32 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
        >
          <div className="h-6 bg-white/10 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded w-20 animate-pulse"></div>
                </div>
                <div className="h-4 bg-white/10 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
