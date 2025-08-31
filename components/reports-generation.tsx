"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckSquare
} from "lucide-react"
import { SupabaseService } from "@/lib/supabase-service"

export function ReportsGeneration() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [reportType, setReportType] = useState("monthly")
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState("")
  const [comprehensiveData, setComprehensiveData] = useState<any>(null)

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const generateReport = async () => {
    setIsGenerating(true)
    setError("")
    setReportData(null)

    try {
      const [year, month] = selectedMonth.split("-").map(Number)
      
      if (reportType === "monthly") {
        const stats = await SupabaseService.getMonthlyStats(year, month)
        setReportData(stats)
      } else if (reportType === "accessibility") {
        const stats = await SupabaseService.getAccessibilityStats()
        setReportData(stats)
      } else if (reportType === "delivery") {
        const deliveries = await SupabaseService.getDeliveries(undefined, selectedMonth)
        setReportData(deliveries)
      } else if (reportType === "comprehensive") {
        const comprehensive = await SupabaseService.getComprehensiveDeliveryData(selectedMonth)
        setComprehensiveData(comprehensive)
      }
    } catch (error) {
      setError("Error generating report: " + (error as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    let csvContent = ""
    let filename = ""

    if (reportType === "monthly") {
      filename = `monthly-report-${selectedMonth}.csv`
      csvContent = generateMonthlyCSV(reportData)
    } else if (reportType === "accessibility") {
      filename = `accessibility-report-${new Date().toISOString().slice(0, 10)}.csv`
      csvContent = generateAccessibilityCSV(reportData)
    } else if (reportType === "delivery") {
      filename = `delivery-report-${selectedMonth}.csv`
      csvContent = generateDeliveryCSV(reportData)
    } else if (reportType === "comprehensive") {
      filename = `comprehensive-delivery-report-${selectedMonth}.csv`
      csvContent = generateComprehensiveCSV(comprehensiveData)
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateMonthlyCSV = (data: any) => {
    const headers = [
      "Metric",
      "Value",
      "Description"
    ]

    const rows = [
      ["Total Seniors Served", data.seniorsServed, "Number of active seniors in the system"],
      ["Deliveries Completed", data.deliveriesCompleted, "Number of successful deliveries"],
      ["Total Deliveries", data.totalDeliveries, "Total number of delivery attempts"],
      ["Success Rate", `${data.successRate}%`, "Percentage of successful deliveries"],
      ["Active Volunteers", data.activeVolunteers, "Number of active volunteers"],
      ["New Volunteers", data.newVolunteers, "Number of new volunteers this month"]
    ]

    return [headers, ...rows].map(row => row.join(",")).join("\n")
  }

  const generateAccessibilityCSV = (data: any) => {
    const headers = [
      "Category",
      "Count",
      "Percentage"
    ]

    const rows = [
      ["Total Seniors", data.totalSeniors, "100%"],
      ["Need Translation", data.seniorsNeedingTranslation, `${Math.round((data.seniorsNeedingTranslation / data.totalSeniors) * 100)}%`],
      ["Have Smartphones", data.seniorsWithSmartphones, `${Math.round((data.seniorsWithSmartphones / data.totalSeniors) * 100)}%`],
      ["No Smartphones", data.seniorsWithoutSmartphones, `${Math.round((data.seniorsWithoutSmartphones / data.totalSeniors) * 100)}%`]
    ]

    // Add language breakdown
    Object.entries(data.languageBreakdown).forEach(([language, count]) => {
      rows.push([`Language: ${language}`, count, `${Math.round((count as number / data.totalSeniors) * 100)}%`])
    })

    return [headers, ...rows].map(row => row.join(",")).join("\n")
  }

  const generateDeliveryCSV = (data: any) => {
    const headers = [
      "Senior Name",
      "Volunteer Name",
      "Delivery Date",
      "Status",
      "Delivery Method",
      "Notes"
    ]

    const rows = data.data?.map((delivery: any) => [
      delivery.senior?.name || "Unknown",
      delivery.volunteer?.name || "Unassigned",
      delivery.delivery_date,
      delivery.status,
      delivery.delivery_method || "N/A",
      delivery.notes || ""
    ]) || []

    return [headers, ...rows].map(row => row.join(",")).join("\n")
  }

  const generateComprehensiveCSV = (data: any) => {
    const headers = [
      // Core delivery details
      "Delivery_ID",
      "Service_Date",
      "Service_Window_Start",
      "Service_Window_End", 
      "Delivery_Status",
      "Delivery_Method",
      "Delivery_Notes",
      "Attempt_Count",
      "Followup_Required",
      "Followup_Action_Due_Date",
      "Weather_Conditions",
      "Proof_of_Delivery_URL",
      "Language_Barrier_Encountered",
      "Translation_Needed",
      "Created_At",
      "Completed_At",
      
      // Recipient (senior) profile
      "Senior_ID",
      "Senior_Name", 
      "DOB_or_Age",
      "Gender",
      "Address_Line1",
      "Address_Line2_Unit_Apt",
      "Building_Name",
      "City",
      "ZIP_Code",
      "Geo_Lat",
      "Geo_Lng",
      "Preferred_Language",
      "Needs_Translation",
      "Has_Smartphone",
      "Primary_Phone",
      "Secondary_Phone",
      "Emergency_Contact_Name",
      "Emergency_Contact_Phone",
      "Dietary_Restrictions",
      "Health_Notes",
      "Accessibility_Flags",
      "Household_Type",
      "Household_Size",
      "Residency_Verified",
      "Special_Instructions",
      "Active",
      
      // Volunteer details
      "Volunteer_ID",
      "Volunteer_Name",
      "Volunteer_Email", 
      "Volunteer_Phone",
      "Volunteer_Languages",
      "Shift_Start_Time",
      "Shift_End_Time",
      "Miles_Traveled",
      "Hours_Served",
      "Reimbursement_Eligible",
      "Reimbursement_Amount",
      "Volunteer_Address",
      "Volunteer_Role",
      "Vehicle_Type",
      "Vehicle_Capacity",
      "Experience_Level",
      "Special_Skills",
      "Emergency_Contact",
      "Volunteer_Notes",
      "Volunteer_Active"
    ]

    const rows = data.data?.map((delivery: any) => {
      const senior = delivery.seniors
      const volunteer = delivery.volunteers
      
      // Calculate household size
      const householdSize = (senior?.family_adults || 0) + (senior?.family_children || 0)
      
      // Calculate hours served (placeholder - would need actual shift data)
      const hoursServed = "N/A" // This would need to be calculated from actual shift data
      
      // Determine followup required based on status
      const followupRequired = delivery.status === "missed" || delivery.status === "no_contact" ? "yes" : "no"
      
      // Calculate followup due date (7 days from delivery date for missed/no_contact)
      const followupDueDate = followupRequired === "yes" ? 
        new Date(new Date(delivery.delivery_date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        "N/A"

      return [
        // Core delivery details
        delivery.id || "",
        delivery.delivery_date || "",
        "N/A", // Service_Window_Start - would need to be added to database
        "N/A", // Service_Window_End - would need to be added to database
        delivery.status || "",
        delivery.delivery_method || "",
        delivery.notes || "",
        "1", // Attempt_Count - would need to be tracked in database
        followupRequired,
        followupDueDate,
        "N/A", // Weather_Conditions - would need to be added to database
        "N/A", // Proof_of_Delivery_URL - would need to be added to database
        delivery.language_barrier_encountered ? "yes" : "no",
        delivery.translation_needed ? "yes" : "no",
        delivery.created_at || "",
        delivery.completed_at || "",
        
        // Recipient (senior) profile
        senior?.id || "",
        senior?.name || "",
        senior?.age || "",
        "N/A", // Gender - would need to be added to database
        senior?.address || "",
        senior?.unit_apt || "",
        senior?.building || "",
        "Fremont", // City - hardcoded for now
        senior?.zip_code || "",
        "N/A", // Geo_Lat - would need to be added to database
        "N/A", // Geo_Lng - would need to be added to database
        senior?.preferred_language || "",
        senior?.needs_translation ? "yes" : "no",
        senior?.has_smartphone ? "yes" : "no",
        senior?.phone || "",
        "N/A", // Secondary_Phone - would need to be added to database
        senior?.emergency_contact || "",
        "N/A", // Emergency_Contact_Phone - would need to be added to database
        senior?.dietary_restrictions || "",
        senior?.health_conditions || "",
        "N/A", // Accessibility_Flags - would need to be added to database
        senior?.household_type || "",
        householdSize.toString(),
        "yes", // Residency_Verified - assumed yes for active seniors
        senior?.special_instructions || "",
        senior?.active ? "yes" : "no",
        
        // Volunteer details
        volunteer?.id || "",
        volunteer?.name || "",
        volunteer?.email || "",
        volunteer?.phone || "",
        volunteer?.speaks_languages?.join(", ") || "",
        "N/A", // Shift_Start_Time - would need to be added to database
        "N/A", // Shift_End_Time - would need to be added to database
        "N/A", // Miles_Traveled - would need to be added to database
        hoursServed,
        "N/A", // Reimbursement_Eligible - would need to be added to database
        "N/A", // Reimbursement_Amount - would need to be added to database
        volunteer?.address || "",
        volunteer?.role || "",
        volunteer?.vehicle_type || "",
        volunteer?.vehicle_capacity?.toString() || "",
        volunteer?.experience_level || "",
        volunteer?.special_skills || "",
        volunteer?.emergency_contact || "",
        volunteer?.notes || "",
        volunteer?.active ? "yes" : "no"
      ]
    }) || []

    return [headers, ...rows].map(row => row.join(",")).join("\n")
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-green-800">Reports Generation</h2>
        <p className="text-gray-600">Generate comprehensive reports for grant applications and analysis</p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>
            Select report type and parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Summary</SelectItem>
                  <SelectItem value="accessibility">Accessibility Report</SelectItem>
                  <SelectItem value="delivery">Delivery Details</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Delivery Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={generateReport} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Report Results */}
      {(reportData || comprehensiveData) && (
        <div className="space-y-6">
          {/* Report Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                {reportType === "monthly" && "Monthly Summary Report"}
                {reportType === "accessibility" && "Accessibility Report"}
                {reportType === "delivery" && "Delivery Details Report"}
                {reportType === "comprehensive" && "Comprehensive Delivery Report"}
              </h3>
              <p className="text-gray-600">
                Generated for {reportType === "accessibility" ? new Date().toLocaleDateString() : selectedMonth}
              </p>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Monthly Report */}
          {reportType === "monthly" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Seniors Served</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.seniorsServed}</div>
                  <p className="text-xs text-muted-foreground">
                    Active seniors in system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Deliveries Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.deliveriesCompleted}</div>
                  <p className="text-xs text-muted-foreground">
                    of {reportData.totalDeliveries} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.successRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Successful deliveries
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.activeVolunteers}</div>
                  <p className="text-xs text-muted-foreground">
                    Available for deliveries
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Volunteers</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.newVolunteers}</div>
                  <p className="text-xs text-muted-foreground">
                    Joined this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Trends</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportData.monthlyTrends?.slice(-3).map((trend: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{trend.month}</span>
                        <span className="font-medium">{trend.completionRate}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Accessibility Report */}
          {reportType === "accessibility" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Seniors</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.totalSeniors}</div>
                  <p className="text-xs text-muted-foreground">
                    In the system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Need Translation</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.seniorsNeedingTranslation}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((reportData.seniorsNeedingTranslation / reportData.totalSeniors) * 100)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Have Smartphones</CardTitle>
                  <CheckSquare className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.seniorsWithSmartphones}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((reportData.seniorsWithSmartphones / reportData.totalSeniors) * 100)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">No Smartphones</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reportData.seniorsWithoutSmartphones}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((reportData.seniorsWithoutSmartphones / reportData.totalSeniors) * 100)}% of total
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Language Breakdown */}
          {reportType === "accessibility" && reportData.languageBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Language Breakdown</CardTitle>
                <CardDescription>Distribution of preferred languages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(reportData.languageBreakdown).map(([language, count]) => (
                    <div key={language} className="text-center">
                      <div className="text-2xl font-bold">{count as number}</div>
                      <div className="text-sm text-gray-600">{language}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((count as number / reportData.totalSeniors) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Report */}
          {reportType === "delivery" && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
                <CardDescription>Individual delivery records for {selectedMonth}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.data?.map((delivery: any) => (
                    <div key={delivery.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(delivery.status)}
                          <div>
                            <p className="font-medium">{delivery.senior?.name || 'Unknown Senior'}</p>
                            <p className="text-sm text-gray-600">
                              {delivery.volunteer?.name || 'Unassigned'} • {delivery.delivery_date}
                            </p>
                            {delivery.notes && (
                              <p className="text-sm text-gray-500 mt-1">{delivery.notes}</p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comprehensive Report */}
          {reportType === "comprehensive" && (
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Delivery Report</CardTitle>
                <CardDescription>
                  Detailed delivery data with senior and volunteer information for {selectedMonth}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Comprehensive Data Ready for Export
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This report contains {comprehensiveData.data?.length || 0} delivery records with detailed information including:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <h4 className="font-medium mb-2">Core Delivery Details</h4>
                        <ul className="space-y-1">
                          <li>• Delivery ID & Status</li>
                          <li>• Service Date & Method</li>
                          <li>• Notes & Followup Info</li>
                          <li>• Language Barriers</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Senior Profile</h4>
                        <ul className="space-y-1">
                          <li>• Personal Information</li>
                          <li>• Address & Contact</li>
                          <li>• Health & Dietary Info</li>
                          <li>• Accessibility Needs</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Volunteer Details</h4>
                        <ul className="space-y-1">
                          <li>• Contact Information</li>
                          <li>• Languages & Skills</li>
                          <li>• Vehicle & Experience</li>
                          <li>• Service Hours</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download Comprehensive CSV
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
} 