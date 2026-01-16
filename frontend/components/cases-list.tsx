"use client"

import { useState, useEffect } from "react"
import CaseCard from "./case-card"

interface Case {
  _id: string
  fullName: string
  age: number
  lastSeenDate: string
  lastSeenLocation: string
  description: string
  photoUrl: string
  status: "unverified" | "verified" | "found" | "closed"
  verification?: {
    familyAttestation: boolean
    policeConfirmed?: boolean
    ngoConfirmed?: boolean
  }
  commentCount?: number
  createdAt: string
}

export default function CasesList() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "found">("active")

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    setLoading(true)
    try {
      // Replace with your FastAPI backend endpoint
      const response = await fetch("/api/cases?status=active")
      if (!response.ok) throw new Error("Failed to fetch cases")
      const data = await response.json()
      setCases(data)
    } catch (error) {
      console.error("Error fetching cases:", error)
      // Mock data for UI demonstration
      setCases([
        {
          _id: "1",
          fullName: "Samuel Nkosi",
          age: 8,
          lastSeenDate: "2025-01-12",
          lastSeenLocation: "Bonamoussadi, Douala",
          description: "Small frame, wearing blue school uniform, red backpack",
          photoUrl: "/8-year-old-boy.jpg",
          status: "unverified",
          verification: { familyAttestation: true },
          commentCount: 5,
          createdAt: "2025-01-13T08:30:00Z",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredCases = cases.filter((c) => {
    if (filter === "active") return c.status !== "closed" && c.status !== "found"
    if (filter === "found") return c.status === "found"
    return true
  })

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading cases...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-border">
        {["active", "all", "found"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as typeof filter)}
            className={`px-4 py-2 font-semibold transition ${
              filter === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Cases grid */}
      <div className="space-y-4">
        {filteredCases.length > 0 ? (
          filteredCases.map((caseItem) => <CaseCard key={caseItem._id} caseItem={caseItem} />)
        ) : (
          <div className="text-center py-12 text-muted-foreground">No cases found</div>
        )}
      </div>
    </div>
  )
}
