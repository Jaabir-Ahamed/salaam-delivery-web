"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Users, 
  UserPlus, 
  FileText, 
  BarChart3, 
  Download, 
  Upload,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { SupabaseService } from "@/lib/supabase-service"
import { Senior, Volunteer, Delivery } from "@/lib/supabase"
import { SeniorManagement } from "./senior-management"
import { VolunteerManagement } from "./volunteer-management"
import { ReportsGeneration } from "./reports-generation"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { CSVImport } from "./csv-import"

interface AdminDashboardProps {
  user: any
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalSeniors: 0,
    activeVolunteers: 0,
    monthlyDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    successRate: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load statistics
      const seniorsResult = await SupabaseService.getSeniors({ active: false })
      const volunteersResult = await SupabaseService.getVolunteers()
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      const deliveriesResult = await SupabaseService.getDeliveries(undefined, currentMonth)
      
      const monthlyDeliveries = deliveriesResult.data?.filter((d: any) => 
        d.delivery_date.startsWith(currentMonth)
      ) || []
      
      const completed = monthlyDeliveries.filter((d: any) => d.status === 'delivered').length
      const pending = monthlyDeliveries.filter((d: any) => d.status === 'pending').length
      const successRate = monthlyDeliveries.length > 0 ? 
        Math.round((completed / monthlyDeliveries.length) * 100) : 0

      setStats({
        totalSeniors: seniorsResult.data?.length || 0,
        activeVolunteers: volunteersResult.data?.filter((v: any) => v.active && v.role === "volunteer").length || 0,
        monthlyDeliveries: monthlyDeliveries.length,
        pendingDeliveries: pending,
        completedDeliveries: completed,
        successRate
      })

      // Load recent activity
      const recentDeliveries = deliveriesResult.data?.slice(0, 5) || []
      setRecentActivity(recentDeliveries)

    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'missed':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="default" className="bg-green-100 text-green-800">Delivered</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'missed':
        return <Badge variant="destructive">Missed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-green-800">
                Welcome back, {user?.name || 'Admin'}!
              </CardTitle>
              <CardDescription className="text-green-600">
                Salaam Food Pantry Admin Dashboard
              </CardDescription>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Last login: {user?.admin?.last_login ? 
                new Date(user.admin.last_login).toLocaleDateString() : 'N/A'}</p>
              <p>Role: {user?.admin?.role || user?.role}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Seniors</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSeniors}</div>
            <p className="text-xs text-muted-foreground">
              Active seniors in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeVolunteers}</div>
            <p className="text-xs text-muted-foreground">
              Volunteers available for deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Deliveries</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedDeliveries} completed, {stats.pendingDeliveries} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Successful deliveries this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="seniors">Seniors</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest deliveries and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((delivery: any) => (
                      <div key={delivery.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(delivery.status)}
                          <div>
                            <p className="font-medium">{delivery.senior?.name || 'Unknown Senior'}</p>
                            <p className="text-sm text-gray-600">
                              {delivery.volunteer?.name || 'Unassigned'} • {delivery.delivery_date}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common admin tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab("seniors")}
                  >
                    <UserPlus className="h-6 w-6" />
                    <span className="text-sm">Add Senior</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab("volunteers")}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Add Volunteer</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab("reports")}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Generate Report</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab("import")}
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Import CSV</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seniors">
          <SeniorManagement onDataChange={loadDashboardData} />
        </TabsContent>

        <TabsContent value="volunteers">
          <VolunteerManagement onDataChange={loadDashboardData} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsGeneration />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="import">
          <CSVImport onImportComplete={loadDashboardData} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 