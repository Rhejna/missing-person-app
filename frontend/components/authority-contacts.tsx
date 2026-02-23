"use client"

import { useState, useEffect } from "react"
import { Phone, MapPin, Clock } from "lucide-react"

interface Authority {
  name: string
  type: "police" | "ngo" | "hospital"
  phones: string[] // Changé de 'phone' à 'phones'
  address: string
  hours: string
  distance?: string
  location: { lat: number; lng: number } // Assurez-vous que c'est 'location' comme dans le backend
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
      const response = await fetch(`http://localhost:8000/api/authorities?lat=${lat}&lng=${lng}`);
      if (!response.ok) throw new Error("Could not fetch authorities");
      
      const data = await response.json();
      setAuthorities(data);
    } catch (error) {
      console.error("Authority fetch error:", error);
      // Fallback to your mock data if the server is down
    }
  };


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
              <div className="flex items-start gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {authority.phones.map((phone, pIdx) => (
                    <a 
                      key={pIdx} 
                      href={`tel:${phone}`} 
                      className="hover:text-primary transition after:content-['/'] last:after:content-[''] after:ml-1"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{authority.address}</span>
              </div>

              {/* <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{authority.hours}</span>
              </div> */}
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              {/* BOUTON CALL : Appelle le premier numéro de la liste */}
              <a
                href={`tel:${authority.phones[0]}`}
                className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded-md text-xs font-semibold hover:bg-primary/90 transition text-center flex items-center justify-center gap-2"
              >
                <Phone className="w-3 h-3" />
                Call
              </a>

              {/* BOUTON DIRECTIONS : Ouvre Google Maps avec les coordonnées exactes */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${authority.location.lat},${authority.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 border border-border text-foreground px-3 py-2 rounded-md text-xs font-semibold hover:bg-muted transition text-center flex items-center justify-center gap-2"
              >
                <MapPin className="w-3 h-3" />
                Directions
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
