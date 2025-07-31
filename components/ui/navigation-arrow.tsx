"use client"

import { ArrowLeft, ArrowRight, Home, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

interface NavigationArrowProps {
  onNavigate: (page: string) => void
  currentPage?: string
  showBack?: boolean
  showHome?: boolean
  showSettings?: boolean
  className?: string
}

export function NavigationArrow({ 
  onNavigate, 
  currentPage, 
  showBack = true, 
  showHome = true, 
  showSettings = false,
  className = ""
}: NavigationArrowProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  const getPreviousPage = () => {
    // Define navigation flow based on current page
    switch (currentPage) {
      case "deliveries":
      case "seniors":
      case "map":
        return "dashboard"
      case "reports":
      case "manage-seniors":
      case "manage-volunteers":
      case "senior-assignments":
        return "dashboard"
      case "add-senior":
      case "edit-senior":
        return "manage-seniors"
      case "csv-import":
        return "manage-seniors"
      case "profile":
        return "dashboard"
      default:
        return "dashboard"
    }
  }

  const handleBack = () => {
    const previousPage = getPreviousPage()
    onNavigate(previousPage)
  }

  const handleHome = () => {
    onNavigate("dashboard")
  }

  const handleSettings = () => {
    onNavigate("profile")
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      )}
      
      {showHome && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHome}
          className="flex items-center gap-2 text-green-600 hover:text-green-700"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Button>
      )}
      
      {showSettings && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSettings}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      )}
    </div>
  )
}

// Quick navigation component for common actions
export function QuickNavigation({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  return (
    <div className="flex items-center gap-2 p-2 bg-white border-b">
      <NavigationArrow onNavigate={onNavigate} showBack={false} />
      
      <div className="flex-1" />
      
      {isAdmin && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("reports")}
            className="text-sm"
          >
            Reports
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("manage-seniors")}
            className="text-sm"
          >
            Seniors
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("manage-volunteers")}
            className="text-sm"
          >
            Volunteers
          </Button>
        </div>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate("profile")}
        className="text-sm"
      >
        Profile
      </Button>
    </div>
  )
} 