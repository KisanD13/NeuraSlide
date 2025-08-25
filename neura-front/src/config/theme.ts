// NeuraSlide Theme Configuration
export const theme = {
  // Gradients
  gradients: {
    primary: "from-primary to-secondary",
    primaryHover: "from-primary-focus to-secondary-focus",
    background: "from-slate-900 via-blue-900 to-indigo-900",
    glass: "bg-white/10 backdrop-blur-sm",
    glow: "shadow-lg shadow-primary/25",
  },

  // Typography
  typography: {
    logo: "text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary",
    heading: "text-3xl font-bold text-white",
    subheading: "text-gray-300",
    body: "text-gray-300",
    link: "text-primary hover:text-primary-focus",
  },

  // Components
  components: {
    button: {
      primary:
        "bg-gradient-to-r from-primary to-secondary hover:from-primary-focus hover:to-secondary-focus text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-primary/25",
      secondary:
        "bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-lg transition-colors border border-white/20",
      disabled: "opacity-50 cursor-not-allowed",
    },
    input: {
      base: "w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors",
      error: "border-error",
      normal: "border-white/20",
    },
    card: {
      glass:
        "bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 shadow-2xl",
    },
  },

  // Spacing
  spacing: {
    section: "py-20",
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  },
};
