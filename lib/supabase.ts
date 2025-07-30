import { createClient } from "@supabase/supabase-js"

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Helper function to get redirect URL
const getRedirectUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: use current domain
    return window.location.origin
  }

  // Server-side fallback
  return process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SITE_URL || "https://your-production-domain.com"
    : "http://localhost:3000"
}

// Create Supabase client only if environment variables are available
export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time or when env vars are missing, return a mock client
    if (typeof window === "undefined") {
      // Server-side during build
      return {
        auth: {
          signUp: async () => ({ data: null, error: null }),
          signInWithPassword: async () => ({ data: null, error: null }),
          signOut: async () => ({ error: null }),
          resetPasswordForEmail: async () => ({ error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
        },
        from: () => ({
          select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
          insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
          update: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
          delete: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        }),
      } as any
    }
    
    // Client-side when env vars are missing
    throw new Error(
      "Missing Supabase configuration. Please check your environment variables:\n" +
        "- NEXT_PUBLIC_SUPABASE_URL\n" +
        "- NEXT_PUBLIC_SUPABASE_ANON_KEY",
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'salaam-food-pantry-auth',
    },
  })
})()

// Database types with accessibility features
export interface Senior {
  id: string
  name: string
  age: number | null
  household_type: "single" | "family"
  family_adults: number
  family_children: number
  race_ethnicity: string | null
  health_conditions: string | null
  address: string
  building: string | null
  unit_apt: string | null
  zip_code: string | null
  dietary_restrictions: string | null
  phone: string | null
  emergency_contact: string | null
  has_smartphone: boolean
  preferred_language: string
  needs_translation: boolean
  delivery_method: "doorstep" | "phone_confirmed" | "family_member"
  special_instructions: string | null
  created_at: string
  updated_at: string
  active: boolean
}

export interface Volunteer {
  id: string
  email: string
  name: string
  phone: string | null
  address: string | null
  role: "volunteer" | "admin"
  speaks_languages: string[]
  languages: string[]
  availability: string[]
  vehicle_type: "car" | "truck" | "van" | "none"
  vehicle_capacity: number
  experience_level: "beginner" | "intermediate" | "experienced"
  special_skills: string | null
  emergency_contact: string | null
  profile_picture: string | null
  notes: string | null
  created_at: string
  updated_at: string
  active: boolean
}

export interface Admin {
  id: string
  email: string
  name: string
  role: "admin" | "super_admin"
  active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface Delivery {
  id: string
  senior_id: string
  volunteer_id: string
  delivery_date: string
  status: "pending" | "delivered" | "missed" | "no_contact" | "family_confirmed"
  delivery_method: "doorstep" | "phone_confirmed" | "family_member" | null
  notes: string | null
  language_barrier_encountered: boolean
  translation_needed: boolean
  created_at: string
  completed_at: string | null
  senior?: Senior
  volunteer?: Volunteer
}

export interface SeniorAssignment {
  id: string
  senior_id: string
  volunteer_id: string
  assigned_by: string | null
  assignment_date: string
  status: "active" | "inactive" | "completed"
  notes: string | null
  created_at: string
  updated_at: string
  senior?: Senior
  volunteer?: Volunteer
  admin?: Admin
}

export interface SeniorAssignmentView {
  id: string
  senior_id: string
  volunteer_id: string
  assigned_by: string | null
  assignment_date: string
  status: "active" | "inactive" | "completed"
  notes: string | null
  created_at: string
  updated_at: string
  senior_name: string
  senior_address: string
  senior_building: string | null
  senior_unit: string | null
  volunteer_name: string
  volunteer_email: string
  assigned_by_name: string
}

// Analytics types with accessibility metrics
export interface AccessibilityStats {
  totalSeniors: number
  seniorsNeedingTranslation: number
  seniorsWithSmartphones: number
  seniorsWithoutSmartphones: number
  languageBreakdown: Record<string, number>
  deliveryMethodBreakdown: Record<string, number>
  volunteerLanguages: Record<string, number>
}

export interface MonthlyStats {
  seniorsServed: number
  deliveriesCompleted: number
  totalDeliveries: number
  successRate: number
  activeVolunteers: number
  newVolunteers: number
  monthlyTrends: { month: string; completionRate: number }[]
  accessibilityStats?: AccessibilityStats
}

// Export the redirect URL helper
export { getRedirectUrl }
