"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Target,
  Edit,
  Save,
  X,
  Plus,
  Download,
  FileText
} from "lucide-react"
import { SupabaseService } from "@/lib/supabase-service"
import { exportExecutiveSummaryCSV, exportToPDF } from "@/lib/export-utils"

interface DeliveryRecord {
  id?: string
  delivery_date: string
  milk_gallons: number
  bread_delivered: number
  egg_trays: number
  misc_items: string
  goal_achieved: boolean
  cost_milk: number
  cost_eggs: number
  cost_bread: number
  additional_cost: number
  improvement_areas: string
  created_at?: string
  updated_at?: string
}

interface ExecutiveSummaryProps {
  onNavigate: (page: string) => void
}

export function ExecutiveSummary({ onNavigate }: ExecutiveSummaryProps) {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<DeliveryRecord>({
    delivery_date: "",
    milk_gallons: 0,
    bread_delivered: 0,
    egg_trays: 0,
    misc_items: "",
    goal_achieved: false,
    cost_milk: 0,
    cost_eggs: 0,
    cost_bread: 0,
    additional_cost: 0,
    improvement_areas: ""
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Default delivery dates for the year (monthly)
  const defaultDates = [
    "2025-01-11", "2025-02-10", "2025-03-09", "2025-04-13",
    "2025-05-10", "2025-06-08", "2025-07-13", "2025-08-17",
    "2025-09-16", "2025-10-12", "2025-11-07", "2025-12-14"
  ]

  useEffect(() => {
    loadDeliveries()
  }, [])

  const loadDeliveries = async () => {
    setIsLoading(true)
    try {
      // For now, we'll use mock data since we haven't created the database table yet
      // In production, this would call SupabaseService.getDeliveries()
      const mockDeliveries = defaultDates.map(date => ({
        id: `mock-${date}`,
        delivery_date: date,
        milk_gallons: 0,
        bread_delivered: 0,
        egg_trays: 0,
        misc_items: "",
        goal_achieved: false,
        cost_milk: 0,
        cost_eggs: 0,
        cost_bread: 0,
        additional_cost: 0,
        improvement_areas: ""
      }))
      setDeliveries(mockDeliveries)
    } catch (error) {
      setError("Failed to load deliveries: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (delivery: DeliveryRecord) => {
    setIsEditing(delivery.id || "")
    setEditingData(delivery)
  }

  const handleSave = async (id: string) => {
    try {
      // In production, this would call SupabaseService.updateDelivery() or createDelivery()
      const updatedDeliveries = deliveries.map(d => 
        d.id === id ? { ...editingData, id } : d
      )
      setDeliveries(updatedDeliveries)
      setIsEditing(null)
      setSuccess("Delivery record updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      setError("Failed to update delivery: " + (error as Error).message)
    }
  }

  const handleCancel = () => {
    setIsEditing(null)
    setEditingData({
      delivery_date: "",
      milk_gallons: 0,
      bread_delivered: 0,
      egg_trays: 0,
      misc_items: "",
      goal_achieved: false,
      cost_milk: 0,
      cost_eggs: 0,
      cost_bread: 0,
      additional_cost: 0,
      improvement_areas: ""
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateTotalCost = (delivery: DeliveryRecord) => {
    return delivery.cost_milk + delivery.cost_eggs + delivery.cost_bread + delivery.additional_cost
  }

  const calculateTotalItems = (delivery: DeliveryRecord) => {
    return delivery.milk_gallons + delivery.bread_delivered + delivery.egg_trays
  }

  const handleExportCSV = () => {
    exportExecutiveSummaryCSV(deliveries)
  }

  const handleExportPDF = () => {
    exportToPDF('executive-summary-content', 'executive-summary', 'Executive Summary & Delivery Tracker')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => onNavigate("dashboard")}>
                <X className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Executive Summary & Delivery Tracker
                </h1>
                <p className="text-sm text-gray-600">Track monthly deliveries and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Export PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div id="executive-summary-content" className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Total Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{deliveries.length}</div>
              <p className="text-xs text-gray-500">Monthly deliveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Goals Achieved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {deliveries.filter(d => d.goal_achieved).length}
              </div>
              <p className="text-xs text-gray-500">Out of {deliveries.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {deliveries.reduce((sum, d) => sum + calculateTotalItems(d), 0)}
              </div>
              <p className="text-xs text-gray-500">Items delivered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Total Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${deliveries.reduce((sum, d) => sum + calculateTotalCost(d), 0).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500">Total expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Tracker Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Delivery Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Date
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      # of Milk Gallons Delivered
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      # of Bread Delivered
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      # of Egg Trays Delivered
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Misc. Items
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Goal Achieved
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost for Milk
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost for Eggs
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost for Bread
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Additional Cost
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Improvement Areas
                    </th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2 text-sm text-gray-900">
                        {formatDate(delivery.delivery_date)}
                      </td>
                      
                      {isEditing === delivery.id ? (
                        // Editing mode
                        <>
                          <td className="border border-gray-200 px-3 py-2">
                            <Input
                              type="number"
                              value={editingData.milk_gallons}
                              onChange={(e) => setEditingData({...editingData, milk_gallons: parseInt(e.target.value) || 0})}
                              className="w-20 text-center"
                            />
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <Input
                              type="number"
                              value={editingData.bread_delivered}
                              onChange={(e) => setEditingData({...editingData, bread_delivered: parseInt(e.target.value) || 0})}
                              className="w-20 text-center"
                            />
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <Input
                              type="number"
                              value={editingData.egg_trays}
                              onChange={(e) => setEditingData({...editingData, egg_trays: parseInt(e.target.value) || 0})}
                              className="w-20 text-center"
                            />
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <Input
                              value={editingData.misc_items}
                              onChange={(e) => setEditingData({...editingData, misc_items: e.target.value})}
                              className="w-24"
                            />
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={editingData.goal_achieved}
                              onChange={(e) => setEditingData({...editingData, goal_achieved: e.target.checked})}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={editingData.cost_milk}
                              onChange={(e) => setEditingData({...editingData, cost_milk: parseFloat(e.target.value) || 0})}
                              className="w-20 text-center"
                            />
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={editingData.cost_eggs}
                              onChange={(e) => setEditingData({...editingData, cost_eggs: parseFloat(e.target.value) || 0})}
                              className="w-20 text-center"
                            />
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={editingData.cost_bread}
                              onChange={(e) => setEditingData({...editingData, cost_bread: parseFloat(e.target.value) || 0})}
                              className="w-20 text-center"
                            />
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={editingData.additional_cost}
                              onChange={(e) => setEditingData({...editingData, additional_cost: parseFloat(e.target.value) || 0})}
                              className="w-20 text-center"
                            />
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <Textarea
                              value={editingData.improvement_areas}
                              onChange={(e) => setEditingData({...editingData, improvement_areas: e.target.value})}
                              className="w-32 text-xs"
                              rows={2}
                            />
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleSave(delivery.id!)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // Display mode
                        <>
                          <td className="border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                            {delivery.milk_gallons}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                            {delivery.bread_delivered}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                            {delivery.egg_trays}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                            {delivery.misc_items || "-"}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center">
                            {delivery.goal_achieved ? (
                              <Badge className="bg-green-100 text-green-800">✓</Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">-</Badge>
                            )}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                            ${delivery.cost_milk.toFixed(2)}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                            ${delivery.cost_eggs.toFixed(2)}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                            ${delivery.cost_bread.toFixed(2)}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                            ${delivery.additional_cost.toFixed(2)}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                            {delivery.improvement_areas || "-"}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(delivery)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="text-red-600">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="text-green-600">{success}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
