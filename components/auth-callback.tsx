"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { SupabaseService } from "@/lib/supabase-service"
// Lazy import to avoid build-time initialization
let supabase: any = null
const getSupabase = () => {
  if (!supabase) {
    supabase = require("@/lib/supabase").supabase
  }
  return supabase
}
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface AuthCallbackProps {
  onAuthSuccess: (user: any) => void
  onAuthError: (error: string) => void
}

export function AuthCallback({ onAuthSuccess, onAuthError }: AuthCallbackProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    try {
      // Get the current session
      const {
        data: { session },
        error: sessionError,
      } = await getSupabase().auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        setStatus("error")
        setMessage("Authentication failed. Please try logging in again.")
        onAuthError("Authentication failed")
        return
      }

      if (!session || !session.user) {
        setStatus("error")
        setMessage("No authentication session found. Please try logging in again.")
        onAuthError("No session found")
        return
      }

      const user = session.user

      // Check if user email is confirmed
      if (!user.email_confirmed_at) {
        setStatus("error")
        setMessage("Email not confirmed. Please check your email and click the confirmation link.")
        onAuthError("Email not confirmed")
        return
      }

      // Check if volunteer record exists
      let volunteer = await SupabaseService.getCurrentUser()

      // If no volunteer record exists, create one
      if (!volunteer && user.user_metadata) {
        try {
          const volunteerData = {
            id: user.id,
            email: user.email!,
            name: user.user_metadata.name || user.user_metadata.full_name || "Unknown",
            phone: user.user_metadata.phone,
            role: user.user_metadata.role || "volunteer",
            languages: user.user_metadata.languages || ["english"],
            active: true,
          }

          const { error: volunteerError } = await getSupabase()
            .from("volunteers")
            .insert([volunteerData])

          if (volunteerError) {
            throw volunteerError
          }

          // Fetch the newly created volunteer record
          volunteer = await SupabaseService.getCurrentUser()
        } catch (createError) {
          console.error("Error creating volunteer record:", createError)
          setStatus("error")
          setMessage("Account created but profile setup failed. Please contact support.")
          onAuthError("Profile setup failed")
          return
        }
      }

      if (!volunteer) {
        setStatus("error")
        setMessage("User profile not found. Please contact support.")
        onAuthError("Profile not found")
        return
      }

      setStatus("success")
      setMessage(`Welcome ${volunteer.name}! Redirecting to your dashboard...`)

      // Wait a moment then redirect
      setTimeout(() => {
        onAuthSuccess(volunteer)
      }, 2000)
    } catch (error: any) {
      console.error("Unexpected auth callback error:", error)
      setStatus("error")
      setMessage("An unexpected error occurred. Please try again.")
      onAuthError(error.message || "Unexpected error")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirming Your Account</h2>
              <p className="text-gray-600">Please wait while we set up your profile...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">Account Confirmed!</h2>
              <p className="text-green-600">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">Authentication Error</h2>
              <p className="text-red-600 mb-4">{message}</p>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Return to Login
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
