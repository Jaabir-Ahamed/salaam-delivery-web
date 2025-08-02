"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useDelivery } from "@/contexts/delivery-context"
import { ArrowLeft, Phone, Navigation, MapPin, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { SupabaseService } from "@/lib/supabase-service"

interface DeliveryChecklistProps {
  onNavigate: (page: string) => void
  onSelectSenior: (seniorId: string) => void
}

export function DeliveryChecklist({ onNavigate, onSelectSenior }: DeliveryChecklistProps) {
  const { 
    seniors, 
    deliveries,
    isLoading,
    deliveryStatus,
    refreshData
  } = useDelivery()

  // Calculate counts from the data
  const completedCount = Object.values(deliveryStatus).filter(status => status.isDelivered).length
  const totalCount = seniors.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleCall = (phone: string | null) => {
    if (phone) {
    window.open(`tel:${phone}`, "_self")
    }
  }

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://maps.google.com/?q=${encodedAddress}`, "_blank")
  }

  const handleCompleteAll = async () => {
    // Mark all deliveries as completed
    for (const senior of seniors) {
      const delivery = deliveries.find(d => d.senior_id === senior.id)
      if (delivery && delivery.status !== "delivered") {
        await SupabaseService.updateDelivery(delivery.id, { status: "delivered" })
      }
    }
    await refreshData()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delivery checklist...</p>
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
                <h1 className="text-lg font-semibold text-gray-900">Delivery Checklist</h1>
                <p className="text-sm text-gray-600">December 2024</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {completedCount} of {totalCount}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Progress Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {completedCount} deliveries completed, {totalCount - completedCount} remaining
            </p>
          </CardContent>
        </Card>

        {/* Delivery List */}
        <div className="space-y-4">
          {seniors.map((senior) => {
            const seniorDeliveryStatus = deliveryStatus[senior.id] || { isDelivered: false, status: "pending" }
            return (
            <Card
              key={senior.id}
                className={`transition-all ${seniorDeliveryStatus.isDelivered ? "bg-green-50 border-green-200" : "bg-white"}`}
            >
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header Row with Checkbox */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-1">
                      <Checkbox
                        checked={seniorDeliveryStatus.isDelivered}
                        onCheckedChange={async (checked) => {
                          const delivery = deliveries.find(d => d.senior_id === senior.id)
                          if (delivery) {
                            const newStatus = checked ? "delivered" : "pending"
                            await SupabaseService.updateDelivery(delivery.id, { status: newStatus })
                            await refreshData()
                          } else {
                            console.warn("No delivery record found for senior:", senior.id)
                          }
                        }}
                        className="w-6 h-6"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">{senior.name}</h3>
                        <div className="flex-shrink-0 ml-2">
                            {seniorDeliveryStatus.isDelivered ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Completed
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
                  <div className="flex items-start space-x-2 ml-9">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 leading-relaxed">{senior.address}</span>
                  </div>

                  {/* Dietary Restrictions */}
                    {senior.dietary_restrictions && (
                    <div className="ml-9">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                          {senior.dietary_restrictions}
                          </Badge>
                    </div>
                  )}

                    {/* Special Instructions */}
                    {senior.special_instructions && (
                    <div className="ml-9">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-amber-800 leading-relaxed">{senior.special_instructions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="ml-9 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCall(senior.phone)}
                      className="flex items-center justify-center min-h-[44px] flex-1 sm:flex-none"
                        disabled={!senior.phone}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDirections(senior.address)}
                      className="flex items-center justify-center min-h-[44px] flex-1 sm:flex-none"
  
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Directions
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold min-h-[44px] flex-1 sm:flex-none"
                      onClick={() => onSelectSenior(senior.id)}

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

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-green-50 to-orange-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Great Progress!</h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              You've completed {completedCount} out of {totalCount} deliveries today.
            </p>
            {completedCount === totalCount ? (
              <Badge className="bg-green-600 text-white px-4 py-2">All Deliveries Complete! 🎉</Badge>
            ) : (
              <div className="space-y-3">
              <p className="text-sm text-gray-500">Keep up the amazing work serving our community!</p>
                <Button
                  onClick={handleCompleteAll}
                  disabled={completedCount === totalCount}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2"
                >
                  Mark All as Complete
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
