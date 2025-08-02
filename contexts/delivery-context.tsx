"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAuth } from "./auth-context"
import { SupabaseService } from "@/lib/supabase-service"
import type { Senior, Delivery } from "@/lib/supabase"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Delivery status interface for tracking delivery state
 * Includes delivery status and any notes
 */
interface DeliveryStatus {
  isDelivered: boolean
  status: string
  notes?: string
}

/**
 * Delivery context interface
 * Provides senior data, delivery status, and loading states
 */
interface DeliveryContextType {
  seniors: Senior[]
  deliveries: Delivery[]
  isLoading: boolean
  deliveryStatus: Record<string, DeliveryStatus>
  getDeliveryStatus: (seniorId: string) => DeliveryStatus
  refreshData: () => Promise<void>
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

/**
 * Delivery context for managing senior and delivery data
 * Provides real-time data synchronization with Supabase
 */
const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined)

// ============================================================================
// CONTEXT PROVIDER COMPONENT
// ============================================================================

/**
 * Delivery provider component
 * Manages senior and delivery data state across the application
 * Handles data loading, real-time updates, and delivery status tracking
 */
export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  
  // State for senior and delivery data
  const [seniors, setSeniors] = useState<Senior[]>([])
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Delivery status tracking for each senior
  const [deliveryStatus, setDeliveryStatus] = useState<Record<string, DeliveryStatus>>({})

  /**
   * Get delivery status for a specific senior
   * @param seniorId - Senior's unique identifier
   * @returns DeliveryStatus object with delivery information
   */
  const getDeliveryStatus = (seniorId: string): DeliveryStatus => {
    return deliveryStatus[seniorId] || {
      isDelivered: false,
      status: "pending"
    }
  }

  /**
   * Load seniors and delivery data for the current user
   * Fetches data based on user role and permissions
   */
  const loadSeniorsAndDeliveries = useCallback(async () => {
    let timeoutId: NodeJS.Timeout | null = null
    
    try {
      setIsLoading(true)
      
      // Add timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        console.warn("Loading timeout - forcing completion")
        setIsLoading(false)
      }, 10000) // 10 second timeout
      
      // Get current user from auth context instead of service
      if (!user?.id) {
        console.error("No current user found")
        setSeniors([])
        if (timeoutId) clearTimeout(timeoutId)
        setIsLoading(false)
        return
      }

      // Check if user is admin or volunteer
      const isAdmin = await SupabaseService.isCurrentUserAdmin()
      
      // Load seniors based on user role
      let seniorsData = null
      let seniorsError = null
      
      if (isAdmin) {
        // Admins can see all active seniors
        const result = await SupabaseService.getSeniors({ active: true })
        seniorsData = result.data
        seniorsError = result.error
      } else {
              // Volunteers see only their assigned seniors
      console.log("Loading assignments for volunteer:", user.id)
      const assignmentsResult = await SupabaseService.getSeniorAssignments({ 
        volunteerId: user.id, 
        active: true 
      })
      
      console.log("Assignments result:", assignmentsResult)
      
      if (assignmentsResult.data) {
        // Extract senior IDs from assignments
        const seniorIds = assignmentsResult.data.map((assignment: any) => assignment.senior_id)
        console.log("Senior IDs from assignments:", seniorIds)
        
        if (seniorIds.length > 0) {
          // Get senior details for assigned seniors
          const seniorsResult = await SupabaseService.getSeniors({ active: true })
          console.log("All seniors result:", seniorsResult)
          if (seniorsResult.data) {
            seniorsData = seniorsResult.data.filter((senior: any) => 
              seniorIds.includes(senior.id)
            )
            console.log("Filtered seniors for volunteer:", seniorsData)
          }
        } else {
          seniorsData = []
          console.log("No assignments found for volunteer")
        }
      } else {
        seniorsData = []
        console.log("No assignments data for volunteer")
      }
      seniorsError = assignmentsResult.error
      }

      if (seniorsError) {
        console.error("Error loading seniors:", seniorsError)
        setSeniors([])
      } else {
        setSeniors(seniorsData || [])
      }

      // Load today's deliveries for current volunteer (only if user has a volunteer ID and is not admin)
      let deliveriesData = null
      let deliveriesError = null
      if (user.id && !isAdmin) { // Added !isAdmin check
        console.log("Loading today's deliveries for volunteer:", user.id)
        const result = await SupabaseService.getTodaysDeliveries(user.id)
        console.log("Today's deliveries result:", result)
        deliveriesData = result.data
        deliveriesError = result.error
      } else if (user.id && isAdmin) {
        // For admins, we might want to show all deliveries or just set empty array
        deliveriesData = []
        console.log("Admin user - no deliveries loaded")
      }

      if (deliveriesError) {
        console.error("Error loading deliveries:", deliveriesError)
        setDeliveries([])
      } else {
        setDeliveries(deliveriesData || [])
      }

      // Update delivery status based on loaded deliveries
      const newDeliveryStatus: Record<string, DeliveryStatus> = {}
      if (deliveriesData) {
        deliveriesData.forEach((delivery: any) => {
          if (delivery.senior_id) {
            newDeliveryStatus[delivery.senior_id] = {
              isDelivered: delivery.status === "delivered" || delivery.status === "family_confirmed",
              status: delivery.status || "pending",
              notes: delivery.notes
            }
          }
        })
      }
      
      // Initialize delivery status for seniors without delivery records
      seniorsData?.forEach((senior: any) => {
        if (!newDeliveryStatus[senior.id]) {
          newDeliveryStatus[senior.id] = {
            isDelivered: false,
            status: "pending",
            notes: ""
          }
        }
      })
      
      console.log("Delivery status updated:", newDeliveryStatus)
      setDeliveryStatus(newDeliveryStatus)

    } catch (error) {
      console.error("Error in loadSeniorsAndDeliveries:", error)
      setSeniors([])
      setDeliveries([])
      setDeliveryStatus({})
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      setIsLoading(false)
    }
  }, [user?.id]) // Add dependency array to prevent infinite re-renders

  /**
   * Refresh all delivery and senior data
   * Called when data needs to be reloaded (e.g., after status updates)
   */
  const refreshData = async () => {
    await loadSeniorsAndDeliveries()
  }

  // ============================================================================
  // DATA LOADING EFFECTS
  // ============================================================================

  /**
   * Load data when authentication is complete and user is available
   * Only loads data for volunteers, admins see all data through their own components
   */
  useEffect(() => {
    // Only load data when auth is complete and user is available
    if (!authLoading && user && user.id) { // Added user.id check
      loadSeniorsAndDeliveries()
    } else if (!authLoading && !user) {
      // User is not authenticated, set loading to false
      setIsLoading(false)
      setSeniors([])
    }
  }, [user, authLoading, loadSeniorsAndDeliveries])

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  /**
   * Context value containing all delivery-related state and functions
   */
  const value: DeliveryContextType = {
    seniors,
    deliveries,
    isLoading,
    deliveryStatus,
    getDeliveryStatus,
    refreshData,
  }

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  )
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook to access delivery context
 * Provides type-safe access to senior and delivery data
 * @returns DeliveryContextType with senior data and delivery status
 * @throws Error if used outside of DeliveryProvider
 */
export function useDelivery(): DeliveryContextType {
  const context = useContext(DeliveryContext)
  
  if (context === undefined) {
    throw new Error("useDelivery must be used within a DeliveryProvider")
  }
  
  return context
}
