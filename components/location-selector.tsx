"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, X, GraduationCap, Briefcase } from "lucide-react"

interface LocationSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (location: string, userType: "student" | "professional") => void
}

export function LocationSelector({ isOpen, onClose, onSave }: LocationSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedUserType, setSelectedUserType] = useState<"student" | "professional">("professional")

  const popularLocations = [
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Houston, TX",
    "Phoenix, AZ",
    "Philadelphia, PA",
    "San Antonio, TX",
    "San Diego, CA",
    "Dallas, TX",
    "San Jose, CA",
    "Austin, TX",
    "Jacksonville, FL",
  ]

  const handleSave = () => {
    if (selectedLocation) {
      onSave(selectedLocation, selectedUserType)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Set Your Profile</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">I am a:</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={selectedUserType === "student" ? "default" : "outline"}
                className={`p-4 h-auto flex flex-col items-center gap-2 ${
                  selectedUserType === "student" ? "bg-blue-500 hover:bg-blue-600 text-white" : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedUserType("student")}
              >
                <GraduationCap className="h-6 w-6" />
                <span className="text-sm font-medium">Student</span>
              </Button>
              <Button
                variant={selectedUserType === "professional" ? "default" : "outline"}
                className={`p-4 h-auto flex flex-col items-center gap-2 ${
                  selectedUserType === "professional"
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedUserType("professional")}
              >
                <Briefcase className="h-6 w-6" />
                <span className="text-sm font-medium">Professional</span>
              </Button>
            </div>
          </div>

          {/* Location Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Your Location:</label>
            <input
              type="text"
              placeholder="Enter your city and state"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Popular Locations */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Popular Locations:</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {popularLocations.map((location) => (
                <Button
                  key={location}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs hover:bg-gray-100"
                  onClick={() => setSelectedLocation(location)}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {location}
                </Button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!selectedLocation}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
