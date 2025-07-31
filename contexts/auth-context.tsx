"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
// Lazy import to avoid build-time initialization
let supabase: any = null
const getSupabase = () => {
  if (!supabase) {
    supabase = require("@/lib/supabase").supabase
  }
  return supabase
}
import { SupabaseService } from "@/lib/supabase-service"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * User profile interface extending Supabase User
 * Includes additional fields from the volunteers/admins tables
 */
interface UserProfile extends User {
  name?: string
  phone?: string
  role?: "volunteer" | "admin" | "super_admin"
  languages?: string[]
  active?: boolean
}

/**
 * Authentication context interface
 * Provides user state, loading state, and navigation history
 */
interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  navigationHistory: string[]
  pushToHistory: (page: string) => void
  goBack: () => string | null
  logout: () => Promise<void>
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

/**
 * Authentication context for managing user state across the application
 * Provides user authentication status, profile data, and navigation history
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================================================
// CONTEXT PROVIDER COMPONENT
// ============================================================================

/**
 * Authentication provider component
 * Manages user authentication state and provides context to child components
 * Handles automatic session restoration and user profile loading
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // User state - null when not authenticated, UserProfile when authenticated
  const [user, setUser] = useState<UserProfile | null>(null)
  
  // Loading state while determining authentication status
  const [isLoading, setIsLoading] = useState(true)
  
  // Navigation history for back button functionality
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])
  
  // Prevent rapid profile loading calls
  const [lastProfileLoad, setLastProfileLoad] = useState<number>(0)
  
  // Session timeout - auto logout after 8 hours of inactivity
  const SESSION_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours in milliseconds

  /**
   * Add a page to navigation history
   * Used for implementing back button functionality
   * @param page - Page identifier to add to history
   */
  const pushToHistory = (page: string) => {
    setNavigationHistory(prev => [...prev, page])
  }

  /**
   * Navigate back to previous page
   * Removes and returns the last page from navigation history
   * @returns Previous page identifier or null if no history
   */
  const goBack = (): string | null => {
    if (navigationHistory.length === 0) return null
    
    const newHistory = [...navigationHistory]
    const previousPage = newHistory.pop() || null
    setNavigationHistory(newHistory)
    return previousPage
  }

  /**
   * Sign out the current user
   * Clears user state and redirects to login
   * @returns Promise that resolves when logout is complete
   */
  const logout = async () => {
    try {
      await SupabaseService.signOut()
      setUser(null)
      setNavigationHistory([])
    } catch (error) {
      console.error("Logout error:", error)
      // Even if logout fails, clear local state
      setUser(null)
      setNavigationHistory([])
    }
  }

  /**
   * Load user profile data from database
   * Called after authentication to get complete user information
   * @param user - Supabase user object
   * @returns Promise that resolves when profile is loaded
   */
  const loadUserProfile = async (user: User) => {
    try {
      // Prevent rapid calls - only load profile once per 2 seconds
      const now = Date.now()
      if (now - lastProfileLoad < 2000) {
        console.log("Profile load throttled, skipping")
        return
      }
      setLastProfileLoad(now)
      
      console.log("Loading profile for user:", user.id)
      
      const profile = await SupabaseService.getCurrentUser()
      if (profile) {
        console.log("Profile loaded successfully:", profile.name)
        // Merge Supabase user data with profile data
        setUser({
          ...user,
          name: profile.name,
          phone: profile.phone,
          role: profile.role,
          languages: profile.languages,
          active: profile.active,
        })
      } else {
        // User exists in auth but no profile found
        console.warn("User authenticated but no profile found")
        setUser(user as UserProfile)
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      // Fallback to basic user data
      setUser(user as UserProfile)
    }
  }

  // ============================================================================
  // AUTHENTICATION STATE MANAGEMENT
  // ============================================================================

  /**
   * Initialize authentication state
   * Sets up Supabase auth listener and loads initial session
   */
  useEffect(() => {
    let mounted = true

    /**
     * Handle authentication state changes
     * Called when user signs in, signs out, or session changes
     * @param event - Supabase auth state change event
     */
    const handleAuthStateChange = async (event: string, session: any) => {
      if (!mounted) return

      console.log("Auth state change:", event, session?.user?.id)

      if (event === "SIGNED_IN" && session?.user) {
        // User has signed in - load their profile
        await loadUserProfile(session.user)
        setIsLoading(false)
      } else if (event === "SIGNED_OUT") {
        // User has signed out - clear state
        setUser(null)
        setNavigationHistory([])
        setIsLoading(false)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Session refreshed - only update if user actually changed
        if (!user || user.id !== session.user.id) {
          console.log("User changed, updating profile")
          await loadUserProfile(session.user)
        } else {
          console.log("User unchanged, skipping profile update")
        }
        setIsLoading(false)
      } else {
        // Handle other events
        setIsLoading(false)
      }
    }

    /**
     * Get initial session on app load
     * Checks if user is already authenticated when app starts
     */
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await getSupabase().auth.getSession()
        
        if (error) {
          console.error("Error getting initial session:", error)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          // User is already authenticated - load their profile
          await loadUserProfile(session.user)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        setIsLoading(false)
      }
    }

    // Set up auth state listener
            const { data: { subscription } } = getSupabase().auth.onAuthStateChange(handleAuthStateChange)

    // Get initial session
    getInitialSession()

    // Cleanup function
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, []) // Only run once on mount

  // Session timeout effect
  useEffect(() => {
    if (!user) return

    const checkSessionTimeout = () => {
      const lastActivity = localStorage.getItem('lastActivity')
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity)
        if (timeSinceLastActivity > SESSION_TIMEOUT) {
          console.log("Session expired, logging out")
          logout()
        }
      }
    }

    // Update last activity on user interaction
    const updateLastActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString())
    }

    // Check session timeout every minute
    const interval = setInterval(checkSessionTimeout, 60000)
    
    // Update activity on user interactions
    window.addEventListener('mousedown', updateLastActivity)
    window.addEventListener('keydown', updateLastActivity)
    window.addEventListener('touchstart', updateLastActivity)

    // Set initial activity
    updateLastActivity()

    return () => {
      clearInterval(interval)
      window.removeEventListener('mousedown', updateLastActivity)
      window.removeEventListener('keydown', updateLastActivity)
      window.removeEventListener('touchstart', updateLastActivity)
    }
  }, [user])

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  /**
   * Context value containing all authentication-related state and functions
   */
  const value: AuthContextType = {
    user,
    isLoading,
    navigationHistory,
    pushToHistory,
    goBack,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook to access authentication context
 * Provides type-safe access to user state and authentication functions
 * @returns AuthContextType with user state and authentication functions
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
}
