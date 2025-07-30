"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SupabaseService } from "@/lib/supabase-service"
import type { MonthlyStats } from "@/lib/supabase"
import { ArrowLeft, Download, TrendingUp, Users, CheckCircle2, Calendar, FileText, BarChart3 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

interface AdminReportsProps {
  onNavigate: (page: string) => void
}

export function AdminReports({ onNavigate }: AdminReportsProps) {
  const [stats, setStats] = useState<MonthlyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("monthly")
  const [volunteerReport, setVolunteerReport] = useState<any[]>([])
  const [isVolunteerLoading, setIsVolunteerLoading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    if (activeTab === "volunteers") {
      loadVolunteerReport()
    }
  }, [activeTab])

  const loadStats = async () => {
    try {
      const currentDate = new Date()
      const monthlyStats = await SupabaseService.getMonthlyStats(currentDate.getFullYear(), currentDate.getMonth() + 1)
      setStats(monthlyStats)
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadVolunteerReport = async () => {
    setIsVolunteerLoading(true)
    try {
      const { data: volunteers } = await SupabaseService.getVolunteers()
      if (!volunteers) {
        setVolunteerReport([])
        setIsVolunteerLoading(false)
        return
      }
      // For each volunteer, fetch their deliveries
      const report = await Promise.all(
        volunteers.map(async (vol: any) => {
          const { data: deliveries } = await SupabaseService.getDeliveries(vol.id)
          const seniors = deliveries
            ? Array.from(new Set(deliveries.map((d: any) => d.senior?.name).filter(Boolean)))
            : []
          return {
            id: vol.id,
            name: vol.name,
            email: vol.email,
            deliveriesCount: deliveries ? deliveries.length : 0,
            seniors,
          }
        })
      )
      setVolunteerReport(report)
    } catch (error) {
      setVolunteerReport([])
    } finally {
      setIsVolunteerLoading(false)
    }
  }

  const handleExportPDF = () => {
    alert("PDF report would be generated and downloaded")
  }

  const handleExportCSV = () => {
    if (!stats) return

    const csvData = [
      ["Metric", "Value"],
      ["Seniors Served", stats.seniorsServed.toString()],
      ["Deliveries Completed", stats.deliveriesCompleted.toString()],
      ["Total Deliveries", stats.totalDeliveries.toString()],
      ["Success Rate", `${stats.successRate}%`],
      ["Active Volunteers", stats.activeVolunteers.toString()],
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `monthly-report-${new Date().toISOString().slice(0, 7)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error loading analytics data</p>
          <Button onClick={loadStats} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => onNavigate("dashboard")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Reports</h1>
                <p className="text-sm text-gray-600">Admin Analytics & Volunteer Reports</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </Button>
              <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
            <TabsTrigger value="volunteers">Volunteer Report</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly">
            {/* Existing Monthly Report UI */}
        {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
          <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Seniors Served</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.seniorsServed}</p>
                </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm text-green-600 font-medium">+8.3%</span>
                    <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Deliveries Completed</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.deliveriesCompleted}</p>
                </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
                    <span className="text-sm text-gray-500 ml-2">completion rate</span>
              </div>
            </CardContent>
          </Card>

          <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.successRate}%</p>
                </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                  {stats.successRate >= 90
                    ? "Excellent Performance"
                    : stats.successRate >= 75
                      ? "Good Performance"
                      : "Needs Improvement"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
                      <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.activeVolunteers}</p>
                </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm text-green-600 font-medium">+{stats.newVolunteers}</span>
                    <span className="text-sm text-gray-500 ml-2">new this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends Chart */}
            <Card className="mb-8">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Monthly Delivery Trends</span>
            </CardTitle>
                <CardDescription className="text-sm">Delivery completion rates over the past 4 months</CardDescription>
          </CardHeader>
              <CardContent className="pt-0 px-6 pb-6">
                <div className="h-48 sm:h-56 flex items-end justify-between space-x-4 sm:space-x-6 px-4 sm:px-6">
              {stats?.monthlyTrends?.map((data, index) => {
                const height = Math.max((data.completionRate / 100) * 160, 20)
                return (
                      <div key={data.month} className="flex flex-col items-center flex-1 min-w-0">
                    <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: "160px" }}>
                      <div
                        className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg absolute bottom-0 w-full transition-all duration-500"
                        style={{ height: `${height}px` }}
                      />
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                        {data.completionRate}%
                      </div>
                    </div>
                        <div className="mt-3 text-center">
                      <p className="text-sm font-medium text-gray-900">{data.month}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Summary Insights */}
        <Card>
              <CardHeader className="pb-6">
                <CardTitle className="text-lg sm:text-xl">Key Insights</CardTitle>
          </CardHeader>
              <CardContent className="pt-0 px-6 pb-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800 text-sm sm:text-base">Strong Performance</span>
                </div>
                    <p className="text-sm sm:text-base text-green-700">
                  {stats.successRate}% delivery success rate this month, serving {stats.seniorsServed} seniors.
                </p>
              </div>

                  <div className="p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800 text-sm sm:text-base">Volunteer Engagement</span>
                </div>
                    <p className="text-sm sm:text-base text-blue-700">
                  {stats.activeVolunteers} active volunteers with {stats.newVolunteers} new volunteers this month.
                </p>
              </div>

                  <div className="p-4 sm:p-6 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-800 text-sm sm:text-base">Delivery Consistency</span>
                </div>
                    <p className="text-sm sm:text-base text-orange-700">
                  {stats.deliveriesCompleted} of {stats.totalDeliveries} scheduled deliveries completed on time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
          </TabsContent>
          <TabsContent value="volunteers">
            {isVolunteerLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">Loading volunteer report...</div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-green-800 mb-4">Volunteer Report</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Deliveries</TableHead>
                      <TableHead>Seniors Delivered To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volunteerReport.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.name}</TableCell>
                        <TableCell>{v.email}</TableCell>
                        <TableCell>{v.deliveriesCount}</TableCell>
                        <TableCell>{v.seniors.join(", ")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
