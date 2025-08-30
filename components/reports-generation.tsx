"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
import { DeliveryTracker } from "./delivery-tracker"

export function ReportsGeneration() {
  // Simple test state
  const [testValue, setTestValue] = useState("Component is working!")

  return (
    <div className="space-y-6">
      {/* TEST HEADER - This should be very visible */}
      <div className="p-6 bg-red-100 border-4 border-red-500 rounded-lg">
        <h1 className="text-3xl font-bold text-red-800">🚨 TEST MODE - REPORTS COMPONENT 🚨</h1>
        <p className="text-xl text-red-700 mt-2">If you can see this, the component is loading!</p>
        <p className="text-lg text-red-600 mt-1">Test Value: {testValue}</p>
        <Button 
          onClick={() => setTestValue("Button clicked at " + new Date().toLocaleTimeString())}
          className="mt-3 bg-red-600 hover:bg-red-700"
        >
          Click to Test
        </Button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-green-800">Reports & Analytics</h2>
        <p className="text-gray-600">Generate comprehensive reports and track delivery metrics</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Reports Generation</TabsTrigger>
          <TabsTrigger value="delivery-tracker">Delivery Tracker</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Debug Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">Debug Info:</p>
          <p className="text-blue-700 text-sm">Tabs component loaded. You should see 3 tabs above.</p>
          <p className="text-blue-700 text-sm">If you don't see the Delivery Tracker tab, there may be a rendering issue.</p>
        </div>

        {/* Reports Generation Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports Generation Tab</CardTitle>
              <CardDescription>This is the reports generation tab content</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reports generation content goes here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tracker Tab */}
        <TabsContent value="delivery-tracker">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <p className="text-green-800 font-medium">Delivery Tracker Tab Active!</p>
            <p className="text-green-700 text-sm">This tab contains the delivery tracker with executive summary dashboard.</p>
          </div>
          <DeliveryTracker />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Tab</CardTitle>
              <CardDescription>Analytics content goes here...</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analytics content...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 