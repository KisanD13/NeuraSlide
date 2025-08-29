import { motion } from "framer-motion";
import { Instagram, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

const benefits = [
  "Automated responses to comments and DMs",
  "AI-powered customer support",
  "Real-time conversation monitoring",
  "Analytics and insights",
  "Multi-account management",
];

const permissions = [
  "Read your Instagram profile information",
  "Access to your posts and comments",
  "Send messages on your behalf",
  "View your followers and following",
];

export default function InstagramConnect() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pb-8"
        >
          <h1 className="text-white text-2xl sm:text-3xl font-bold pb-2">
            Connect Instagram
          </h1>
          <p className="text-white/60 text-sm sm:text-base">
            Connect your Instagram account to start automating your social media
            presence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <div className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-white text-xl font-semibold pb-2">
                Connect Your Instagram Account
              </h2>
              <p className="text-white/60 text-sm">
                Securely connect your Instagram account to enable AI-powered
                automation
              </p>
            </div>

            <div className="space-y-4 pb-6">
              <h3 className="text-white font-medium text-sm uppercase tracking-wide">
                What you'll get:
              </h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer">
              <Instagram className="w-5 h-5" />
              <span>Connect Instagram</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-white/40 text-xs text-center pt-4">
              By connecting, you agree to our{" "}
              <Link to="/terms" className="text-cyan-400 hover:text-cyan-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300">
                Privacy Policy
              </Link>
            </p>
          </motion.div>

          {/* Permissions & Security */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Permissions */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg pb-4">
                Required Permissions
              </h3>
              <div className="space-y-3">
                {permissions.map((permission, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-white/80 text-sm">{permission}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-xs pt-4">
                These permissions are required for NeuraSlide to function
                properly. We only access what's necessary and never share your
                data.
              </p>
            </div>

            {/* Security */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg pb-4">
                Security & Privacy
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      End-to-end encryption
                    </h4>
                    <p className="text-white/60 text-xs">
                      All data is encrypted in transit and at rest
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      SOC 2 compliant
                    </h4>
                    <p className="text-white/60 text-xs">
                      Enterprise-grade security standards
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      GDPR compliant
                    </h4>
                    <p className="text-white/60 text-xs">
                      Your data, your control
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium text-sm">Need help?</h4>
                  <p className="text-white/60 text-xs pb-2">
                    Our support team is here to help you get started
                  </p>
                  <Link
                    to="/support"
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-medium"
                  >
                    Contact Support →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
