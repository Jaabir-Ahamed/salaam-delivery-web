import { supabase } from "./supabase"
import type { Senior, Volunteer, Delivery, SeniorAssignment, MonthlyStats } from "./supabase"

/**
 * Centralized service for all Supabase database operations
 * Provides a clean API for the frontend components to interact with the database
 * Includes error handling, data validation, and role-based access control
 */
export class SupabaseService {
  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Sign up a new user with email and password
   * @param email - User's email address
   * @param password - User's password (minimum 8 characters)
   * @param metadata - Additional user metadata (name, phone, role, etc.)
   * @returns Promise with user data or error
   */
  static async signUp(email: string, password: string, metadata: any) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) throw error

      // If signup successful, create volunteer profile
      if (data.user) {
        const volunteerData = {
          id: data.user.id,
          email: email,
          name: metadata.name,
          phone: metadata.phone,
          role: metadata.role || "volunteer",
          languages: metadata.languages || ["english"],
          active: true,
        }

        const { error: volunteerError } = await supabase
          .from("volunteers")
          .insert([volunteerData])

        if (volunteerError) {
          console.error("Error creating volunteer profile:", volunteerError)
          // Note: User account is created but volunteer profile failed
          // This should be handled by the calling component
        }
      }

      return { data, error: null }
    } catch (error: any) {
      console.error("Signup error:", error)
      return { data: null, error }
    }
  }

  /**
   * Sign in existing user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with user data or error
   */
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      console.error("Signin error:", error)
      return { data: null, error }
    }
  }

  /**
   * Sign out the current user
   * @returns Promise with success status or error
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Signout error:", error)
      return { success: false, error }
    }
  }

  /**
   * Reset password for a user via email
   * @param email - User's email address
   * @returns Promise with success status or error
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth-callback`,
      })

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Password reset error:", error)
      return { success: false, error }
    }
  }

  /**
   * Update password for the current user
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Promise with success status or error
   */
  static async updatePassword(currentPassword: string, newPassword: string) {
    try {
      // First, verify the current password by attempting to sign in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: currentPassword
      })

      if (signInError) {
        throw new Error("Current password is incorrect")
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      // Send email notification about password change
      const { error: emailError } = await supabase.auth.resetPasswordForEmail(
        user?.email || '',
        {
          redirectTo: `${window.location.origin}/auth-callback`,
        }
      )

      if (emailError) {
        console.warn("Failed to send password change notification email:", emailError)
      }

      return { success: true, error: null }
    } catch (error: any) {
      console.error("Password update error:", error)
      return { success: false, error }
    }
  }

  // ============================================================================
  // USER PROFILE METHODS
  // ============================================================================

  /**
   * Get the current authenticated user's profile
   * @returns Promise with user profile data or null
   */
  static async getCurrentUser() {
    try {
      console.log("SupabaseService.getCurrentUser called")
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.warn("No authenticated user found")
        return null
      }

      console.log("User authenticated, fetching profile for:", user.id)

      // Try to get admin profile first (since admin users should be in admins table)
      try {
        const { data: admin, error: adminError } = await supabase
          .from("admins")
          .select("*")
          .eq("id", user.id)
          .eq("active", true)
          .single()

        if (!adminError && admin) {
          console.log("Admin profile found")
          return {
            ...user,
            name: admin.name,
            phone: admin.phone,
            role: admin.role,
            active: admin.active,
            email: admin.email
          }
        }
      } catch (adminError) {
        console.warn("Error fetching admin profile:", adminError)
      }

      // Try to get volunteer profile if admin not found
      try {
        const { data: volunteer, error: volunteerError } = await supabase
          .from("volunteers")
          .select("*")
          .eq("id", user.id)
          .eq("active", true)
          .single()

        if (!volunteerError && volunteer) {
          console.log("Volunteer profile found")
          return {
            ...user,
            name: volunteer.name,
            phone: volunteer.phone,
            role: volunteer.role,
            languages: volunteer.languages,
            active: volunteer.active,
            email: volunteer.email
          }
        }
      } catch (volunteerError) {
        console.warn("Error fetching volunteer profile:", volunteerError)
      }

      // If neither profile found, return basic user info
      console.log("No profile found, returning basic user info")
      return {
        ...user,
        name: user.user_metadata?.name || user.email,
        role: "volunteer", // Default role
        active: true,
        email: user.email
      }
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  /**
   * Check if the current user has admin privileges
   * @returns Promise with boolean indicating admin status
   */
  static async isCurrentUserAdmin() {
    try {
      const user = await this.getCurrentUser()
      if (!user) return false
      
      // Check if user has admin role in either admins or volunteers table
      return user.role === "admin" || user.role === "super_admin"
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }

  /**
   * Update the current user's profile
   * @param updates - Object containing fields to update
   * @returns Promise with success status or error
   */
  static async updateCurrentUser(updates: Partial<Volunteer>) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error("No authenticated user found")
      }

      const { error } = await supabase
        .from("volunteers")
        .update(updates)
        .eq("id", user.id)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error updating user profile:", error)
      return { success: false, error }
    }
  }

  // ============================================================================
  // SENIOR MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get all seniors with optional filtering
   * @param filters - Optional filters for the query
   * @returns Promise with senior data array or error
   */
  static async getSeniors(filters?: { active?: boolean }) {
    try {
      let query = supabase.from("seniors").select("*").order("name")

      if (filters?.active !== undefined) {
        query = query.eq("active", filters.active)
      }

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error: any) {
      console.error("Error fetching seniors:", error)
      return { data: [], error }
    }
  }

  /**
   * Get a single senior by ID
   * @param id - Senior's unique identifier
   * @returns Promise with senior data or null
   */
  static async getSenior(id: string) {
    try {
      const { data, error } = await supabase
        .from("seniors")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching senior:", error)
      return null
    }
  }

  /**
   * Create a new senior profile
   * @param seniorData - Senior profile data
   * @returns Promise with created senior data or error
   */
  static async createSenior(seniorData: Omit<Senior, "id" | "created_at" | "updated_at">) {
    try {
      const { data, error } = await supabase
        .from("seniors")
        .insert([seniorData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error("Error creating senior:", error)
      return { data: null, error }
    }
  }

  /**
   * Update an existing senior profile
   * @param id - Senior's unique identifier
   * @param updates - Object containing fields to update
   * @returns Promise with success status or error
   */
  static async updateSenior(id: string, updates: Partial<Senior>) {
    try {
      const { error } = await supabase
        .from("seniors")
        .update(updates)
        .eq("id", id)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error updating senior:", error)
      return { success: false, error }
    }
  }

  /**
   * Deactivate a senior (soft delete)
   * @param id - Senior's unique identifier
   * @returns Promise with success status or error
   */
  static async deactivateSenior(id: string) {
    try {
      const { error } = await supabase
        .from("seniors")
        .update({ active: false })
        .eq("id", id)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error deactivating senior:", error)
      return { success: false, error }
    }
  }

  /**
   * Permanently delete a senior (hard delete)
   * @param id - Senior's unique identifier
   * @returns Promise with success status or error
   */
  static async deleteSenior(id: string) {
    try {
      const { error } = await supabase
        .from("seniors")
        .delete()
        .eq("id", id)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error deleting senior:", error)
      return { success: false, error }
    }
  }

  // ============================================================================
  // VOLUNTEER MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get all volunteers with optional filtering
   * @param filters - Optional filters for the query
   * @returns Promise with volunteer data array or error
   */
  static async getVolunteers(filters?: { active?: boolean }) {
    try {
      let query = supabase.from("volunteers").select("*").order("name")

      if (filters?.active !== undefined) {
        query = query.eq("active", filters.active)
      }

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error: any) {
      console.error("Error fetching volunteers:", error)
      return { data: [], error }
    }
  }

  /**
   * Create a new volunteer profile
   * @param volunteerData - Volunteer profile data
   * @returns Promise with created volunteer data or error
   */
  static async createVolunteer(volunteerData: Omit<Volunteer, "id" | "created_at" | "updated_at">) {
    try {
      const { data, error } = await supabase
        .from("volunteers")
        .insert([volunteerData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error("Error creating volunteer:", error)
      return { data: null, error }
    }
  }

  /**
   * Get a single volunteer by ID
   * @param id - Volunteer's unique identifier
   * @returns Promise with volunteer data or null
   */
  static async getVolunteer(id: string) {
    try {
      const { data, error } = await supabase
        .from("volunteers")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching volunteer:", error)
      return null
    }
  }

  /**
   * Update an existing volunteer profile
   * @param id - Volunteer's unique identifier
   * @param updates - Object containing fields to update
   * @returns Promise with success status or error
   */
  static async updateVolunteer(id: string, updates: Partial<Volunteer>) {
    try {
      const { error } = await supabase
        .from("volunteers")
        .update(updates)
        .eq("id", id)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error updating volunteer:", error)
      return { success: false, error }
    }
  }

  /**
   * Deactivate a volunteer (soft delete)
   * @param id - Volunteer's unique identifier
   * @returns Promise with success status or error
   */
  static async deactivateVolunteer(id: string) {
    try {
      const { error } = await supabase
        .from("volunteers")
        .update({ active: false })
        .eq("id", id)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error deactivating volunteer:", error)
      return { success: false, error }
    }
  }

  /**
   * Permanently delete a volunteer (hard delete)
   * @param id - Volunteer's unique identifier
   * @returns Promise with success status or error
   */
  static async deleteVolunteer(id: string) {
    try {
      const { error } = await supabase
        .from("volunteers")
        .delete()
        .eq("id", id)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error deleting volunteer:", error)
      return { success: false, error }
    }
  }

  // ============================================================================
  // DELIVERY MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get today's deliveries for a specific volunteer
   * @param volunteerId - Volunteer's unique identifier
   * @returns Promise with delivery data array or error
   */
  static async getTodaysDeliveries(volunteerId: string) {
    // Validate volunteerId to prevent 400 errors
    if (!volunteerId) {
      return { data: [], error: null }
    }

    try {
      // First check if the user exists as a volunteer
      const { data: volunteer, error: volunteerError } = await supabase
        .from("volunteers")
        .select("id")
        .eq("id", volunteerId)
        .single()

      if (volunteerError || !volunteer) {
        return { data: [], error: null }
      }

      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from("deliveries")
        .select(`
          *,
          seniors (
            id,
            name,
            address,
            phone,
            dietary_restrictions,
            accessibility_needs
          )
        `)
        .eq("volunteer_id", volunteerId)
        .eq("delivery_date", today)
        .order("created_at")

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error: any) {
      console.error("Error fetching today's deliveries:", error)
      return { data: [], error: error?.message || "Unknown error" }
    }
  }

  /**
   * Update delivery status and notes
   * @param deliveryId - Delivery's unique identifier
   * @param updates - Object containing status and notes to update
   * @returns Promise with success status or error
   */
  static async updateDelivery(deliveryId: string, updates: { status?: string; notes?: string }) {
    try {
      const { error } = await supabase
        .from("deliveries")
        .update(updates)
        .eq("id", deliveryId)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error updating delivery:", error)
      return { success: false, error }
    }
  }

  /**
   * Create a new delivery record
   * @param deliveryData - Delivery data to create
   * @returns Promise with created delivery data or error
   */
  static async createDelivery(deliveryData: {
    senior_id: string
    volunteer_id: string
    delivery_date: string
    status?: string
    notes?: string
  }) {
    try {
      const { data, error } = await supabase
        .from("deliveries")
        .insert({
          ...deliveryData,
          status: deliveryData.status || "pending",
          notes: deliveryData.notes || ""
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error("Error creating delivery:", error)
      return { data: null, error }
    }
  }

  /**
   * Get deliveries with optional filtering by volunteer and month
   * @param volunteerId - Optional volunteer ID filter
   * @param month - Optional month filter (YYYY-MM format)
   * @returns Promise with delivery data array or error
   */
  static async getDeliveries(volunteerId?: string, month?: string) {
    try {
      let query = supabase
        .from("deliveries")
        .select(`
          *,
          seniors (
            id,
            name,
            address,
            phone
          ),
          volunteers (
            id,
            name,
            email
          )
        `)
        .order("delivery_date", { ascending: false })

      if (volunteerId) {
        query = query.eq("volunteer_id", volunteerId)
      }

      if (month) {
        const startDate = `${month}-01`
        const [yearStr, monthStr] = month.split('-')
        const year = parseInt(yearStr)
        const monthNum = parseInt(monthStr)
        const lastDay = getLastDayOfMonth(year, monthNum) // Fixed date calculation
        const endDate = `${month}-${lastDay.toString().padStart(2, "0")}`
        query = query.gte("delivery_date", startDate).lte("delivery_date", endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error: any) {
      console.error("Error fetching deliveries:", error)
      return { data: [], error }
    }
  }

  // ============================================================================
  // SENIOR ASSIGNMENT METHODS
  // ============================================================================

  /**
   * Get unassigned seniors (not assigned to any volunteer)
   * @returns Promise with senior data array or error
   */
  static async getUnassignedSeniors() {
    try {
      console.log("getUnassignedSeniors: Starting to fetch data")
      
      // First, try to get all active seniors
      const { data: allSeniors, error: seniorsError } = await supabase
        .from("seniors")
        .select("*")
        .eq("active", true)
        .order("name")

      if (seniorsError) {
        console.error("Error fetching seniors:", seniorsError)
        return { data: [], error: seniorsError.message || "Failed to fetch seniors" }
      }

      console.log("getUnassignedSeniors: Found", allSeniors?.length || 0, "active seniors")

      // Then, try to get all active assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from("senior_assignments")
        .select("senior_id")
        .eq("status", "active")

      if (assignmentsError) {
        console.error("Error fetching assignments:", assignmentsError)
        // If we can't fetch assignments, return all seniors as unassigned
        console.log("getUnassignedSeniors: Returning all seniors as unassigned due to assignment fetch error")
        return { data: allSeniors || [], error: null }
      }

      console.log("getUnassignedSeniors: Found", assignments?.length || 0, "active assignments")

      // Filter out seniors who have active assignments
      const assignedSeniorIds = new Set(assignments?.map((a: any) => a.senior_id) || [])
      const unassignedSeniors = (allSeniors || []).filter((senior: any) => !assignedSeniorIds.has(senior.id))

      console.log("getUnassignedSeniors: Returning", unassignedSeniors.length, "unassigned seniors")
      return { data: unassignedSeniors, error: null }
    } catch (error: any) {
      console.error("Error fetching unassigned seniors:", error)
      return { data: [], error: error?.message || "Unknown error fetching unassigned seniors" }
    }
  }

  /**
   * Create a new senior assignment
   * @param assignmentData - Assignment data including senior_id, volunteer_id, etc.
   * @returns Promise with created assignment data or error
   */
  static async createSeniorAssignment(assignmentData: Omit<SeniorAssignment, "id" | "created_at" | "updated_at">) {
    try {
      // Get current admin user for assignment tracking
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error("User not authenticated")
      }

      const assignmentWithAdmin = {
        ...assignmentData,
        assigned_by: user.id
      }

      const { data, error } = await supabase
        .from("senior_assignments")
        .insert([assignmentWithAdmin])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error("Error creating senior assignment:", error)
      return { data: null, error }
    }
  }

  /**
   * Bulk assign multiple seniors to a volunteer
   * @param seniorIds - Array of senior IDs to assign
   * @param volunteerId - Volunteer ID to assign seniors to
   * @param assignmentDate - Date for the assignment
   * @returns Promise with success status or error
   */
  static async bulkAssignSeniors(seniorIds: string[], volunteerId: string, assignmentDate: string) {
    try {
      // Get current admin user for assignment tracking
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error("User not authenticated")
      }

      const assignments = seniorIds.map(seniorId => ({
        senior_id: seniorId,
        volunteer_id: volunteerId,
        assignment_date: assignmentDate,
        assigned_by: user.id,
        status: "active"
      }))

      const { error } = await supabase
        .from("senior_assignments")
        .insert(assignments)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error bulk assigning seniors:", error)
      return { success: false, error: error?.message || "Unknown error during bulk assignment" }
    }
  }

  /**
   * Update an existing senior assignment
   * @param assignmentId - Assignment's unique identifier
   * @param updates - Object containing fields to update
   * @returns Promise with success status or error
   */
  static async updateSeniorAssignment(assignmentId: string, updates: Partial<SeniorAssignment>) {
    try {
      // Get current admin user for assignment tracking
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase
        .from("senior_assignments")
        .update({ ...updates, assigned_by: user.id })
        .eq("id", assignmentId)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error updating senior assignment:", error)
      return { success: false, error }
    }
  }

  /**
   * Delete a senior assignment
   * @param assignmentId - Assignment's unique identifier
   * @returns Promise with success status or error
   */
  static async deleteSeniorAssignment(assignmentId: string) {
    try {
      // Get current admin user for assignment tracking
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase
        .from("senior_assignments")
        .delete()
        .eq("id", assignmentId)

      if (error) throw error
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error deleting senior assignment:", error)
      return { success: false, error }
    }
  }

  /**
   * Get all senior assignments with optional filtering
   * @param filters - Optional filters for the query
   * @returns Promise with assignment data array or error
   */
  static async getSeniorAssignments(filters?: { 
    volunteerId?: string; 
    seniorId?: string; 
    active?: boolean 
  }) {
    try {
      console.log("getSeniorAssignments: Starting with filters:", filters)
      
      let query = supabase
        .from("senior_assignments")
        .select(`
          *,
          seniors (
            id,
            name,
            address,
            phone,
            building,
            unit_apt
          ),
          volunteers (
            id,
            name,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (filters?.volunteerId) {
        query = query.eq("volunteer_id", filters.volunteerId)
      }

      if (filters?.seniorId) {
        query = query.eq("senior_id", filters.seniorId)
      }

      if (filters?.active !== undefined) {
        query = query.eq("status", filters.active ? "active" : "inactive")
      }

      const { data, error } = await query

      if (error) {
        console.error("getSeniorAssignments: Error with complex query:", error)
        
        // Fallback: simple query without joins, then hydrate client-side
        console.log("getSeniorAssignments: Trying fallback simple query...")
        const { data: simpleData, error: simpleError } = await supabase
          .from("senior_assignments")
          .select("*")
          .order("created_at", { ascending: false })

        if (simpleError) {
          console.error("getSeniorAssignments: Fallback query also failed:", simpleError)
          throw simpleError
        }

        // Hydrate related data client-side to avoid RLS join recursion
        const seniorIds = Array.from(new Set((simpleData || []).map((a: any) => a.senior_id).filter(Boolean)))
        const volunteerIds = Array.from(new Set((simpleData || []).map((a: any) => a.volunteer_id).filter(Boolean)))

        let seniorsById: Record<string, any> = {}
        let volunteersById: Record<string, any> = {}

        if (seniorIds.length > 0) {
          const { data: seniorsRows } = await supabase
            .from("seniors")
            .select("id,name,address,building,unit_apt,phone")
            .in("id", seniorIds)
          ;
          (seniorsRows || []).forEach((s: any) => { seniorsById[s.id] = s })
        }

        if (volunteerIds.length > 0) {
          const { data: volunteerRows } = await supabase
            .from("volunteers")
            .select("id,name,email")
            .in("id", volunteerIds)
          ;
          (volunteerRows || []).forEach((v: any) => { volunteersById[v.id] = v })
        }

        const hydrated = (simpleData || []).map((a: any) => ({
          ...a,
          seniors: seniorsById[a.senior_id] || null,
          volunteers: volunteersById[a.volunteer_id] || null,
        }))

        console.log("getSeniorAssignments: Fallback hydrated result count:", hydrated.length)
        return { data: hydrated, error: null }
      }

      console.log("getSeniorAssignments: Complex query successful, returning", data?.length || 0, "assignments")
      return { data: data || [], error: null }
    } catch (error: any) {
      console.error("Error fetching senior assignments:", error)
      return { data: [], error }
    }
  }

  // ============================================================================
  // ANALYTICS AND REPORTING METHODS
  // ============================================================================

  /**
   * Get monthly statistics for a specific year and month
   * @param year - Year for statistics (e.g., 2024)
   * @param month - Month for statistics (1-12)
   * @returns Promise with monthly statistics or error
   */
  static async getMonthlyStats(year: number, month: number): Promise<MonthlyStats> {
    try {
      const monthStr = `${year}-${month.toString().padStart(2, "0")}`
      const lastDay = getLastDayOfMonth(year, month) // Fixed date calculation
      const endDate = `${monthStr}-${lastDay.toString().padStart(2, "0")}`
      const startDate = `${monthStr}-01`

      // Get current month statistics
      const { data: currentMonthDeliveries, error: currentError } = await supabase
        .from("deliveries")
        .select("*")
        .gte("delivery_date", startDate)
        .lte("delivery_date", endDate)

      if (currentError) {
        console.warn("Error fetching current month deliveries:", currentError)
      }

      const { data: currentMonthSeniors, error: seniorsError } = await supabase
        .from("seniors")
        .select("id")
        .eq("active", true)

      if (seniorsError) {
        console.warn("Error fetching current month seniors:", seniorsError)
      }

      // Calculate current month stats
      const totalDeliveries = currentMonthDeliveries?.length || 0
      const completedDeliveries = currentMonthDeliveries?.filter((d: any) => 
        d.status === "delivered" || d.status === "family_confirmed"
      ).length || 0
      const seniorsServed = currentMonthSeniors?.length || 0

      // Get trend data for the last 4 months
      const trendData = []
      for (let i = 3; i >= 0; i--) {
        const trendMonth = new Date(year, month - 1 - i, 1)
        const trendYear = trendMonth.getFullYear()
        const trendMonthNum = trendMonth.getMonth() + 1
        const trendMonthStr = `${trendYear}-${trendMonthNum.toString().padStart(2, "0")}`
        const trendLastDay = getLastDayOfMonth(trendYear, trendMonthNum) // Fixed date calculation
        const trendStartDate = `${trendMonthStr}-01`
        const trendEndDate = `${trendMonthStr}-${trendLastDay.toString().padStart(2, "0")}`

        const { data: trendDeliveries, error: trendError } = await supabase
          .from("deliveries")
          .select("*")
          .gte("delivery_date", trendStartDate)
          .lte("delivery_date", trendEndDate)

        if (trendError) {
          console.warn(`Error fetching trend data for ${trendMonthStr}:`, trendError)
        }

        const completed = trendDeliveries?.filter((d: any) => 
          d.status === "delivered" || d.status === "family_confirmed"
        ).length || 0

        trendData.push({
          month: trendMonthStr,
          completionRate: completed > 0 ? Math.round((completed / (trendDeliveries?.length || 1)) * 100) : 0
        })
      }

      return {
        totalDeliveries,
        deliveriesCompleted: completedDeliveries,
        seniorsServed,
        successRate: totalDeliveries > 0 ? Math.round((completedDeliveries / totalDeliveries) * 100) : 0,
        activeVolunteers: 0, // TODO: Calculate this
        newVolunteers: 0, // TODO: Calculate this
        monthlyTrends: trendData
      }
    } catch (error) {
      console.error("Error calculating monthly stats:", error)
      return {
        totalDeliveries: 0,
        deliveriesCompleted: 0,
        seniorsServed: 0,
        successRate: 0,
        activeVolunteers: 0,
        newVolunteers: 0,
        monthlyTrends: []
      }
    }
  }

  /**
   * Get accessibility statistics for seniors
   * @returns Promise with accessibility data or error
   */
  static async getAccessibilityStats() {
    try {
      const { data, error } = await supabase
        .from("seniors")
        .select("dietary_restrictions, accessibility_needs")
        .eq("active", true)

      if (error) throw error

      const stats = {
        dietaryRestrictions: 0,
        accessibilityNeeds: 0,
        totalSeniors: data?.length || 0
      }

      data?.forEach((senior: any) => {
        if (senior.dietary_restrictions) stats.dietaryRestrictions++
        if (senior.accessibility_needs) stats.accessibilityNeeds++
      })

      return { data: stats, error: null }
    } catch (error: any) {
      console.error("Error fetching accessibility stats:", error)
      return { 
        data: { dietaryRestrictions: 0, accessibilityNeeds: 0, totalSeniors: 0 }, 
        error 
      }
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate the last day of a given month
 * @param year - Year (e.g., 2024)
 * @param month - Month (1-12)
 * @returns Number of days in the month
 */
function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}


