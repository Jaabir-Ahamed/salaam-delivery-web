"use client"

import { useState, useEffect } from "react"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { Login } from "@/components/login"
import { Signup } from "@/components/signup"
import { ForgotPassword } from "@/components/forgot-password"
import { AuthCallback } from "@/components/auth-callback"
import { Profile } from "@/components/profile"
import { Dashboard } from "@/components/dashboard"
import { DeliveryChecklist } from "@/components/delivery-checklist"
import { SeniorProfile } from "@/components/senior-profile"
import { RouteMap } from "@/components/route-map"
import { SeniorsList } from "@/components/seniors-list"
import { AdminReports } from "@/components/admin-reports"
import { ManageSeniors } from "@/components/manage-seniors"
import { SeniorRegistrationForm } from "@/components/senior-registration-form"
import { CSVImport } from "@/components/csv-import"
import { VolunteerManagement } from "@/components/volunteer-management"
import { SeniorAssignments } from "@/components/senior-assignments"
import { EnvSetupGuide } from "@/components/env-setup-guide"
import type { Senior } from "@/lib/supabase"
import { DeliveryProvider } from "@/contexts/delivery-context"

// Type definitions for application pages and authentication flow
type AuthPage = "login" | "signup" | "forgot-password" | "auth-callback"
type AppPage =
  | "dashboard"
  | "deliveries"
  | "seniors"
  | "map"
  | "reports"
  | "manage-seniors"
  | "add-senior"
  | "edit-senior"
  | "csv-import"
  | "profile"
  | "manage-volunteers"
  | "senior-assignments"
  | "env-setup"

/**
 * Main application content component
 * Handles routing between different pages based on authentication state and user role
 */
function AppContent() {
  const { user, isLoading } = useAuth()
  
  // State management for application navigation
  const [authPage, setAuthPage] = useState<AuthPage>("login")
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard")
  const [selectedSeniorId, setSelectedSeniorId] = useState<string | null>(null)
  const [editingSenior, setEditingSenior] = useState<Senior | null>(null)
  const [previousPage, setPreviousPage] = useState<AppPage>("dashboard")
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")

  // Check for authentication callback parameters on component mount
  // This handles OAuth redirects from Supabase
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const hasAuthParams = urlParams.has("access_token") || urlParams.has("refresh_token") || urlParams.has("type")

      if (hasAuthParams) {
        setAuthPage("auth-callback")
      }
    }
  }, [])

  // Loading state while authentication is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Authentication flow - render appropriate auth pages when user is not authenticated
  if (!user) {
    switch (authPage) {
      case "signup":
        return <Signup onNavigateToLogin={() => setAuthPage("login")} />
      case "forgot-password":
        return <ForgotPassword email={forgotPasswordEmail} onNavigateToLogin={() => setAuthPage("login")} />
      case "auth-callback":
        return (
          <AuthCallback
            onAuthSuccess={(user) => {
              // Auth successful, user will be set by the auth context
              setAuthPage("login")
              setCurrentPage("dashboard")
            }}
            onAuthError={(error) => {
              console.error("Auth callback error:", error)
              setAuthPage("login")
            }}
          />
        )
      default:
        return (
          <Login
            onNavigateToSignup={() => setAuthPage("signup")}
            onForgotPassword={(email) => {
              setForgotPasswordEmail(email)
              setAuthPage("forgot-password")
            }}
            onLoginSuccess={(user) => {
              // Login successful, user will be set by the auth context
              setCurrentPage("dashboard")
            }}

          />
        )
    }
  }

  // Navigation handlers for authenticated users
  const handleNavigate = (page: string) => {
    setPreviousPage(currentPage)
    setCurrentPage(page as AppPage)
    setSelectedSeniorId(null)
    setEditingSenior(null)
  }

  const handleSelectSenior = (seniorId: string) => {
    setSelectedSeniorId(seniorId)
  }

  const handleEditSenior = (senior: Senior) => {
    setEditingSenior(senior)
    setCurrentPage("edit-senior")
  }

  const handleBackFromSenior = () => {
    setSelectedSeniorId(null)
  }

  const handleFormSuccess = () => {
    setCurrentPage("manage-seniors")
    setEditingSenior(null)
  }

  // If a senior is selected, show their profile page
  if (selectedSeniorId) {
    return <SeniorProfile seniorId={selectedSeniorId} onNavigate={handleBackFromSenior} previousPage={currentPage} />
  }

  // Main application routing - render appropriate page based on currentPage state
  switch (currentPage) {
    case "profile":
      return <Profile onNavigate={handleNavigate} />
    case "deliveries":
      return <DeliveryChecklist onNavigate={handleNavigate} onSelectSenior={handleSelectSenior} />
    case "seniors":
      return <SeniorsList onNavigate={handleNavigate} onSelectSenior={handleSelectSenior} />
    case "map":
      return <RouteMap onNavigate={handleNavigate} onSelectSenior={handleSelectSenior} />
    case "reports":
      // Admin-only page - redirect non-admins to dashboard
      if (user.role !== "admin" && user.role !== "super_admin") {
        return <Dashboard onNavigate={handleNavigate} />
      }
      return <AdminReports onNavigate={handleNavigate} />
    case "manage-seniors":
      // Admin-only page - redirect non-admins to dashboard
      if (user.role !== "admin" && user.role !== "super_admin") {
        return <Dashboard onNavigate={handleNavigate} />
      }
      return <ManageSeniors onNavigate={handleNavigate} onEditSenior={handleEditSenior} />
    case "add-senior":
      // Admin-only page - redirect non-admins to dashboard
      if (user.role !== "admin" && user.role !== "super_admin") {
        return <Dashboard onNavigate={handleNavigate} />
      }
      return <SeniorRegistrationForm onNavigate={handleNavigate} onSuccess={handleFormSuccess} />
    case "edit-senior":
      // Admin-only page - redirect non-admins to dashboard
      if (user.role !== "admin" && user.role !== "super_admin") {
        return <Dashboard onNavigate={handleNavigate} />
      }
      return (
        <SeniorRegistrationForm
          onNavigate={handleNavigate}
          onSuccess={handleFormSuccess}
          editingSenior={editingSenior}
        />
      )
    case "csv-import":
      // Admin-only page - redirect non-admins to dashboard
      if (user.role !== "admin" && user.role !== "super_admin") {
        return <Dashboard onNavigate={handleNavigate} />
      }
      return <CSVImport onImportComplete={handleFormSuccess} />
    case "manage-volunteers":
      // Admin-only page - redirect non-admins to dashboard
      if (user.role !== "admin" && user.role !== "super_admin") {
        return <Dashboard onNavigate={handleNavigate} />
      }
      // Render VolunteerManagement with a back button for better UX
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              className="mb-4 text-green-700 hover:underline"
              onClick={() => handleNavigate("dashboard")}
            >
              ← Back to Dashboard
            </button>
            <VolunteerManagement onDataChange={() => {}} />
          </div>
        </div>
      )
    case "senior-assignments":
      // Admin-only page - redirect non-admins to dashboard
      if (user.role !== "admin" && user.role !== "super_admin") {
        return <Dashboard onNavigate={handleNavigate} />
      }
      return <SeniorAssignments onNavigate={handleNavigate} />
    case "env-setup":
      return <EnvSetupGuide onNavigate={handleNavigate} />
    default:
      // Default to dashboard for authenticated users
      return <Dashboard onNavigate={handleNavigate} />
  }
}

/**
 * Root application component
 * Wraps the app with necessary providers for authentication and delivery context
 */
export default function App() {
  return (
    <AuthProvider>
      <DeliveryProvider>
        <AppContent />
      </DeliveryProvider>
    </AuthProvider>
  )
}
