"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SupabaseService } from "@/lib/supabase-service"
import type { Senior } from "@/lib/supabase"
import { ArrowLeft, Search, Plus, Upload, Edit, UserX, Users, Phone, MapPin } from "lucide-react"

interface ManageSeniorsProps {
  onNavigate: (page: string) => void
  onEditSenior: (senior: Senior) => void
}

export function ManageSeniors({ onNavigate, onEditSenior }: ManageSeniorsProps) {
  const [seniors, setSeniors] = useState<Senior[]>([])
  const [filteredSeniors, setFilteredSeniors] = useState<Senior[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    loadSeniors()
  }, [showInactive])

  useEffect(() => {
    const filtered = seniors.filter(
      (senior) =>
        senior.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        senior.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        senior.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredSeniors(filtered)
  }, [seniors, searchTerm])

  const loadSeniors = async () => {
    try {
      // Load all seniors for admin management (not just active ones)
      const { data, error } = await SupabaseService.getSeniors()
      if (error) throw error
      setSeniors(data || [])
    } catch (error) {
      console.error("Error loading seniors:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivateSenior = async (seniorId: string) => {
    if (!confirm("Are you sure you want to deactivate this senior?")) return

    try {
      await SupabaseService.updateSenior(seniorId, { active: false })
      loadSeniors()
    } catch (error) {
      console.error("Error deactivating senior:", error)
      alert("Error deactivating senior. Please try again.")
    }
  }

  const handleReactivateSenior = async (seniorId: string) => {
    try {
      await SupabaseService.updateSenior(seniorId, { active: true })
      loadSeniors()
    } catch (error) {
      console.error("Error reactivating senior:", error)
      alert("Error reactivating senior. Please try again.")
    }
  }

  const handleDeleteSenior = async (seniorId: string) => {
    if (!confirm("Are you sure you want to permanently delete this senior? This action cannot be undone.")) return

    try {
      await SupabaseService.deleteSenior(seniorId)
      loadSeniors()
    } catch (error) {
      console.error("Error deleting senior:", error)
      alert("Error deleting senior. Please try again.")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const activeSeniors = seniors.filter((s) => s.active).length
  const inactiveSeniors = seniors.filter((s) => !s.active).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seniors...</p>
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
                <h1 className="text-lg font-semibold text-gray-900">Manage Seniors</h1>
                <p className="text-sm text-gray-600">{seniors.length} total seniors</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                onClick={() => onNavigate("csv-import")}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Import CSV</span>
                <span className="sm:hidden">Import</span>
              </Button>
              <Button onClick={() => onNavigate("add-senior")} className="bg-green-600 hover:bg-green-700" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Senior</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search seniors by name, address, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showInactive ? "default" : "outline"}
                onClick={() => setShowInactive(!showInactive)}
                size="sm"
              >
                {showInactive ? "Show Active Only" : "Show All"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{activeSeniors}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <UserX className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Inactive</span>
              </div>
              <p className="text-2xl font-bold text-gray-600">{inactiveSeniors}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{seniors.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Seniors List */}
        <div className="space-y-4">
          {filteredSeniors.map((senior) => (
            <Card key={senior.id} className={`hover:shadow-md transition-shadow ${!senior.active ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-sm">
                        {getInitials(senior.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base leading-tight">{senior.name}</h3>
                          <p className="text-sm text-gray-600">
                            Age: {senior.age} • {senior.household_type}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {senior.active ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs px-2 py-1">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="ml-15 space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{senior.address}</span>
                    </div>
                    {senior.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{senior.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="ml-15 space-y-2">
                    {senior.dietary_restrictions && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Dietary: </span>
                        <span className="text-sm text-gray-700">{senior.dietary_restrictions}</span>
                      </div>
                    )}
                    {senior.health_conditions && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">Health: </span>
                        <span className="text-sm text-gray-700">{senior.health_conditions}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-15 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditSenior(senior)}
                      className="flex items-center justify-center min-h-[44px] flex-1 sm:flex-none"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>

                    {senior.active ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeactivateSenior(senior.id)}
                        className="flex items-center justify-center min-h-[44px] flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReactivateSenior(senior.id)}
                        className="flex items-center justify-center min-h-[44px] flex-1 sm:flex-none text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Reactivate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteSenior(senior.id)}
                      className="flex items-center justify-center min-h-[44px] flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredSeniors.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No seniors found</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {searchTerm
                  ? `No seniors match "${searchTerm}". Try a different search term.`
                  : "No seniors are currently in the system."}
              </p>
              <Button onClick={() => onNavigate("add-senior")} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add First Senior
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
