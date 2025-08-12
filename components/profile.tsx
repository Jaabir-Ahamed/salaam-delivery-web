"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { SupabaseService } from "@/lib/supabase-service"
// Lazy import to avoid build-time initialization
let supabase: any = null
const getSupabase = () => {
  if (!supabase) {
    supabase = require("@/lib/supabase").supabase
  }
  return supabase
}
import { ArrowLeft, Camera, Save, Mail, Lock, Loader2, User, Shield, LogOut, CheckCircle } from "lucide-react"

interface ProfileProps {
  onNavigate: (page: string) => void
}

export function Profile({ onNavigate }: ProfileProps) {
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    newEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null)

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 5000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      // Profile picture upload not implemented yet
      showMessage("Profile picture upload not implemented yet", "error")
    } catch (error: any) {
      showMessage(error.message || "Error uploading profile picture", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!formData.name.trim()) {
      showMessage("Name is required", "error")
      return
    }

    setIsUpdating(true)
    try {
      await SupabaseService.updateCurrentUser({
        name: formData.name,
        phone: formData.phone,
      })
      showMessage("Profile updated successfully!", "success")
    } catch (error: any) {
      showMessage(error.message || "Error updating profile", "error")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangeEmail = async () => {
    if (!formData.newEmail.trim()) {
      showMessage("Please enter a new email address", "error")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.newEmail)) {
      showMessage("Please enter a valid email address", "error")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await getSupabase().auth.updateUser({
        email: formData.newEmail
      })

      if (error) throw error

      showMessage("Verification email sent! Please check your inbox to confirm the email change.", "success")
      setFormData((prev) => ({ ...prev, newEmail: "" }))
    } catch (error: any) {
      showMessage(error.message || "Error sending verification email", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!formData.currentPassword.trim()) {
      showMessage("Current password is required", "error")
      return
    }

    if (!formData.newPassword.trim()) {
      showMessage("New password is required", "error")
      return
    }

    if (formData.newPassword.length < 6) {
      showMessage("New password must be at least 6 characters", "error")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showMessage("Passwords do not match", "error")
      return
    }

    setIsLoading(true)
    try {
      const result = await SupabaseService.updatePassword(formData.currentPassword, formData.newPassword)
      
      if (result.error) {
        throw new Error(result.error.message || "Failed to change password")
      }

      showMessage("Password changed successfully! Check your email for confirmation.", "success")
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error: any) {
      showMessage(error.message || "Error changing password", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!user?.email) {
      showMessage("No email address found", "error")
      return
    }

    setIsLoading(true)
    try {
      await SupabaseService.resetPassword(user.email)
      showMessage("Password reset email sent! Please check your inbox.", "success")
    } catch (error: any) {
      showMessage(error.message || "Error sending reset email", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => onNavigate("dashboard")} className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Profile Settings</h1>
                <p className="text-xs sm:text-sm text-gray-600">Manage your account information</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-red-600 hover:text-red-700 p-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Success/Error Message */}
        {message && (
          <Card className={messageType === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {messageType === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                )}
                <span className={`text-sm ${messageType === "success" ? "text-green-800" : "text-red-800"}`}>{message}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Picture & Basic Info */}
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <User className="w-5 h-5" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8 px-6 pb-6">
            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-6 sm:space-y-0 sm:space-x-6">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto sm:mx-0">
                <AvatarImage src={profilePictureUrl || undefined} />
                <AvatarFallback className="bg-green-100 text-green-700 text-xl sm:text-2xl font-semibold">
                  {getInitials(user?.name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-4 text-center sm:text-left">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={isLoading}
                  className="flex items-center justify-center sm:justify-start w-full sm:w-auto min-h-[44px]"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                  Change Profile Picture
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">JPG, PNG or GIF (max 5MB)</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="text-sm min-h-[44px]"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  className="text-sm min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="font-medium text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <Badge variant={user?.role === "admin" ? "default" : "secondary"} className="text-xs">
                  {user?.role === "admin" ? "Admin" : "Volunteer"}
                </Badge>
              </div>
            </div>

            <Button 
              onClick={handleUpdateProfile} 
              disabled={isUpdating} 
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto min-h-[44px]"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Change Email */}
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Mail className="w-5 h-5" />
              <span>Change Email Address</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-6 pb-6">
            <div className="space-y-3">
              <Label htmlFor="newEmail" className="text-sm font-medium">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                value={formData.newEmail}
                onChange={(e) => handleInputChange("newEmail", e.target.value)}
                placeholder="Enter new email address"
                className="text-sm min-h-[44px]"
              />
            </div>
            <Button 
              onClick={handleChangeEmail} 
              disabled={isLoading} 
              variant="outline"
              className="w-full sm:w-auto min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Verification Email
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500">
              A verification email will be sent to your new email address. You'll need to confirm it to complete the
              change.
            </p>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Lock className="w-5 h-5" />
              <span>Change Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-6 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  placeholder="Enter new password"
                  className="text-sm min-h-[44px]"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirm new password"
                  className="text-sm min-h-[44px]"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                placeholder="Enter current password"
                className="text-sm min-h-[44px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button 
                onClick={handleChangePassword} 
                disabled={isLoading} 
                variant="outline"
                className="w-full sm:w-auto min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
              <Button 
                onClick={handleResetPassword} 
                disabled={isLoading} 
                variant="ghost"
                className="w-full sm:w-auto min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Use "Change Password" if you know your current password, or "Reset Password" to receive a reset link via email.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
