"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDelivery } from "@/contexts/delivery-context"
import { useAuth } from "@/contexts/auth-context"
import { SupabaseService } from "@/lib/supabase-service"
import { ArrowLeft, Phone, Navigation, MapPin, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react"
import type { Senior } from "@/lib/supabase"

interface SeniorProfileProps {
  seniorId: string
  onNavigate: (page: string) => void
  previousPage: string
}

export function SeniorProfile({ seniorId, onNavigate, previousPage }: SeniorProfileProps) {
  const { seniors, deliveries, isLoading, deliveryStatus, refreshData } = useDelivery()
  const { user } = useAuth()
  const [senior, setSenior] = useState<Senior | null>(null)
  const [deliveryNote, setDeliveryNote] = useState("")
  const [showNoteInput, setShowNoteInput] = useState(false)

  // Find the senior and delivery status
  const currentSenior = seniors.find((s) => s.id === seniorId)
  const currentDeliveryStatus = deliveryStatus[seniorId] || { isDelivered: false, status: "pending" }

  // Update senior state when seniors data changes
  useEffect(() => {
    if (currentSenior) {
      setSenior(currentSenior)
    }
  }, [currentSenior])

  const handleCall = (phone: string | null) => {
    if (phone) {
    window.open(`tel:${phone}`, "_self")
    }
  }

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://maps.google.com/?q=${encodedAddress}`, "_blank")
  }

  const handleMarkDelivered = async (checked: boolean | "indeterminate") => {
    // Handle the checked value properly (boolean | "indeterminate")
    if (typeof checked === "boolean") {
      try {
        // Find the delivery for this senior
        const delivery = deliveries.find(d => d.senior_id === seniorId)
        console.log("Senior:", seniorId, "Delivery found:", !!delivery, "Current status:", currentDeliveryStatus)
        
        if (delivery) {
          const newStatus = checked ? "delivered" : "pending"
          console.log(`Updating delivery ${delivery.id} to status: ${newStatus}`)
          
          const result = await SupabaseService.updateDelivery(delivery.id, { status: newStatus })
          
          if (result.success) {
            console.log("Delivery updated successfully")
            await refreshData()
          } else {
            console.error("Failed to update delivery:", result.error)
          }
        } else {
          console.warn("No delivery record found for senior:", seniorId)
          // Create a delivery record if it doesn't exist
          console.log("Creating delivery record for senior:", seniorId)
          
          if (user?.id) {
            const today = new Date().toISOString().split('T')[0]
            const result = await SupabaseService.createDelivery({
              senior_id: seniorId,
              volunteer_id: user.id,
              delivery_date: today,
              status: checked ? "delivered" : "pending"
            })
            
            if (result.data) {
              console.log("Delivery record created successfully")
              await refreshData()
            } else {
              console.error("Failed to create delivery record:", result.error)
            }
          } else {
            console.error("No current user found")
          }
        }
      } catch (error) {
        console.error("Error updating delivery status:", error)
      }
    }
  }

  const handleAddNote = async () => {
    if (deliveryNote.trim()) {
      // Find the delivery for this senior
      const delivery = deliveries.find(d => d.senior_id === seniorId)
      if (delivery) {
        await SupabaseService.updateDelivery(delivery.id, { notes: deliveryNote.trim() })
        setDeliveryNote("")
        setShowNoteInput(false)
        await refreshData()
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading senior profile...</p>
        </div>
      </div>
    )
  }

  if (!senior) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Senior not found</p>
          <Button onClick={() => onNavigate(previousPage)} className="mt-4">
            Go Back
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
              <Button variant="ghost" size="sm" onClick={() => onNavigate(previousPage)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{senior.name}</h1>
                <p className="text-sm text-gray-600">Senior Profile</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {currentDeliveryStatus.isDelivered ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Delivered
                </Badge>
              ) : (
                <Badge variant="outline" className="border-orange-200 text-orange-700">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Name</Label>
                <p className="text-gray-900">{senior.name}</p>
              </div>
              {senior.age && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Age</Label>
                  <p className="text-gray-900">{senior.age} years old</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700">Address</Label>
                <p className="text-gray-900">{senior.address}</p>
              </div>
            </div>
            
            {senior.phone && (
              <div className="flex items-start space-x-2">
                <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <Label className="text-sm font-medium text-gray-700">Phone</Label>
                  <p className="text-gray-900">{senior.phone}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              {senior.phone && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCall(senior.phone)}
                  disabled={false}
                  className="flex items-center"
                >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDirections(senior.address)}
                disabled={false}
                className="flex items-center"
              >
                    <Navigation className="w-4 h-4 mr-2" />
                    Directions
                  </Button>
            </div>
          </CardContent>
        </Card>

        {/* Health & Dietary Information */}
        <Card>
          <CardHeader>
            <CardTitle>Health & Dietary Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {senior.dietary_restrictions && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Dietary Restrictions</Label>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mt-1">
                  {senior.dietary_restrictions}
                  </Badge>
              </div>
            )}

            {senior.special_instructions && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Special Instructions</Label>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-1">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800 leading-relaxed">{senior.special_instructions}</p>
                  </div>
                </div>
              </div>
            )}

            {senior.health_conditions && (
              <div>
                <Label className="text-sm font-medium text-gray-700">Health Conditions</Label>
                <p className="text-gray-900">{senior.health_conditions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {senior.emergency_contact && (
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900">{senior.emergency_contact}</p>
            </CardContent>
          </Card>
        )}

        {/* Delivery Status */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={currentDeliveryStatus.isDelivered}
                onCheckedChange={handleMarkDelivered}
                disabled={false}
                className="w-6 h-6"
              />
              <Label className="text-lg font-medium">
                {currentDeliveryStatus.isDelivered ? "Delivered" : "Mark as Delivered"}
              </Label>

            </div>

            {!currentDeliveryStatus.isDelivered && (
              <div className="space-y-3">
            <Button
              variant="outline"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  disabled={false}
                  className="w-full"
                >
                  Add Delivery Note
            </Button>

                {showNoteInput && (
            <div className="space-y-3">
                    <Textarea
                      placeholder="Add any notes about this delivery..."
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      disabled={false}
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleAddNote}
                        disabled={!deliveryNote.trim()}
                        className="flex-1"
                      >
                        Save Note
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowNoteInput(false)
                          setDeliveryNote("")
                        }}
                        disabled={false}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}


          </CardContent>
        </Card>
      </div>
    </div>
  )
}
