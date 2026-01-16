"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, MapPin, Clock } from "lucide-react"
import Header from "@/components/header"
import AuthorityContacts from "@/components/authority-contacts"

// Mock data for display
const mockCases = [
  {
    id: 1,
    name: "Samuel Nkomo",
    age: 34,
    lastSeen: "Jan 10, 2025",
    location: "Deido, Douala",
    photo: "/missing-person-male.jpg",
    status: "missing",
    verified: true,
    description: "Last seen wearing blue shirt and dark pants",
  },
  {
    id: 2,
    name: "Grace Tando",
    age: 16,
    lastSeen: "Jan 8, 2025",
    location: "Akwa, Douala",
    photo: "/missing-person-female.jpg",
    status: "missing",
    verified: true,
    description: "School uniform, carrying red backpack",
  },
  {
    id: 3,
    name: "Joseph Mbili",
    age: 52,
    lastSeen: "Jan 5, 2025",
    location: "Bonanjo, Douala",
    photo: "/missing-elderly-man.jpg",
    status: "sighting",
    verified: false,
    description: "Possible sighting reported near Akwa Market",
  },
]

function CaseCard({ case: caseItem }: { case: (typeof mockCases)[0] }) {
  const statusLabels = {
    missing: { label: "Missing", color: "badge-missing" },
    sighting: { label: "Possible Sighting", color: "badge-sighting" },
    found: { label: "Found", color: "badge-found" },
    closed: { label: "Closed", color: "badge-closed" },
  }

  const status = statusLabels[caseItem.status as keyof typeof statusLabels]

  return (
    <Link href={`/case/${caseItem.id}`}>
      <div className="bg-card rounded-md overflow-hidden hover:shadow-lg transition-shadow border border-border cursor-pointer group">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={caseItem.photo || "/placeholder.svg"}
            alt={caseItem.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground">{caseItem.name}</h3>
            <span className={`${status.color} text-xs`}>{status.label}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{caseItem.age} years old</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{caseItem.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{caseItem.lastSeen}</span>
            </div>
          </div>
          {caseItem.verified && <p className="text-xs text-success mt-3 font-semibold">✓ Verified</p>}
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  const filteredCases = mockCases.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === "all" || c.status === activeFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full">
        {/* Hero Section */}
        <section className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-wide text-accent font-semibold mb-3">Missing Persons</p>
              <h1 className="text-5xl md:text-6xl font-semibold mb-4 text-foreground">Find them home</h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Community-powered missing person alerts. Connect with neighbors, authorities, and trusted organizations
                to help bring missing people back to their families in Douala.
              </p>
              <Link
                href="/login"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition"
              >
                Report a Missing Person
              </Link>
            </div>
          </div>
        </section>

        {/* Search & Filter Section */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { id: "all", label: "All Cases" },
                  { id: "missing", label: "Missing" },
                  { id: "sighting", label: "Possible Sightings" },
                  { id: "found", label: "Found" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ${
                      activeFilter === filter.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cases Grid */}
        <section className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {filteredCases.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {filteredCases.map((caseItem) => (
                    <CaseCard key={caseItem.id} case={caseItem} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No cases found matching your search.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside>
              <AuthorityContacts />
            </aside>
          </div>
        </section>
      </main>
    </div>
  )
}
