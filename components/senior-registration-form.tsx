"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SupabaseService } from "@/lib/supabase-service"
import { ArrowLeft, Save, Loader2, Languages, Smartphone, Phone } from "lucide-react"
import type { Senior } from "@/lib/supabase"

interface SeniorRegistrationFormProps {
  onNavigate: (page: string) => void
  onSuccess: () => void
  editingSenior?: Senior | null
}

export function SeniorRegistrationForm({ onNavigate, onSuccess, editingSenior }: SeniorRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: editingSenior?.name || "",
    age: editingSenior?.age || "",
    household_type: editingSenior?.household_type || "single",
    family_adults: editingSenior?.family_adults || 1,
    family_children: editingSenior?.family_children || 0,
    race_ethnicity: editingSenior?.race_ethnicity || "",
    health_conditions: editingSenior?.health_conditions || "",
    address: editingSenior?.address || "",
    dietary_restrictions: editingSenior?.dietary_restrictions || "",
    phone: editingSenior?.phone || "",
    emergency_contact: editingSenior?.emergency_contact || "",
    has_smartphone: editingSenior?.has_smartphone || false,
    preferred_language: editingSenior?.preferred_language || "english",
    needs_translation: editingSenior?.needs_translation || false,
    delivery_method: editingSenior?.delivery_method || "doorstep",
    special_instructions: editingSenior?.special_instructions || "",
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const seniorData = {
        ...formData,
        age: Number.parseInt(formData.age.toString()),
        active: true,
      }

      if (editingSenior) {
        await SupabaseService.updateSenior(editingSenior.id, seniorData)
      } else {
        await SupabaseService.createSenior(seniorData)
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving senior:", error)
      alert("Error saving senior information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const languageOptions = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "arabic", label: "Arabic" },
    { value: "urdu", label: "Urdu" },
    { value: "hindi", label: "Hindi" },
    { value: "bengali", label: "Bengali" },
    { value: "punjabi", label: "Punjabi" },
    { value: "farsi", label: "Farsi" },
    { value: "other", label: "Other" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("manage-seniors")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {editingSenior ? "Edit Senior" : "Add New Senior"}
              </h1>
              <p className="text-sm text-gray-600">Enter senior information with accessibility preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Senior Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Household Type */}
              <div className="space-y-3">
                <Label>Household Type *</Label>
                <RadioGroup
                  value={formData.household_type}
                  onValueChange={(value) => handleInputChange("household_type", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single Person</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="family" id="family" />
                    <Label htmlFor="family">Family</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Family Details */}
              {formData.household_type === "family" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="family_adults">Number of Adults</Label>
                    <Input
                      id="family_adults"
                      type="number"
                      min="1"
                      value={formData.family_adults}
                      onChange={(e) => handleInputChange("family_adults", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="family_children">Number of Children</Label>
                    <Input
                      id="family_children"
                      type="number"
                      min="0"
                      value={formData.family_children}
                      onChange={(e) => handleInputChange("family_children", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Accessibility Features */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Languages className="w-5 h-5 text-blue-600" />
                    <span>Accessibility & Communication Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Language Preferences */}
                  <div className="space-y-2">
                    <Label htmlFor="preferred_language">Preferred Language *</Label>
                    <Select
                      value={formData.preferred_language}
                      onValueChange={(value) => handleInputChange("preferred_language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Translation Needs */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="needs_translation"
                      checked={formData.needs_translation}
                      onCheckedChange={(checked) => handleInputChange("needs_translation", checked)}
                    />
                    <Label htmlFor="needs_translation" className="text-sm">
                      Needs translation assistance (requires volunteer who speaks this language)
                    </Label>
                  </div>

                  {/* Smartphone Status */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_smartphone"
                      checked={formData.has_smartphone}
                      onCheckedChange={(checked) => handleInputChange("has_smartphone", checked)}
                    />
                    <Label htmlFor="has_smartphone" className="text-sm flex items-center space-x-2">
                      <Smartphone className="w-4 h-4" />
                      <span>Has smartphone (can receive text messages)</span>
                    </Label>
                  </div>

                  {/* Delivery Method */}
                  <div className="space-y-2">
                    <Label>Preferred Delivery Confirmation Method *</Label>
                    <RadioGroup
                      value={formData.delivery_method}
                      onValueChange={(value) => handleInputChange("delivery_method", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="doorstep" id="doorstep" />
                        <Label htmlFor="doorstep" className="text-sm">
                          Doorstep delivery (no confirmation needed)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone_confirmed" id="phone_confirmed" />
                        <Label htmlFor="phone_confirmed" className="text-sm flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>Phone confirmation required</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="family_member" id="family_member" />
                        <Label htmlFor="family_member" className="text-sm">
                          Confirm with family member/caregiver
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Race/Ethnicity */}
              <div className="space-y-2">
                <Label htmlFor="race_ethnicity">Race/Ethnicity</Label>
                <Select
                  value={formData.race_ethnicity}
                  onValueChange={(value) => handleInputChange("race_ethnicity", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select race/ethnicity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="African American">African American</SelectItem>
                    <SelectItem value="Asian">Asian</SelectItem>
                    <SelectItem value="Caucasian">Caucasian</SelectItem>
                    <SelectItem value="Hispanic">Hispanic</SelectItem>
                    <SelectItem value="Native American">Native American</SelectItem>
                    <SelectItem value="Pacific Islander">Pacific Islander</SelectItem>
                    <SelectItem value="South Asian">South Asian</SelectItem>
                    <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Health and Dietary Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="health_conditions">Health Conditions</Label>
                  <Textarea
                    id="health_conditions"
                    value={formData.health_conditions}
                    onChange={(e) => handleInputChange("health_conditions", e.target.value)}
                    placeholder="List any relevant health conditions..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
                  <Textarea
                    id="dietary_restrictions"
                    value={formData.dietary_restrictions}
                    onChange={(e) => handleInputChange("dietary_restrictions", e.target.value)}
                    placeholder="List any dietary restrictions or preferences..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Textarea
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => handleInputChange("emergency_contact", e.target.value)}
                  placeholder="Name, relationship, and phone number..."
                  rows={2}
                />
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea
                  id="special_instructions"
                  value={formData.special_instructions}
                  onChange={(e) => handleInputChange("special_instructions", e.target.value)}
                  placeholder="Any special delivery instructions, accessibility needs, or important notes..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => onNavigate("manage-seniors")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingSenior ? "Update Senior" : "Add Senior"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
