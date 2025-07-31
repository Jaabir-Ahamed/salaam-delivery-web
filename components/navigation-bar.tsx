"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, LogOut, Menu } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavigationBarProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  showHome?: boolean
  onHome?: () => void
  showLogout?: boolean
  className?: string
}

export function NavigationBar({ 
  title, 
  showBack = false, 
  onBack, 
  showHome = false, 
  onHome, 
  showLogout = true,
  className = ""
}: NavigationBarProps) {
  const { logout, navigationHistory, goBack } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      const previousPage = goBack()
      if (previousPage) {
        // Navigate to previous page - this will be handled by the parent component
        window.history.back()
      }
    }
  }

  const handleHome = () => {
    if (onHome) {
      onHome()
    } else {
      window.location.href = "/"
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className={`bg-white shadow-sm border-b sticky top-0 z-10 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and title */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Back</span>
              </Button>
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {showHome && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHome}
                className="hidden sm:flex"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Button>
            )}

            {/* Mobile menu */}
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="sm:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {showHome && (
                  <DropdownMenuItem onClick={handleHome}>
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </DropdownMenuItem>
                )}
                {showLogout && (
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop logout button */}
            {showLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            )}
          </div>
        </div>

        {/* Navigation history indicator (mobile only) */}
        {navigationHistory.length > 0 && (
          <div className="mt-2 sm:hidden">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>Navigation:</span>
              <div className="flex items-center space-x-1 overflow-x-auto">
                {navigationHistory.slice(-3).map((page, index) => (
                  <span key={index} className="flex items-center">
                    <span className="truncate max-w-20">{page}</span>
                    {index < navigationHistory.slice(-3).length - 1 && (
                      <ArrowLeft className="w-3 h-3 rotate-180 mx-1" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 