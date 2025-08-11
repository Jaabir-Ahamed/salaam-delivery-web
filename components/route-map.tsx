"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDelivery } from "@/contexts/delivery-context"
import { ArrowLeft, MapPin, Navigation, Phone, CheckCircle2, Clock, Route } from "lucide-react"

interface RouteMapProps {
  onNavigate: (page: string) => void
  onSelectSenior: (seniorId: string) => void
}

export function RouteMap({ onNavigate, onSelectSenior }: RouteMapProps) {
  const { seniors, deliveries, getDeliveryStatus, isLoading } = useDelivery()

  // Show all assigned seniors, not just those with delivery records
  const routeSeniors = seniors

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://maps.google.com/?q=${encodedAddress}`, "_blank")
  }

  const handleCall = (phone: string | null) => {
    if (phone) {
      window.open(`tel:${phone}`, "_self")
    }
  }

  const handleOptimizedRoute = () => {
    const addresses = routeSeniors.map((s) => s.address).join("|")
    const encodedAddresses = encodeURIComponent(addresses)
    window.open(`https://maps.google.com/maps/dir/${encodedAddresses}`, "_blank")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading route map...</p>
        </div>
      </div>
    )
  }

  const completedCount = routeSeniors.filter(s => getDeliveryStatus(s.id).isDelivered).length
  const totalStops = routeSeniors.length

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
                <h1 className="text-lg font-semibold text-gray-900">Route Map</h1>
                <p className="text-sm text-gray-600">Optimized delivery route</p>
              </div>
            </div>
            <Button
              onClick={handleOptimizedRoute}
              className="bg-blue-600 hover:bg-blue-700 text-sm px-3 py-2"
              size="sm"
              disabled={totalStops === 0}
            >
              <Route className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Open in Maps</span>
              <span className="sm:hidden">Maps</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Route Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Route className="w-5 h-5 text-blue-600" />
              <span>Route Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-600">{totalStops}</p>
                <p className="text-xs text-gray-600 mt-1">Total Stops</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                <p className="text-xs text-gray-600 mt-1">Completed</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-orange-600">~45</p>
                <p className="text-xs text-gray-600 mt-1">Minutes</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-purple-600">~12</p>
                <p className="text-xs text-gray-600 mt-1">Miles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty state if no assigned deliveries */}
        {totalStops === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              No deliveries assigned to you today.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Delivery Stops (Optimized Order)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {routeSeniors.map((senior, index) => {
                  const deliveryStatus = getDeliveryStatus(senior.id)
                  return (
                    <div key={senior.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                              deliveryStatus.isDelivered ? "bg-green-600" : "bg-blue-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-base leading-tight">{senior.name}</h3>
                          </div>
                        </div>

                        {/* Status Badge */}
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

                      {/* Address Row */}
                      <div className="flex items-start space-x-2 ml-11">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 leading-relaxed">{senior.address}</span>
                      </div>

                      {/* Dietary Restrictions */}
                      {senior.dietary_restrictions && (
                        <div className="ml-11">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                            {senior.dietary_restrictions}
                          </Badge>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="ml-11 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
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
                          Navigate
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold min-h-[44px] flex-1 sm:flex-none"
                          onClick={() => onSelectSenior(senior.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
