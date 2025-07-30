"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Filter
} from "lucide-react"
import { SupabaseService } from "@/lib/supabase-service"
import { Senior } from "@/lib/supabase"

interface SeniorManagementProps {
  onDataChange: () => void
}

export function SeniorManagement({ onDataChange }: SeniorManagementProps) {
  const [seniors, setSeniors] = useState<Senior[]>([])
  const [filteredSeniors, setFilteredSeniors] = useState<Senior[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSenior, setEditingSenior] = useState<Senior | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    household_type: "single" as "single" | "family",
    family_adults: "1",
    family_children: "0",
    race_ethnicity: "",
    health_conditions: "",
    address: "",
    dietary_restrictions: "",
    phone: "",
    emergency_contact: "",
    has_smartphone: false,
    preferred_language: "english",
    needs_translation: false,
    delivery_method: "doorstep" as "doorstep" | "phone_confirmed" | "family_member",
    special_instructions: "",
    active: true
  })

  useEffect(() => {
    loadSeniors()
  }, [])

  useEffect(() => {
    filterSeniors()
  }, [seniors, searchTerm, statusFilter])

  const loadSeniors = async () => {
    setIsLoading(true)
    try {
      const result = await SupabaseService.getSeniors({ active: false })
      if (result.error) {
        setError("Failed to load seniors: " + result.error.message)
      } else {
        setSeniors(result.data || [])
      }
    } catch (error) {
      setError("Error loading seniors: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const filterSeniors = () => {
    let filtered = seniors

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(senior =>
        senior.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        senior.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        senior.phone?.includes(searchTerm)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(senior => 
        statusFilter === "active" ? senior.active : !senior.active
      )
    }

    setFilteredSeniors(filtered)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      household_type: "single",
      family_adults: "1",
      family_children: "0",
      race_ethnicity: "",
      health_conditions: "",
      address: "",
      dietary_restrictions: "",
      phone: "",
      emergency_contact: "",
      has_smartphone: false,
      preferred_language: "english",
      needs_translation: false,
      delivery_method: "doorstep",
      special_instructions: "",
      active: true
    })
    setEditingSenior(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const seniorData = {
        ...formData,
        age: parseInt(formData.age),
        family_adults: parseInt(formData.family_adults),
        family_children: parseInt(formData.family_children),
        building: null, // Add missing required field
        unit_apt: null, // Add missing required field
        zip_code: null // Add missing required field
      }

      if (editingSenior) {
        // Update existing senior
        const result = await SupabaseService.updateSenior(editingSenior.id, seniorData)
        if (result.error) {
          setError("Failed to update senior: " + result.error.message)
        } else {
          setSuccess("Senior updated successfully!")
          setIsAddDialogOpen(false)
          resetForm()
          loadSeniors()
          onDataChange()
        }
      } else {
        // Create new senior
        const result = await SupabaseService.createSenior(seniorData)
        if (result.error) {
          setError("Failed to create senior: " + result.error.message)
        } else {
          setSuccess("Senior created successfully!")
          setIsAddDialogOpen(false)
          resetForm()
          loadSeniors()
          onDataChange()
        }
      }
    } catch (error) {
      setError("Error saving senior: " + (error as Error).message)
    }
  }

  const handleEdit = (senior: Senior) => {
    setEditingSenior(senior)
    setFormData({
      name: senior.name,
      age: senior.age?.toString() || "",
      household_type: senior.household_type,
      family_adults: senior.family_adults.toString(),
      family_children: senior.family_children.toString(),
      race_ethnicity: senior.race_ethnicity || "",
      health_conditions: senior.health_conditions || "",
      address: senior.address,
      dietary_restrictions: senior.dietary_restrictions || "",
      phone: senior.phone || "",
      emergency_contact: senior.emergency_contact || "",
      has_smartphone: senior.has_smartphone,
      preferred_language: senior.preferred_language,
      needs_translation: senior.needs_translation,
      delivery_method: senior.delivery_method,
      special_instructions: senior.special_instructions || "",
      active: senior.active
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (seniorId: string) => {
    if (!confirm("Are you sure you want to delete this senior?")) return

    try {
      const result = await SupabaseService.updateSenior(seniorId, { active: false })
      if (result.error) {
        setError("Failed to delete senior: " + result.error.message)
      } else {
        setSuccess("Senior deleted successfully!")
        loadSeniors()
        onDataChange()
      }
    } catch (error) {
      setError("Error deleting senior: " + (error as Error).message)
    }
  }

  const getStatusBadge = (active: boolean) => {
    return active ? 
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge> :
      <Badge variant="secondary">Inactive</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seniors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-800">Senior Management</h2>
          <p className="text-gray-600">Manage senior profiles and information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Senior
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSenior ? "Edit Senior" : "Add New Senior"}
              </DialogTitle>
              <DialogDescription>
                {editingSenior ? "Update senior information" : "Add a new senior to the system"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Household Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="household_type">Household Type</Label>
                  <Select value={formData.household_type} onValueChange={(value: "single" | "family") => 
                    setFormData({...formData, household_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="family_adults">Adults in Household</Label>
                  <Input
                    id="family_adults"
                    type="number"
                    value={formData.family_adults}
                    onChange={(e) => setFormData({...formData, family_adults: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="family_children">Children in Household</Label>
                  <Input
                    id="family_children"
                    type="number"
                    value={formData.family_children}
                    onChange={(e) => setFormData({...formData, family_children: e.target.value})}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>

              {/* Health and Dietary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="health_conditions">Health Conditions</Label>
                  <Textarea
                    id="health_conditions"
                    value={formData.health_conditions}
                    onChange={(e) => setFormData({...formData, health_conditions: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
                  <Textarea
                    id="dietary_restrictions"
                    value={formData.dietary_restrictions}
                    onChange={(e) => setFormData({...formData, dietary_restrictions: e.target.value})}
                  />
                </div>
              </div>

              {/* Language and Technology */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="preferred_language">Preferred Language</Label>
                  <Select value={formData.preferred_language} onValueChange={(value) => 
                    setFormData({...formData, preferred_language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
                      <SelectItem value="urdu">Urdu</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="bengali">Bengali</SelectItem>
                      <SelectItem value="punjabi">Punjabi</SelectItem>
                      <SelectItem value="farsi">Farsi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs_translation"
                    checked={formData.needs_translation}
                    onCheckedChange={(checked) => setFormData({...formData, needs_translation: checked as boolean})}
                  />
                  <Label htmlFor="needs_translation">Needs Translation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_smartphone"
                    checked={formData.has_smartphone}
                    onCheckedChange={(checked) => setFormData({...formData, has_smartphone: checked as boolean})}
                  />
                  <Label htmlFor="has_smartphone">Has Smartphone</Label>
                </div>
              </div>

              {/* Delivery Method */}
              <div>
                <Label htmlFor="delivery_method">Delivery Method</Label>
                <Select value={formData.delivery_method} onValueChange={(value: "doorstep" | "phone_confirmed" | "family_member") => 
                  setFormData({...formData, delivery_method: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doorstep">Doorstep Delivery</SelectItem>
                    <SelectItem value="phone_confirmed">Phone Confirmed</SelectItem>
                    <SelectItem value="family_member">Family Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Special Instructions */}
              <div>
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea
                  id="special_instructions"
                  value={formData.special_instructions}
                  onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
                />
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: checked as boolean})}
                />
                <Label htmlFor="active">Active Senior</Label>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSenior ? "Update Senior" : "Add Senior"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search seniors by name, address, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seniors</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Seniors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seniors ({filteredSeniors.length})
          </CardTitle>
          <CardDescription>
            Manage senior profiles and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSeniors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== "all" ? "No seniors match your filters" : "No seniors found"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSeniors.map((senior) => (
                <div key={senior.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{senior.name}</h3>
                        {getStatusBadge(senior.active)}
                        <Badge variant="outline">{senior.age} years old</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{senior.address}</span>
                        </div>
                        {senior.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{senior.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {senior.dietary_restrictions && (
                          <Badge variant="secondary">Dietary: {senior.dietary_restrictions}</Badge>
                        )}
                        {senior.needs_translation && (
                          <Badge variant="secondary">Needs Translation</Badge>
                        )}
                        {senior.has_smartphone && (
                          <Badge variant="secondary">Has Smartphone</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(senior)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(senior.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 