"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Globe,
  Smartphone,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { SupabaseService } from "@/lib/supabase-service"

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("month")
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    // Only load analytics if we have a valid time range
    if (timeRange) {
      loadAnalytics()
    }
  }, [timeRange])

  const loadAnalytics = async () => {
    setIsLoading(true)
    setError("")

    try {
      const currentDate = new Date()
      let year = currentDate.getFullYear()
      let month = currentDate.getMonth() + 1

      // Adjust for different time ranges
      if (timeRange === "quarter") {
        // Get current quarter
        const quarter = Math.floor(month / 3) + 1
        month = quarter * 3
      } else if (timeRange === "year") {
        month = 12
      }

      const [monthlyStats, accessibilityStats, deliveriesResult] = await Promise.all([
        SupabaseService.getMonthlyStats(year, month),
        SupabaseService.getAccessibilityStats(),
        SupabaseService.getDeliveries(undefined, `${year}-${month.toString().padStart(2, "0")}`)
      ])

      setAnalyticsData({
        monthly: monthlyStats,
        accessibility: accessibilityStats,
        deliveries: deliveriesResult.data || []
      })
    } catch (error) {
      setError("Error loading analytics: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
    return <TrendingUp className="w-4 h-4 text-gray-600" />
  }

  const getTrendText = (current: number, previous: number) => {
    if (previous === 0) return "New"
    const change = ((current - previous) / previous) * 100
    return `${change > 0 ? '+' : ''}${Math.round(change)}%`
  }

  const getStatusBreakdown = () => {
    if (!analyticsData?.deliveries) return {}
    
    const breakdown = analyticsData.deliveries.reduce((acc: any, delivery: any) => {
      acc[delivery.status] = (acc[delivery.status] || 0) + 1
      return acc
    }, {})

    return breakdown
  }

  const getDeliveryMethodBreakdown = () => {
    if (!analyticsData?.deliveries) return {}
    
    const breakdown = analyticsData.deliveries.reduce((acc: any, delivery: any) => {
      const method = delivery.delivery_method || 'unknown'
      acc[method] = (acc[method] || 0) + 1
      return acc
    }, {})

    return breakdown
  }

  const getTopVolunteers = () => {
    if (!analyticsData?.deliveries) return []
    
    const volunteerStats = analyticsData.deliveries.reduce((acc: any, delivery: any) => {
      const volunteerName = delivery.volunteer?.name || 'Unassigned'
      if (!acc[volunteerName]) {
        acc[volunteerName] = { total: 0, completed: 0 }
      }
      acc[volunteerName].total++
      if (delivery.status === 'delivered') {
        acc[volunteerName].completed++
      }
      return acc
    }, {})

    return Object.entries(volunteerStats)
      .map(([name, stats]: [string, any]) => ({
        name,
        total: stats.total,
        completed: stats.completed,
        successRate: Math.round((stats.completed / stats.total) * 100)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      {analyticsData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Seniors</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.monthly?.seniorsServed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active seniors in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.monthly?.successRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Delivery completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.monthly?.activeVolunteers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Available for deliveries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.monthly?.totalDeliveries || 0}</div>
                <p className="text-xs text-muted-foreground">
                  This {timeRange}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Accessibility Metrics */}
          {analyticsData.accessibility && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Accessibility Metrics
                </CardTitle>
                <CardDescription>
                  Language and technology accessibility breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {analyticsData.accessibility.seniorsNeedingTranslation}
                    </div>
                    <div className="text-sm text-gray-600">Need Translation</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((analyticsData.accessibility.seniorsNeedingTranslation / analyticsData.accessibility.totalSeniors) * 100)}% of total
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analyticsData.accessibility.seniorsWithSmartphones}
                    </div>
                    <div className="text-sm text-gray-600">Have Smartphones</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((analyticsData.accessibility.seniorsWithSmartphones / analyticsData.accessibility.totalSeniors) * 100)}% of total
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {analyticsData.accessibility.seniorsWithoutSmartphones}
                    </div>
                    <div className="text-sm text-gray-600">No Smartphones</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((analyticsData.accessibility.seniorsWithoutSmartphones / analyticsData.accessibility.totalSeniors) * 100)}% of total
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.keys(analyticsData.accessibility.languageBreakdown || {}).length}
                    </div>
                    <div className="text-sm text-gray-600">Languages Supported</div>
                    <div className="text-xs text-gray-500">
                      Different languages
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Delivery Status Breakdown
                </CardTitle>
                <CardDescription>
                  Current delivery status distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(getStatusBreakdown()).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {status === 'delivered' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {status === 'pending' && <Clock className="w-4 h-4 text-yellow-600" />}
                        {status === 'missed' && <XCircle className="w-4 h-4 text-red-600" />}
                        <span className="capitalize">{status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{count as number}</span>
                        <Badge variant="outline">
                          {Math.round((count as number / analyticsData.deliveries.length) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Method Breakdown
                </CardTitle>
                <CardDescription>
                  How deliveries are being completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(getDeliveryMethodBreakdown()).map(([method, count]) => (
                    <div key={method} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {method === 'doorstep' && <MapPin className="w-4 h-4 text-green-600" />}
                        {method === 'phone_confirmed' && <Phone className="w-4 h-4 text-blue-600" />}
                        {method === 'family_member' && <Users className="w-4 h-4 text-purple-600" />}
                        <span className="capitalize">{method.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{count as number}</span>
                        <Badge variant="outline">
                          {Math.round((count as number / analyticsData.deliveries.length) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Volunteers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Performing Volunteers
              </CardTitle>
              <CardDescription>
                Volunteers with the most deliveries and highest success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTopVolunteers().map((volunteer, index) => (
                  <div key={volunteer.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{volunteer.name}</p>
                        <p className="text-sm text-gray-600">
                          {volunteer.total} deliveries • {volunteer.completed} completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{volunteer.successRate}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Language Distribution */}
          {analyticsData.accessibility?.languageBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language Distribution
                </CardTitle>
                <CardDescription>
                  Preferred languages of seniors in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Object.entries(analyticsData.accessibility.languageBreakdown).map(([language, count]) => (
                    <div key={language} className="text-center">
                      <div className="text-2xl font-bold">{count as number}</div>
                      <div className="text-sm text-gray-600 capitalize">{language}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((count as number / analyticsData.accessibility.totalSeniors) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
} 