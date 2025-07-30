"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useDelivery } from "@/contexts/delivery-context"
import { ArrowLeft, Search, Phone, MapPin, Users, CheckCircle2, Clock } from "lucide-react"

interface SeniorsListProps {
  onNavigate: (page: string) => void
  onSelectSenior: (seniorId: string) => void
}

export function SeniorsList({ onNavigate, onSelectSenior }: SeniorsListProps) {
  const { seniors, getDeliveryStatus, isLoading, isSaving } = useDelivery()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all")

  const filteredSeniors = seniors.filter((senior) => {
    const matchesSearch = senior.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         senior.address.toLowerCase().includes(searchTerm.toLowerCase())
    const deliveryStatus = getDeliveryStatus(senior.id)
    
    if (filter === "completed") return matchesSearch && deliveryStatus.isDelivered
    if (filter === "pending") return matchesSearch && !deliveryStatus.isDelivered
    return matchesSearch
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (phone) {
    window.open(`tel:${phone}`, "_self")
    }
  }

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
                <h1 className="text-lg font-semibold text-gray-900">Seniors Directory</h1>
                <p className="text-sm text-gray-600">{seniors.length} seniors in program</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">{filteredSeniors.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search seniors by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Filter Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                disabled={isSaving}
                className="flex-1"
              >
                All ({seniors.length})
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
                disabled={isSaving}
                className="flex-1"
              >
                Completed ({seniors.filter((s) => getDeliveryStatus(s.id).isDelivered).length})
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
                disabled={isSaving}
                className="flex-1"
              >
                Pending ({seniors.filter((s) => !getDeliveryStatus(s.id).isDelivered).length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{seniors.length}</p>
              <p className="text-xs text-gray-500">Seniors</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Delivered</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{seniors.filter((s) => getDeliveryStatus(s.id).isDelivered).length}</p>
              <p className="text-xs text-gray-500">This Month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{seniors.filter((s) => !getDeliveryStatus(s.id).isDelivered).length}</p>
              <p className="text-xs text-gray-500">Remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">Special</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{seniors.filter((s) => s.dietary_restrictions).length}</p>
              <p className="text-xs text-gray-500">Dietary Needs</p>
            </CardContent>
          </Card>
        </div>

        {/* Seniors List */}
        <div className="space-y-4">
          {filteredSeniors.map((senior) => {
            const deliveryStatus = getDeliveryStatus(senior.id)
            return (
            <Card key={senior.id} className="hover:shadow-md transition-shadow">
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
                        <h3 className="font-semibold text-gray-900 text-base leading-tight">{senior.name}</h3>
                        <div className="flex-shrink-0 ml-2">
                            {deliveryStatus.isDelivered ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Delivered
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-200 text-orange-700 text-xs px-2 py-1">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Row */}
                  <div className="flex items-start space-x-2 ml-15">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 leading-relaxed">{senior.address}</span>
                  </div>

                  {/* Phone Row */}
                    {senior.phone && (
                      <div className="flex items-start space-x-2 ml-15">
                        <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 leading-relaxed">{senior.phone}</span>
                  </div>
                    )}

                  {/* Dietary Restrictions */}
                    {senior.dietary_restrictions && (
                    <div className="ml-15">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                          {senior.dietary_restrictions}
                          </Badge>
                    </div>
                  )}

                    {/* Special Instructions */}
                    {senior.special_instructions && (
                      <div className="ml-15 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <span className="text-xs font-medium text-yellow-800">Note:</span>
                          <span className="text-xs text-yellow-700 leading-relaxed">{senior.special_instructions}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="ml-15 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                        onClick={(e) => senior.phone && handleCall(senior.phone, e)}
                      className="flex items-center justify-center min-h-[44px] flex-1 sm:flex-none"
                        disabled={!senior.phone || isSaving}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>

                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold min-h-[44px] flex-1 sm:flex-none"
                      onClick={() => onSelectSenior(senior.id)}
                        disabled={isSaving}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>

        {/* No Results */}
        {filteredSeniors.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No seniors found</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {searchTerm
                  ? `No seniors match "${searchTerm}". Try a different search term.`
                  : "No seniors are currently in the system."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
