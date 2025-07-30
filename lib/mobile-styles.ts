// Mobile-first responsive design utilities
export const mobileStyles = {
  // Container styles
  container: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
  
  // Responsive padding
  padding: {
    sm: "p-2 sm:p-4",
    md: "p-3 sm:p-6", 
    lg: "p-4 sm:p-8",
  },

  // Card spacing
  cardSpacing: "space-y-4 sm:space-y-6",

  // Button styles for mobile
  mobileButton: "min-h-[44px] flex items-center justify-center w-full sm:w-auto",

  // Text styles
  heading: {
    sm: "text-base sm:text-lg font-semibold text-gray-900 leading-tight",
    md: "text-lg sm:text-xl font-semibold text-gray-900 leading-tight",
    lg: "text-xl sm:text-2xl font-bold text-gray-900 leading-tight",
  },
  subtext: "text-xs sm:text-sm text-gray-600 leading-relaxed",

  // Layout utilities
  flexColumn: "flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2",
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",

  // Grid layouts
  grid: {
    cols1: "grid grid-cols-1",
    cols2: "grid grid-cols-1 sm:grid-cols-2",
    cols3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    cols4: "grid grid-cols-2 lg:grid-cols-4",
  },

  // Badge styles
  badge: "text-xs px-2 py-1",

  // Icon spacing
  iconSpacing: "w-4 h-4 mr-2 flex-shrink-0",

  // Touch targets
  touchTarget: "min-h-[44px] min-w-[44px]",

  // Form elements
  form: {
    input: "text-sm",
    label: "text-sm font-medium",
    button: "w-full sm:w-auto min-h-[44px]",
  },

  // Card content
  cardContent: "p-3 sm:p-4 lg:p-6",

  // Avatar sizes
  avatar: {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16 sm:w-20 sm:h-20",
  },

  // Spacing utilities
  spacing: {
    xs: "space-y-1 sm:space-y-2",
    sm: "space-y-2 sm:space-y-3",
    md: "space-y-3 sm:space-y-4",
    lg: "space-y-4 sm:space-y-6",
  },

  // Gap utilities
  gap: {
    xs: "gap-2 sm:gap-3",
    sm: "gap-3 sm:gap-4", 
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  },
}

// Responsive breakpoints
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
}

// Mobile-specific component props
export const mobileProps = {
  button: {
    size: "sm" as const,
    className: "min-h-[44px] flex items-center justify-center w-full sm:w-auto",
  },

  card: {
    className: "hover:shadow-md transition-shadow",
  },

  badge: {
    className: "text-xs px-2 py-1",
  },

  input: {
    className: "text-sm",
  },

  label: {
    className: "text-sm font-medium",
  },
}

// Responsive text utilities
export const responsiveText = {
  xs: "text-xs sm:text-sm",
  sm: "text-sm sm:text-base", 
  md: "text-base sm:text-lg",
  lg: "text-lg sm:text-xl",
  xl: "text-xl sm:text-2xl",
}

// Responsive spacing utilities
export const responsiveSpacing = {
  padding: {
    xs: "p-2 sm:p-3",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6", 
    lg: "p-6 sm:p-8",
  },
  margin: {
    xs: "m-2 sm:m-3",
    sm: "m-3 sm:m-4",
    md: "m-4 sm:m-6",
    lg: "m-6 sm:m-8", 
  },
}
