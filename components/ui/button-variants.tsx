import { cva } from "class-variance-authority"

// Enhanced button variants for better accessibility and touch targets
export const accessibleButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
        primary: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
        details:
          "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 font-semibold min-h-[44px] min-w-[120px]",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        xl: "h-12 px-10 rounded-md text-base",
        icon: "h-10 w-10",
        touch: "h-12 px-6 text-base", // Optimized for touch devices
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
