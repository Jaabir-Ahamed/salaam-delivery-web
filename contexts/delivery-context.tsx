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
  updateDeliveryStatus: (seniorId: string, status: string) => void
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
        console.log("Loading assigned seniors for volunteer:", user.id)
        const assignmentsResult = await SupabaseService.getSeniorAssignments()
        
        if (assignmentsResult.data) {
          // Filter for active assignments for this volunteer (same as dashboard)
          const volunteerAssignments = assignmentsResult.data.filter((assignment: any) => 
            assignment.volunteer_id === user.id && assignment.status === "active"
          )
          
          console.log("Volunteer assignments found:", volunteerAssignments.length)
          
          // Extract senior IDs from assignments
          const seniorIds = volunteerAssignments.map((assignment: any) => assignment.senior_id)
          
          if (seniorIds.length > 0) {
            // Get senior details for assigned seniors
            const seniorsResult = await SupabaseService.getSeniors({ active: true })
            if (seniorsResult.data) {
              seniorsData = seniorsResult.data.filter((senior: any) => 
                seniorIds.includes(senior.id)
              )
              console.log("Assigned seniors found:", seniorsData.length)
            }
          } else {
            seniorsData = []
            console.log("No assigned seniors found")
          }
        }
        seniorsError = assignmentsResult.error
      }

      if (seniorsError) {
        console.error("Error loading seniors:", seniorsError)
        setSeniors([])
      } else {
        setSeniors(seniorsData || [])
      }

      // Load all deliveries for current volunteer (not just today's)
      let deliveriesData = null
      let deliveriesError = null
      if (user.id && !isAdmin) { // Added !isAdmin check
        const result = await SupabaseService.getDeliveries()
        if (result.data) {
          // Filter deliveries for this volunteer only
          deliveriesData = result.data.filter((delivery: any) => delivery.volunteer_id === user.id)
        }
        deliveriesError = result.error
      } else if (user.id && isAdmin) {
        // For admins, we might want to show all deliveries or just set empty array
        deliveriesData = []
      }

      if (deliveriesError) {
        console.error("Error loading deliveries:", deliveriesError)
        setDeliveries([])
      } else {
        setDeliveries(deliveriesData || [])
      }

      // Update delivery status based on loaded deliveries
      const newDeliveryStatus: Record<string, DeliveryStatus> = {}
      
      // Only process deliveries for seniors that are actually assigned to this volunteer
      const assignedSeniorIds = seniorsData?.map((senior: any) => senior.id) || []
      
      if (deliveriesData) {
        console.log("Processing deliveries:", deliveriesData.length)
        console.log("Assigned senior IDs:", assignedSeniorIds)
        
        deliveriesData.forEach((delivery: any) => {
          // Only count deliveries for seniors that are assigned to this volunteer
          if (delivery.senior_id && assignedSeniorIds.includes(delivery.senior_id)) {
            newDeliveryStatus[delivery.senior_id] = {
              isDelivered: delivery.status === "delivered" || delivery.status === "family_confirmed",
              status: delivery.status || "pending",
              notes: delivery.notes
            }
          }
        })
      }
      
      // Initialize delivery status for assigned seniors without delivery records
      seniorsData?.forEach((senior: any) => {
        if (!newDeliveryStatus[senior.id]) {
          newDeliveryStatus[senior.id] = {
            isDelivered: false,
            status: "pending",
            notes: ""
          }
        }
      })
      
      const completedCount = Object.values(newDeliveryStatus).filter(status => status.isDelivered).length
      const totalCount = seniorsData?.length || 0
      
      console.log("Delivery Context Debug:", {
        seniorsCount: seniorsData?.length || 0,
        deliveriesCount: deliveriesData?.length || 0,
        assignedSeniorIds,
        deliveryStatusCount: Object.keys(newDeliveryStatus).length,
        completedCount,
        totalCount,
        progressPercentage: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
        seniors: seniorsData?.map((s: any) => ({ id: s.id, name: s.name })) || [],
        deliveryStatus: Object.entries(newDeliveryStatus).map(([id, status]) => ({ id, ...status }))
      })
      
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

  /**
   * Update delivery status locally without triggering full data reload
   * @param seniorId - Senior's unique identifier
   * @param status - New delivery status
   */
  const updateDeliveryStatus = (seniorId: string, status: string) => {
    setDeliveryStatus(prev => ({
      ...prev,
      [seniorId]: {
        ...prev[seniorId],
        isDelivered: status === "delivered" || status === "family_confirmed",
        status: status
      }
    }))
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
    updateDeliveryStatus,
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
