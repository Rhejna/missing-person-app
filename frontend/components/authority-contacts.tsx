"use client"

import { useState, useEffect } from "react"
import { Phone, MapPin, Clock } from "lucide-react"

interface Authority {
  name: string
  type: "police" | "ngo" | "hospital"
  phone: string
  address: string
  hours: string
  distance?: string
  coordinates?: { lat: number; lng: number }
}

export default function AuthorityContacts() {
  const [authorities, setAuthorities] = useState<Authority[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          fetchNearestAuthorities(position.coords.latitude, position.coords.longitude)
        },
        () => {
          // Fallback to Douala center
          setUserLocation({ lat: 4.0511, lng: 9.7679 })
          fetchNearestAuthorities(4.0511, 9.7679)
        },
      )
    }
  }, [])

  const fetchNearestAuthorities = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/authorities?lat=${lat}&lng=${lng}&radius=10`)
      if (response.ok) {
        const data = await response.json()
        setAuthorities(data)
      }
    } catch (error) {
      // Mock data for Douala
      setAuthorities([
        {
          name: "DGSN Douala - Central Station",
          type: "police",
          phone: "+237 6 71 23 45 67",
          address: "New Bell, Douala",
          hours: "24/7",
          distance: "2.1 km",
          coordinates: { lat: 4.0511, lng: 9.7679 },
        },
        {
          name: "DGSN Bonamoussadi Station",
          type: "police",
          phone: "+237 6 71 34 56 78",
          address: "Bonamoussadi, Douala",
          hours: "24/7",
          distance: "4.3 km",
          coordinates: { lat: 4.0381, lng: 9.7811 },
        },
        {
          name: "Douala Hospital Emergency",
          type: "hospital",
          phone: "+237 6 70 00 11 22",
          address: "Akwa, Douala",
          hours: "24/7",
          distance: "1.8 km",
          coordinates: { lat: 4.0556, lng: 9.7744 },
        },
        {
          name: "International Red Cross - Douala",
          type: "ngo",
          phone: "+237 2 33 12 34 56",
          address: "Bonamoussadi, Douala",
          hours: "08:00 - 20:00",
          distance: "3.5 km",
          coordinates: { lat: 4.0381, lng: 9.7811 },
        },
      ])
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "police":
        return "bg-primary/10 text-primary border-primary/20"
      case "hospital":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-accent/10 text-accent border-accent/20"
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-20 space-y-4">
        <div className="bg-card border border-border rounded-md p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">Emergency Contacts</p>
          <h2 className="text-lg font-semibold text-foreground">Nearest Authorities</h2>
        </div>

        {authorities.map((authority, idx) => (
          <div key={idx} className="bg-card border border-border rounded-md p-5 space-y-3 hover:shadow-md transition">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground text-sm">{authority.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{getTypeLabel(authority.type)}</p>
              </div>
              {authority.distance && (
                <p className="text-xs font-semibold text-primary whitespace-nowrap">{authority.distance}</p>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href={`tel:${authority.phone}`} className="hover:text-primary font-medium transition">
                  {authority.phone}
                </a>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{authority.address}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{authority.hours}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <a
                href={`tel:${authority.phone}`}
                className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded-md text-xs font-semibold hover:bg-primary/90 transition text-center"
              >
                Call
              </a>
              <button className="flex-1 border border-border text-foreground px-3 py-2 rounded-md text-xs font-semibold hover:bg-muted transition">
                Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
