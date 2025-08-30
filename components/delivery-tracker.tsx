"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { 
  Calendar as CalendarIcon,
  Download,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  Package,
  ShoppingBag,
  CircleDot,
  DollarSign,
  BarChart3
} from "lucide-react"
import { SupabaseService } from "@/lib/supabase-service"

interface DeliveryRecord {
  id?: string
  delivery_date: string
  milk_gallons: number
  bread_loaves: number
  egg_trays: number
  misc_items: string
  goal: string
  achieved: string
  cost_milk: number
  cost_eggs: number
  cost_bread: number
  additional_cost: number
  notes?: string
}

interface MonthlySummary {
  month: string
  seniors_served: number
  total_milk: number
  total_bread: number
  total_eggs: number
  total_cost: number
  delivery_count: number
}

export function DeliveryTracker() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([])
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState<DeliveryRecord | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState<DeliveryRecord>({
    delivery_date: new Date().toISOString().slice(0, 10),
    milk_gallons: 0,
    bread_loaves: 0,
    egg_trays: 0,
    misc_items: "",
    goal: "",
    achieved: "",
    cost_milk: 0,
    cost_eggs: 0,
    cost_bread: 0,
    additional_cost: 0,
    notes: ""
  })

  useEffect(() => {
    loadDeliveries()
    generateMonthlySummary()
  }, [selectedMonth])

  const loadDeliveries = async () => {
    setIsLoading(true)
    try {
      // This would be replaced with actual API call
      const mockDeliveries: DeliveryRecord[] = [
        {
          id: "1",
          delivery_date: "2025-01-11",
          milk_gallons: 25,
          bread_loaves: 30,
          egg_trays: 15,
          misc_items: "Canned vegetables, rice",
          goal: "Serve 50 seniors",
          achieved: "Served 48 seniors",
          cost_milk: 75.00,
          cost_eggs: 45.00,
          cost_bread: 60.00,
          additional_cost: 120.00,
          notes: "Successful delivery to senior community"
        }
      ]
      setDeliveries(mockDeliveries)
    } catch (error) {
      console.error("Error loading deliveries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMonthlySummary = () => {
    const summary: MonthlySummary = {
      month: selectedMonth,
      seniors_served: 48,
      total_milk: 25,
      total_bread: 30,
      total_eggs: 15,
      total_cost: 300.00,
      delivery_count: 1
    }
    setMonthlySummary(summary)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingDelivery) {
        // Update existing delivery
        const updatedDeliveries = deliveries.map(d => 
          d.id === editingDelivery.id ? { ...formData, id: d.id } : d
        )
        setDeliveries(updatedDeliveries)
        setSuccess("Delivery updated successfully!")
      } else {
        // Add new delivery
        const newDelivery = { ...formData, id: Date.now().toString() }
        setDeliveries([...deliveries, newDelivery])
        setSuccess("Delivery added successfully!")
      }
      resetForm()
      generateMonthlySummary()
    } catch (error) {
      setError("Error saving delivery: " + (error as Error).message)
    }
  }

  const handleEdit = (delivery: DeliveryRecord) => {
    setEditingDelivery(delivery)
    setFormData(delivery)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const updatedDeliveries = deliveries.filter(d => d.id !== id)
      setDeliveries(updatedDeliveries)
      setSuccess("Delivery deleted successfully!")
      generateMonthlySummary()
    } catch (error) {
      setError("Error deleting delivery: " + (error as Error).message)
    }
  }

  const resetForm = () => {
    setFormData({
      delivery_date: new Date().toISOString().slice(0, 10),
      milk_gallons: 0,
      bread_loaves: 0,
      egg_trays: 0,
      misc_items: "",
      goal: "",
      achieved: "",
      cost_milk: 0,
      cost_eggs: 0,
      cost_bread: 0,
      additional_cost: 0,
      notes: ""
    })
    setEditingDelivery(null)
    setShowAddForm(false)
    setError("")
    setSuccess("")
  }

  const exportToCSV = () => {
    const headers = [
      "Date", "Milk (gallons)", "Bread (loaves)", "Eggs (trays)", 
      "Misc Items", "Goal", "Achieved", "Cost Milk", "Cost Eggs", 
      "Cost Bread", "Additional Cost", "Notes"
    ]
    
    const csvContent = [
      headers.join(","),
      ...deliveries.map(d => [
        d.delivery_date,
        d.milk_gallons,
        d.bread_loaves,
        d.egg_trays,
        `"${d.misc_items}"`,
        `"${d.goal}"`,
        `"${d.achieved}"`,
        d.cost_milk,
        d.cost_eggs,
        d.cost_bread,
        d.additional_cost,
        `"${d.notes || ""}"`
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `delivery-tracker-${selectedMonth}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* DEBUG HEADER - This should be very visible */}
      <div className="p-6 bg-green-100 border-4 border-green-500 rounded-lg">
        <h1 className="text-3xl font-bold text-green-800">🚨 DELIVERY TRACKER COMPONENT LOADED! 🚨</h1>
        <p className="text-xl text-green-700 mt-2">If you can see this, the DeliveryTracker component is working!</p>
        <p className="text-lg text-green-600 mt-1">Selected Month: {selectedMonth}</p>
      </div>
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-green-800">Delivery Tracker</h2>
        <p className="text-gray-600">Track monthly deliveries and generate executive summaries</p>
      </div>

      {/* Month Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-48"
          />
        </CardContent>
      </Card>

      {/* Executive Summary */}
      {monthlySummary && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <BarChart3 className="h-5 w-5" />
              Executive Summary - {monthlySummary.month}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{monthlySummary.seniors_served}</div>
                <div className="text-sm text-gray-600">Seniors Served</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{monthlySummary.total_milk}</div>
                <div className="text-sm text-gray-600">Milk Gallons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{monthlySummary.total_bread}</div>
                <div className="text-sm text-gray-600">Bread Loaves</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{monthlySummary.total_eggs}</div>
                <div className="text-sm text-gray-600">Egg Trays</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">${monthlySummary.total_cost.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{monthlySummary.delivery_count}</div>
                <div className="text-sm text-gray-600">Deliveries</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Delivery Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingDelivery ? "Edit Delivery Record" : "Add New Delivery Record"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery_date">Delivery Date *</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="milk_gallons">Milk Gallons *</Label>
                  <Input
                    id="milk_gallons"
                    type="number"
                    min="0"
                    value={formData.milk_gallons}
                    onChange={(e) => setFormData({...formData, milk_gallons: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bread_loaves">Bread Loaves *</Label>
                  <Input
                    id="bread_loaves"
                    type="number"
                    min="0"
                    value={formData.bread_loaves}
                    onChange={(e) => setFormData({...formData, bread_loaves: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="egg_trays">Egg Trays *</Label>
                  <Input
                    id="egg_trays"
                    type="number"
                    min="0"
                    value={formData.egg_trays}
                    onChange={(e) => setFormData({...formData, egg_trays: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cost_milk">Cost for Milk ($)</Label>
                  <Input
                    id="cost_milk"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost_milk}
                    onChange={(e) => setFormData({...formData, cost_milk: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="cost_eggs">Cost for Eggs ($)</Label>
                  <Input
                    id="cost_eggs"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost_eggs}
                    onChange={(e) => setFormData({...formData, cost_eggs: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="cost_bread">Cost for Bread ($)</Label>
                  <Input
                    id="cost_bread"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost_bread}
                    onChange={(e) => setFormData({...formData, cost_bread: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="additional_cost">Additional Cost ($)</Label>
                  <Input
                    id="additional_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.additional_cost}
                    onChange={(e) => setFormData({...formData, additional_cost: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goal">Goal</Label>
                  <Input
                    id="goal"
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                    placeholder="e.g., Serve 50 seniors"
                  />
                </div>
                <div>
                  <Label htmlFor="achieved">Achieved</Label>
                  <Input
                    id="achieved"
                    value={formData.achieved}
                    onChange={(e) => setFormData({...formData, achieved: e.target.value})}
                    placeholder="e.g., Served 48 seniors"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="misc_items">Miscellaneous Items</Label>
                <Input
                  id="misc_items"
                  value={formData.misc_items}
                  onChange={(e) => setFormData({...formData, misc_items: e.target.value})}
                  placeholder="e.g., Canned vegetables, rice, pasta"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about the delivery"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingDelivery(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                  {isLoading ? "Saving..." : (editingDelivery ? "Update Delivery" : "Add Delivery")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Delivery Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Delivery Records - {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
          <CardDescription>
            Detailed tracking of all deliveries with quantities and costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading deliveries...</div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No delivery records found for this month.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">
                      <Package className="w-4 h-4 mx-auto" />
                      Milk
                    </TableHead>
                    <TableHead className="text-center">
                      <ShoppingBag className="w-4 h-4 mx-auto" />
                      Bread
                    </TableHead>
                    <TableHead className="text-center">
                      <CircleDot className="w-4 h-4 mx-auto" />
                      Eggs
                    </TableHead>
                    <TableHead>Misc Items</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Achieved</TableHead>
                    <TableHead className="text-right">
                      <DollarSign className="w-4 h-4 mx-auto" />
                      Total Cost
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">
                        {new Date(delivery.delivery_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">{delivery.milk_gallons}</TableCell>
                      <TableCell className="text-center">{delivery.bread_loaves}</TableCell>
                      <TableCell className="text-center">{delivery.egg_trays}</TableCell>
                      <TableCell className="max-w-xs truncate" title={delivery.misc_items}>
                        {delivery.misc_items}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={delivery.goal}>
                        {delivery.goal}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={delivery.achieved}>
                        {delivery.achieved}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${(delivery.cost_milk + delivery.cost_eggs + delivery.cost_bread + delivery.additional_cost).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(delivery)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(delivery.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}
    </div>
  )
}
