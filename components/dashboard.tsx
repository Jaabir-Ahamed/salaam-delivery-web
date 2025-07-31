"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { SupabaseService } from "@/lib/supabase-service"
import { NavigationBar } from "@/components/navigation-bar"
import {
  Truck,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  MapPin,
  Heart,
  LogOut,
  UserPlus,
  Settings,
  User,
  Loader2,
} from "lucide-react"

interface DashboardProps {
  onNavigate: (page: string) => void
}

interface DashboardStats {
  todayCompleted: number
  todayTotal: number
  monthSeniorsServed: number
  monthCompletedDeliveries: number
  monthRemainingDeliveries: number
  successRate: number
  isLoading: boolean
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, logout, pushToHistory } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    todayCompleted: 0,
    todayTotal: 0,
    monthSeniorsServed: 0,
    monthCompletedDeliveries: 0,
    monthRemainingDeliveries: 0,
    successRate: 0,
    isLoading: true,
  })

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setStats(prev => ({ ...prev, isLoading: true }))

      // Get current month and year
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      // Load today's deliveries for volunteers only
      let todayCompleted = 0
      let todayTotal = 0

      if (user?.id && user?.role === "volunteer") {
        console.log("Loading today's deliveries for volunteer:", user.id)
        const { data: todayDeliveries, error } = await SupabaseService.getTodaysDeliveries(user.id)
        if (!error && todayDeliveries) {
          todayTotal = todayDeliveries.length
          todayCompleted = todayDeliveries.filter((d: any) => 
            d.status === "delivered" || d.status === "family_confirmed"
          ).length
        } else if (error) {
          console.warn("Error loading today's deliveries:", error)
        }
      } else {
        console.log("Skipping today's deliveries for user role:", user?.role)
      }

      // Load monthly statistics
      const monthlyStats = await SupabaseService.getMonthlyStats(now.getFullYear(), now.getMonth() + 1)
      
      // Calculate success rate
      const successRate = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0

      setStats({
        todayCompleted,
        todayTotal,
        monthSeniorsServed: monthlyStats.seniorsServed,
        monthCompletedDeliveries: monthlyStats.deliveriesCompleted,
        monthRemainingDeliveries: monthlyStats.totalDeliveries - monthlyStats.deliveriesCompleted,
        successRate,
        isLoading: false,
      })
    } catch (error) {
      console.error("Error loading dashboard stats:", error)
      setStats(prev => ({ ...prev, isLoading: false }))
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const profilePictureUrl = null // Profile pictures not implemented yet

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Navigation Bar */}
      <NavigationBar 
        title="Dashboard" 
        showLogout={true}
        className="bg-white"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Welcome Back, {user?.name}!</h2>
              <p className="text-sm sm:text-base text-gray-600">Ready to bring joy to our senior community today</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardStats}
              disabled={stats.isLoading}
              className="flex items-center space-x-2 w-full sm:w-auto"
            >
              {stats.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4" />
              )}
              <span>Refresh Stats</span>
            </Button>
          </div>
        </div>

        {/* Today's Progress */}
        <Card className="mb-8 sm:mb-10">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Today's Delivery Progress</span>
            </CardTitle>
            <CardDescription className="text-sm">
              {stats.isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                `${stats.todayCompleted} of ${stats.todayTotal} deliveries completed`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {stats.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{stats.successRate}%</span>
                </div>
                <Progress value={stats.successRate} className="h-3" />
                <p className="text-xs text-gray-500">
                  {stats.todayCompleted} deliveries completed, {stats.todayTotal - stats.todayCompleted} remaining
                </p>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
            pushToHistory("deliveries")
            onNavigate("deliveries")
          }}>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center space-x-4 sm:space-x-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">Start Delivery</h3>
                  <p className="text-sm text-gray-600">Begin today's route</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
            pushToHistory("seniors")
            onNavigate("seniors")
          }}>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center space-x-4 sm:space-x-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">View Seniors</h3>
                  <p className="text-sm text-gray-600">Senior information</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
            pushToHistory("map")
            onNavigate("map")
          }}>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center space-x-4 sm:space-x-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">Route Map</h3>
                  <p className="text-sm text-gray-600">View delivery route</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
            pushToHistory("profile")
            onNavigate("profile")
          }}>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center space-x-4 sm:space-x-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">My Profile</h3>
                  <p className="text-sm text-gray-600">Account settings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin-only sections */}
          {user?.role === "admin" && (
            <>
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  pushToHistory("manage-seniors")
                  onNavigate("manage-seniors")
                }}
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center space-x-4 sm:space-x-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">Manage Seniors</h3>
                      <p className="text-sm text-gray-600">Add, edit, import seniors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Manage Volunteers Card */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onNavigate("manage-volunteers")}
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center space-x-4 sm:space-x-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">Manage Volunteers</h3>
                      <p className="text-sm text-gray-600">Add, edit, manage volunteers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Senior Assignments Card */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onNavigate("senior-assignments")}
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center space-x-4 sm:space-x-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">Senior Assignments</h3>
                      <p className="text-sm text-gray-600">Assign seniors to volunteers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("reports")}>
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center space-x-4 sm:space-x-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">Reports</h3>
                      <p className="text-sm text-gray-600">View analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onNavigate("add-senior")}
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center space-x-4 sm:space-x-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">Add Senior</h3>
                      <p className="text-sm text-gray-600">Register new senior</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-xs sm:text-sm text-gray-600">This Month</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.monthSeniorsServed}</p>
              <p className="text-xs text-gray-500">Seniors Served</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs sm:text-sm text-gray-600">Completed</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{stats.monthCompletedDeliveries}</p>
              <p className="text-xs text-gray-500">Deliveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Truck className="w-4 h-4 text-orange-500" />
                <span className="text-xs sm:text-sm text-gray-600">Remaining</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">{stats.monthRemainingDeliveries}</p>
              <p className="text-xs text-gray-500">To Deliver</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-3">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-xs sm:text-sm text-gray-600">Success Rate</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{stats.successRate}%</p>
              <p className="text-xs text-gray-500">Completion</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
