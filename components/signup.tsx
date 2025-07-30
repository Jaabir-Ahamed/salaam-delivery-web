"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { SupabaseService } from "@/lib/supabase-service"
import { Loader2, Heart, ArrowLeft, Languages, CheckCircle, AlertCircle } from "lucide-react"

interface SignupProps {
  onNavigateToLogin: () => void
}

export function Signup({ onNavigateToLogin }: SignupProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    role: "volunteer",
    languages: ["english"],
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleLanguageChange = (language: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      languages: checked ? [...prev.languages, language] : prev.languages.filter((lang) => lang !== language),
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.name) {
      setError("Please fill in all required fields")
      return false
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (formData.languages.length === 0) {
      setError("Please select at least one language")
      return false
    }

    // Admin-specific validation
    if (formData.role === "admin") {
      if (!formData.phone) {
        setError("Phone number is required for admin accounts")
        return false
      }
      
      // Validate phone number format
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        setError("Please enter a valid phone number")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const result = await SupabaseService.signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        languages: formData.languages,
      })

      if (result.error) {
        throw result.error
      }

      setSuccess(true)
      setSuccessMessage(
        result.message ||
          "Account created successfully! Please check your email to confirm your account. The confirmation link will redirect you back to this app.",
      )

      // Auto-redirect to login after 5 seconds
      setTimeout(() => {
        onNavigateToLogin()
      }, 5000)
    } catch (error: any) {
      setError(error.message || "An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  const availableLanguages = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "arabic", label: "Arabic" },
    { value: "urdu", label: "Urdu" },
    { value: "hindi", label: "Hindi" },
    { value: "bengali", label: "Bengali" },
    { value: "punjabi", label: "Punjabi" },
    { value: "farsi", label: "Farsi" },
  ]

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Check Your Email!</h2>
            <p className="text-green-600 mb-6 leading-relaxed">{successMessage}</p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
              <ol className="text-sm text-blue-700 text-left space-y-1">
                <li>1. Check your email inbox (and spam folder)</li>
                <li>2. Click the confirmation link in the email</li>
                <li>3. You'll be redirected back to this app</li>
                <li>4. Sign in with your new account</li>
                {formData.role === "admin" && (
                  <li className="font-semibold text-green-700">5. You'll have admin privileges after confirmation</li>
                )}
              </ol>
            </div>

            <Button onClick={onNavigateToLogin} className="bg-green-600 hover:bg-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 flex items-center justify-center">
            <img 
              src="https://images.squarespace-cdn.com/content/640a69d4ab6bd06b8101c1c7/69b970bb-3f0e-4ecf-b458-af07e5485667/Salaam+Food+Pantry+Favicon.png?content-type=image%2Fpng" 
              alt="Salaam Food Pantry Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-green-800">Join Salaam Food Pantry</CardTitle>
            <CardDescription className="text-green-600 font-medium">Create your volunteer account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number {formData.role === "admin" && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required={formData.role === "admin"}
              />
              {formData.role === "admin" && (
                <p className="text-xs text-gray-600">Required for admin accounts for emergency contact</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Role *</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="volunteer" id="volunteer" />
                  <Label htmlFor="volunteer">Volunteer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Admin</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Language Skills */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Languages className="w-4 h-4 text-blue-600" />
                  <span>Languages You Speak *</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Select all languages you can communicate in. This helps us match you with seniors who need translation
                  assistance.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  {availableLanguages.map((language) => (
                    <div key={language.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={language.value}
                        checked={formData.languages.includes(language.value)}
                        onCheckedChange={(checked) => handleLanguageChange(language.value, checked as boolean)}
                      />
                      <Label htmlFor={language.value} className="text-sm">
                        {language.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={onNavigateToLogin} className="text-green-600 hover:text-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Already have an account? Sign In
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Admin Email: salaamfoodpantry@gmail.com</p>
            <p className="text-xs mt-1">Use this email for automatic admin access</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
