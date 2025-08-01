"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SupabaseService } from "@/lib/supabase-service"
import { Loader2, Heart, UserPlus, AlertCircle } from "lucide-react"

interface LoginProps {
  onNavigateToSignup: () => void
  onForgotPassword: (email: string) => void
  onLoginSuccess: (user: any) => void
}

export function Login({ onNavigateToSignup, onForgotPassword, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Attempting to sign in with:", email)
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Login timeout - please try again")), 10000)
      })
      
      const signInPromise = SupabaseService.signIn(email, password)
      const result = await Promise.race([signInPromise, timeoutPromise]) as any

      if (result.error) {
        throw result.error
      }

      if (result.data?.user) {
        console.log("Sign in successful, getting user profile...")
        
        // Add timeout for profile fetch
        const profileTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)
        })
        
        const profilePromise = SupabaseService.getCurrentUser()
        const volunteer = await Promise.race([profilePromise, profileTimeoutPromise])
        
        if (volunteer) {
          console.log("User profile loaded successfully")
          onLoginSuccess(volunteer)
        } else {
          throw new Error("User profile not found. Please contact support.")
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }
    onForgotPassword(email)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 flex items-center justify-center">
            <img 
              src="https://images.squarespace-cdn.com/content/640a69d4ab6bd06b8101c1c7/69b970bb-3f0e-4ecf-b458-af07e5485667/Salaam+Food+Pantry+Favicon.png?content-type=image%2Fpng" 
              alt="Salaam Food Pantry Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-green-800">Salaam Food Pantry</CardTitle>
            <CardDescription className="text-green-600 font-medium">Senior Breakfast Delivery</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={handleForgotPassword} className="text-sm">
                Forgot password?
              </Button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={onNavigateToSignup} className="text-green-600 hover:text-green-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Don't have an account? Sign Up
            </Button>
          </div>


        </CardContent>
      </Card>
    </div>
  )
}
