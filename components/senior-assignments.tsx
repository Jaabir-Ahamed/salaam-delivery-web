"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SupabaseService } from "@/lib/supabase-service"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Users, UserPlus, UserMinus, Edit, Trash2, Search, Filter, Plus, CheckCircle, XCircle, Clock } from "lucide-react"
// Lazy import to avoid build-time initialization
let supabase: any = null
const getSupabase = () => {
  if (!supabase) {
    supabase = require("@/lib/supabase").supabase
  }
  return supabase
}
import type { Senior, Volunteer, SeniorAssignmentView } from "@/lib/supabase"

interface SeniorAssignmentsProps {
  onNavigate: (page: string) => void
}

export function SeniorAssignments({ onNavigate }: SeniorAssignmentsProps) {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<any[]>([])
  const [seniors, setSeniors] = useState<Senior[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [unassignedSeniors, setUnassignedSeniors] = useState<Senior[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "completed">("all")
  const [filterVolunteer, setFilterVolunteer] = useState("all")
  
  // Assignment dialog state
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)
  const [selectedSenior, setSelectedSenior] = useState<string>("")
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>("")
  const [assignmentNotes, setAssignmentNotes] = useState("")
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split('T')[0])

  // Bulk assignment state
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [bulkVolunteerId, setBulkVolunteerId] = useState("")
  const [bulkSelectedSeniors, setBulkSelectedSeniors] = useState<string[]>([])
  const [bulkAssignmentDate, setBulkAssignmentDate] = useState(new Date().toISOString().split('T')[0])
  const [bulkNotes, setBulkNotes] = useState("")

  useEffect(() => {
    loadData()
    setupRealtimeSubscription()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError("")

      // Load all data in parallel
      const [assignmentsResult, seniorsResult, volunteersResult, unassignedResult] = await Promise.all([
        SupabaseService.getSeniorAssignments(),
        SupabaseService.getSeniors(),
        SupabaseService.getVolunteers(),
        SupabaseService.getUnassignedSeniors()
      ])

      if (assignmentsResult.error) throw new Error(typeof assignmentsResult.error === 'string' ? assignmentsResult.error : 'Failed to load assignments')
      if (seniorsResult.error) throw new Error(typeof seniorsResult.error === 'string' ? seniorsResult.error : 'Failed to load seniors')
      if (volunteersResult.error) throw new Error(typeof volunteersResult.error === 'string' ? volunteersResult.error : 'Failed to load volunteers')
      if (unassignedResult.error) throw new Error(typeof unassignedResult.error === 'string' ? unassignedResult.error : 'Failed to load unassigned seniors: ' + JSON.stringify(unassignedResult.error))

      setAssignments(assignmentsResult.data || [])
      setSeniors(seniorsResult.data || [])
      setVolunteers(volunteersResult.data || [])
      setUnassignedSeniors(unassignedResult.data || [])
    } catch (error) {
      setError("Failed to load data: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const subscription = getSupabase()
      .channel('senior_assignments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'senior_assignments'
        },
        () => {
          // Reload data when assignments change
          loadData()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const handleCreateAssignment = async () => {
    if (!selectedSenior || !selectedVolunteer) {
      setError("Please select both a senior and a volunteer")
      return
    }

    try {
      setIsSaving(true)
      setError("")

      // Debug: Check authentication and admin status
      console.log("Current user:", user)
      const isAdmin = await SupabaseService.isCurrentUserAdmin()
      console.log("Is admin:", isAdmin)

      const result = await SupabaseService.createSeniorAssignment({
        senior_id: selectedSenior,
        volunteer_id: selectedVolunteer,
        assignment_date: assignmentDate,
        notes: assignmentNotes || null,
        status: "active",
        assigned_by: null
      })

      if (result.error) {
        throw new Error(typeof result.error === 'string' ? result.error : 'Failed to create assignment')
      }

      setSuccess("Assignment created successfully!")
      setIsAssignmentDialogOpen(false)
      resetAssignmentForm()
      await loadData()
    } catch (error) {
      setError("Failed to create assignment: " + (error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateAssignment = async (assignmentId: string, updates: any) => {
    try {
      setIsSaving(true)
      setError("")

      const result = await SupabaseService.updateSeniorAssignment(assignmentId, updates)
      if (result.error) {
        throw new Error(typeof result.error === 'string' ? result.error : 'Failed to update assignment')
      }

      setSuccess("Assignment updated successfully!")
      await loadData()
    } catch (error) {
      setError("Failed to update assignment: " + (error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return

    try {
      setIsSaving(true)
      setError("")

      const result = await SupabaseService.deleteSeniorAssignment(assignmentId)
      if (result.error) {
        throw new Error(typeof result.error === 'string' ? result.error : 'Failed to delete assignment')
      }

      setSuccess("Assignment deleted successfully!")
      await loadData()
    } catch (error) {
      setError("Failed to delete assignment: " + (error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBulkAssign = async () => {
    if (bulkSelectedSeniors.length === 0) {
      setError("Please select at least one senior")
      return
    }

    if (!bulkVolunteerId) {
      setError("Please select a volunteer")
      return
    }

    try {
      setIsSaving(true)
      setError("")

      const result = await SupabaseService.bulkAssignSeniors(bulkSelectedSeniors, bulkVolunteerId, bulkAssignmentDate)
      if (result.error) {
        throw new Error(typeof result.error === 'string' ? result.error : 'Failed to create bulk assignments')
      }

      setSuccess(`${bulkSelectedSeniors.length} assignments created successfully!`)
      setIsBulkDialogOpen(false)
      resetBulkAssignmentForm()
      await loadData()
    } catch (error) {
      setError("Failed to create bulk assignments: " + (error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleSeniorSelection = (seniorId: string) => {
    setBulkSelectedSeniors(prev => 
      prev.includes(seniorId) 
        ? prev.filter(id => id !== seniorId)
        : [...prev, seniorId]
    )
  }

  const resetBulkAssignmentForm = () => {
    setBulkVolunteerId("")
    setBulkSelectedSeniors([])
    setBulkAssignmentDate(new Date().toISOString().split('T')[0])
    setBulkNotes("")
  }

  const resetAssignmentForm = () => {
    setSelectedSenior("")
    setSelectedVolunteer("")
    setAssignmentNotes("")
    setAssignmentDate(new Date().toISOString().split('T')[0])
  }

  const filteredAssignments = assignments.filter(assignment => {
    // Handle the actual data structure with nested objects
    const seniorName = assignment.seniors?.name || assignment.senior_name || ""
    const volunteerName = assignment.volunteers?.name || assignment.volunteer_name || ""
    const seniorAddress = assignment.seniors?.address || assignment.senior_address || ""
    
    const matchesSearch = 
      seniorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seniorAddress.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || assignment.status === filterStatus
    const matchesVolunteer = filterVolunteer === "all" || assignment.volunteer_id === filterVolunteer

    return matchesSearch && matchesStatus && matchesVolunteer
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case "inactive":
        return <Badge variant="outline" className="text-gray-600"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading senior assignments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => onNavigate("dashboard")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Senior Assignments</h1>
                <p className="text-sm text-gray-600">Manage senior-to-volunteer assignments</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Users className="w-4 h-4 mr-2" />
                    Bulk Assign
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Bulk Assign Seniors</DialogTitle>
                    <DialogDescription>
                      Select one volunteer and multiple seniors to assign
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* Volunteer Selection */}
                    <div>
                      <Label htmlFor="volunteer">Volunteer</Label>
                      <Select value={bulkVolunteerId} onValueChange={setBulkVolunteerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a volunteer" />
                        </SelectTrigger>
                        <SelectContent>
                          {volunteers.filter((v: any) => v.active).map((volunteer: any) => (
                            <SelectItem key={volunteer.id} value={volunteer.id}>
                              {volunteer.name} ({volunteer.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assignment Date */}
                    <div>
                      <Label htmlFor="date">Assignment Date</Label>
                      <Input
                        type="date"
                        value={bulkAssignmentDate}
                        onChange={(e) => setBulkAssignmentDate(e.target.value)}
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        placeholder="Add any notes about these assignments..."
                        value={bulkNotes}
                        onChange={(e) => setBulkNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {/* Senior Selection */}
                    <div>
                      <Label>Select Seniors ({bulkSelectedSeniors.length} selected)</Label>
                      <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                        {unassignedSeniors.map((senior: any) => (
                          <div key={senior.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`senior-${senior.id}`}
                              checked={bulkSelectedSeniors.includes(senior.id)}
                              onChange={() => toggleSeniorSelection(senior.id)}
                              className="rounded"
                            />
                            <label htmlFor={`senior-${senior.id}`} className="text-sm flex-1 cursor-pointer">
                              <div className="font-medium">{senior.name}</div>
                              <div className="text-gray-500 text-xs">{senior.address}</div>
                            </label>
                          </div>
                        ))}
                        {unassignedSeniors.length === 0 && (
                          <div className="text-gray-500 text-sm py-2">No unassigned seniors available</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsBulkDialogOpen(false)
                      resetBulkAssignmentForm()
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkAssign} disabled={isSaving || bulkSelectedSeniors.length === 0 || !bulkVolunteerId}>
                      {isSaving ? "Creating..." : `Create ${bulkSelectedSeniors.length} Assignments`}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Senior
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Senior to Volunteer</DialogTitle>
                    <DialogDescription>
                      Create a new assignment for a senior to a volunteer
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="senior">Senior</Label>
                      <Select value={selectedSenior} onValueChange={setSelectedSenior}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a senior" />
                        </SelectTrigger>
                        <SelectContent>
                          {unassignedSeniors.map((senior) => (
                            <SelectItem key={senior.id} value={senior.id}>
                              {senior.name} - {senior.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="volunteer">Volunteer</Label>
                      <Select value={selectedVolunteer} onValueChange={setSelectedVolunteer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a volunteer" />
                        </SelectTrigger>
                        <SelectContent>
                          {volunteers.filter(v => v.active).map((volunteer) => (
                            <SelectItem key={volunteer.id} value={volunteer.id}>
                              {volunteer.name} ({volunteer.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Assignment Date</Label>
                      <Input
                        type="date"
                        value={assignmentDate}
                        onChange={(e) => setAssignmentDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        placeholder="Add any notes about this assignment..."
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAssignmentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAssignment} disabled={isSaving || !selectedSenior || !selectedVolunteer}>
                      {isSaving ? "Creating..." : "Create Assignment"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Total Assignments</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{assignments.length}</p>
                </div>
                <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Active Assignments</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    {assignments.filter(a => a.status === "active").length}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Unassigned Seniors</p>
                  <p className="text-xl md:text-2xl font-bold text-orange-600">{unassignedSeniors.length}</p>
                </div>
                <UserMinus className="w-6 h-6 md:w-8 md:h-8 text-orange-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-gray-600 truncate">Active Volunteers</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-600">
                    {volunteers.filter(v => v.active).length}
                  </p>
                </div>
                <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterVolunteer} onValueChange={setFilterVolunteer}>
                  <SelectTrigger className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by volunteer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Volunteers</SelectItem>
                    {volunteers.filter(v => v.active).map((volunteer) => (
                      <SelectItem key={volunteer.id} value={volunteer.id}>
                        {volunteer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Senior Assignments</CardTitle>
            <CardDescription>
              {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Senior</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <div className="font-medium break-words">{assignment.seniors?.name || assignment.senior_name || "Unknown Senior"}</div>
                          {assignment.seniors?.building && (
                            <div className="text-sm text-gray-500 break-words">{assignment.seniors.building} {assignment.seniors.unit_apt}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0">
                        <div className="max-w-[200px] md:max-w-xs">
                          <div className="text-sm break-words">{assignment.seniors?.address || assignment.senior_address || "No address"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <div className="font-medium break-words">{assignment.volunteers?.name || assignment.volunteer_name || "Unknown Volunteer"}</div>
                          <div className="text-sm text-gray-500 break-words">{assignment.volunteers?.email || assignment.volunteer_email || "No email"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">{assignment.assigned_by_name || "System"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(assignment.assignment_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(assignment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Select
                            value={assignment.status}
                            onValueChange={(value: any) => handleUpdateAssignment(assignment.id, { status: value })}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            disabled={isSaving}
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
              {filteredAssignments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No assignments found matching your criteria
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 