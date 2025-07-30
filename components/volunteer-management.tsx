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
  Mail, 
  MapPin,
  AlertCircle,
  CheckCircle,
  Users,
  Star,
  Calendar,
  CheckSquare,
  XSquare
} from "lucide-react"
import { SupabaseService } from "@/lib/supabase-service"
import { Volunteer } from "@/lib/supabase"

interface VolunteerManagementProps {
  onDataChange: () => void
}

export function VolunteerManagement({ onDataChange }: VolunteerManagementProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    languages: [] as string[],
    availability: [] as string[],
    vehicle_type: "car" as "car" | "truck" | "van" | "none",
    vehicle_capacity: "1",
    experience_level: "beginner" as "beginner" | "intermediate" | "experienced",
    special_skills: "",
    emergency_contact: "",
    active: true,
    notes: ""
  })

  const languageOptions = [
    "English", "Spanish", "Arabic", "Urdu", "Hindi", "Bengali", "Punjabi", "Farsi"
  ]

  const availabilityOptions = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ]

  useEffect(() => {
    loadVolunteers()
  }, [])

  useEffect(() => {
    filterVolunteers()
  }, [volunteers, searchTerm, statusFilter])

  const loadVolunteers = async () => {
    setIsLoading(true)
    try {
      // Load all volunteers for admin management (not just active ones)
      const result = await SupabaseService.getVolunteers()
      if (result.error) {
        setError("Failed to load volunteers: " + result.error.message)
      } else {
        setVolunteers(result.data || [])
      }
    } catch (error) {
      setError("Error loading volunteers: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const filterVolunteers = () => {
    let filtered = volunteers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(volunteer =>
        volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.phone?.includes(searchTerm)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(volunteer => 
        statusFilter === "active" ? volunteer.active : !volunteer.active
      )
    }

    setFilteredVolunteers(filtered)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      languages: [],
      availability: [],
      vehicle_type: "car",
      vehicle_capacity: "1",
      experience_level: "beginner",
      special_skills: "",
      emergency_contact: "",
      active: true,
      notes: ""
    })
    setEditingVolunteer(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const volunteerData = {
        ...formData,
        vehicle_capacity: parseInt(formData.vehicle_capacity),
        speaks_languages: formData.languages || [],
        role: editingVolunteer?.role || 'volunteer',
        profile_picture: editingVolunteer?.profile_picture || null,
        updated_at: new Date().toISOString(),
      }

      if (editingVolunteer) {
        // Update existing volunteer
        const result = await SupabaseService.updateVolunteer(editingVolunteer.id, volunteerData)
        if (result.error) {
          setError("Failed to update volunteer: " + result.error.message)
        } else {
          setSuccess("Volunteer updated successfully!")
          setIsAddDialogOpen(false)
          resetForm()
          loadVolunteers()
          onDataChange()
        }
      } else {
        // Create new volunteer
        const result = await SupabaseService.createVolunteer(volunteerData)
        if (result.error) {
          setError("Failed to create volunteer: " + result.error.message)
        } else {
          setSuccess("Volunteer created successfully!")
          setIsAddDialogOpen(false)
          resetForm()
          loadVolunteers()
          onDataChange()
        }
      }
    } catch (error) {
      setError("Error saving volunteer: " + (error as Error).message)
    }
  }

  const handleEdit = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer)
    setFormData({
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone || "",
      address: volunteer.address || "",
      languages: volunteer.languages || [],
      availability: volunteer.availability || [],
      vehicle_type: volunteer.vehicle_type,
      vehicle_capacity: (volunteer.vehicle_capacity ?? '').toString(),
      experience_level: volunteer.experience_level,
      special_skills: volunteer.special_skills || "",
      emergency_contact: volunteer.emergency_contact || "",
      active: volunteer.active,
      notes: volunteer.notes || ""
    })
    setIsAddDialogOpen(true)
  }

  const handleDelete = async (volunteerId: string) => {
    if (!confirm("Are you sure you want to permanently delete this volunteer? This action cannot be undone.")) return

    try {
      const result = await SupabaseService.deleteVolunteer(volunteerId)
      if (result.error) {
        setError("Failed to delete volunteer: " + result.error.message)
      } else {
        setSuccess("Volunteer deleted successfully!")
        loadVolunteers()
        onDataChange()
      }
    } catch (error) {
      setError("Error deleting volunteer: " + (error as Error).message)
    }
  }

  const getStatusBadge = (active: boolean) => {
    return active ? 
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge> :
      <Badge variant="secondary">Inactive</Badge>
  }

  const getExperienceBadge = (level: string) => {
    switch (level) {
      case "beginner":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Beginner</Badge>
      case "intermediate":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Intermediate</Badge>
      case "experienced":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Experienced</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }))
  }

  const toggleAvailability = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading volunteers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-green-800">Volunteer Management</h2>
          <p className="text-sm md:text-base text-gray-600">Manage volunteer profiles and assignments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="w-full sm:w-auto">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Volunteer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVolunteer ? "Edit Volunteer" : "Add New Volunteer"}
              </DialogTitle>
              <DialogDescription>
                {editingVolunteer ? "Update volunteer information" : "Add a new volunteer to the system"}
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
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
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              {/* Languages */}
              <div>
                <Label>Languages Spoken</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {languageOptions.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${language}`}
                        checked={formData.languages.includes(language)}
                        onCheckedChange={() => toggleLanguage(language)}
                      />
                      <Label htmlFor={`lang-${language}`} className="text-sm">{language}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <Label>Availability</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {availabilityOptions.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`avail-${day}`}
                        checked={formData.availability.includes(day)}
                        onCheckedChange={() => toggleAvailability(day)}
                      />
                      <Label htmlFor={`avail-${day}`} className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="vehicle_type">Vehicle Type</Label>
                  <Select value={formData.vehicle_type} onValueChange={(value: "car" | "truck" | "van" | "none") => 
                    setFormData({...formData, vehicle_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="none">No Vehicle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicle_capacity">Vehicle Capacity</Label>
                  <Input
                    id="vehicle_capacity"
                    type="number"
                    value={formData.vehicle_capacity}
                    onChange={(e) => setFormData({...formData, vehicle_capacity: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <Select value={formData.experience_level} onValueChange={(value: "beginner" | "intermediate" | "experienced") => 
                    setFormData({...formData, experience_level: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="experienced">Experienced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Special Skills */}
              <div>
                <Label htmlFor="special_skills">Special Skills</Label>
                <Textarea
                  id="special_skills"
                  value={formData.special_skills}
                  onChange={(e) => setFormData({...formData, special_skills: e.target.value})}
                  placeholder="e.g., Medical training, translation skills, etc."
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: checked as boolean})}
                />
                <Label htmlFor="active">Active Volunteer</Label>
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
                  {editingVolunteer ? "Update Volunteer" : "Add Volunteer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search volunteers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Volunteers</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Volunteers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Volunteers ({filteredVolunteers.length})
          </CardTitle>
          <CardDescription>
            Manage volunteer profiles and assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredVolunteers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== "all" ? "No volunteers match your filters" : "No volunteers found"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVolunteers.map((volunteer) => (
                <div key={volunteer.id} className="border rounded-lg p-3 md:p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg break-words">{volunteer.name}</h3>
                        <div className="flex flex-wrap gap-1">
                          {getStatusBadge(volunteer.active)}
                          {getExperienceBadge(volunteer.experience_level)}
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <Mail className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span className="break-all">{volunteer.email}</span>
                        </div>
                        {volunteer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span className="break-words">{volunteer.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {volunteer.languages && volunteer.languages.length > 0 && (
                          <Badge variant="secondary" className="text-xs">Languages: {volunteer.languages.join(", ")}</Badge>
                        )}
                        {volunteer.availability && volunteer.availability.length > 0 && (
                          <Badge variant="secondary" className="text-xs">Available: {volunteer.availability.join(", ")}</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{volunteer.vehicle_type} • Capacity: {volunteer.vehicle_capacity}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(volunteer)}
                        className="p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(volunteer.id)}
                        className="p-2 text-red-600 hover:text-red-700"
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