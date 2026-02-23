"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, MapPin, Clock } from "lucide-react"
import Header from "@/components/header"
import AuthorityContacts from "@/components/authority-contacts"

// Type pour les données du cas
interface CaseData {
  _id: string
  slug: string
  name: string
  age: number
  lastSeen: string
  location: string
  photo: string
  status: "missing" | "sighting" | "found" | "closed"
  verified: boolean
  description: string
  reporterContact: string
  reporterPhone: string
  reportedDate: string
  caseNumber: string
  updates: Array<{
    date: string
    status: string
    type: string
  }>
  comments: Array<{
    id: number
    author: string
    verified: boolean
    date: string
    text: string
  }>
}

// Type simplifié pour l'affichage des cartes
interface CaseCardData {
  _id: string
  slug: string
  name: string
  age: number
  lastSeen: string
  location: string
  photo: string
  status: "missing" | "sighting" | "found" | "closed"
  verified: boolean
  description: string
}

function CaseCard({ case: caseItem }: { case: CaseCardData }) {
  const statusLabels = {
    missing: { label: "Missing", color: "bg-yellow-500/10 text-yellow-600" },
    sighting: { label: "Possible Sighting", color: "bg-blue-500/10 text-blue-600" },
    found: { label: "Found", color: "bg-green-500/10 text-green-600" },
    closed: { label: "Closed", color: "bg-gray-500/10 text-gray-600" },
  }

  const status = statusLabels[caseItem.status]
  const BACKEND_URL = "http://localhost:8000";

  return (
    // <Link href={`/case/${caseItem._id}`}>
    <Link href={`/case/${caseItem.slug}`}>
      <div className="bg-card rounded-md overflow-hidden hover:shadow-lg transition-shadow border border-border cursor-pointer group">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={caseItem.photo.startsWith('http') ? caseItem.photo : `${BACKEND_URL}${caseItem.photo}`} 
            alt={caseItem.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-foreground">{caseItem.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
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
          {caseItem.verified && (
            <p className="text-xs text-green-600 font-semibold mt-3 flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
              Verified
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [cases, setCases] = useState<CaseCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour formatter les données du backend pour l'affichage
  const formatCaseForCard = (caseData: CaseData): CaseCardData => {
    return {
      _id: caseData._id,
      slug: caseData.slug,
      name: caseData.name,
      age: caseData.age,
      lastSeen: caseData.lastSeen,
      location: caseData.location,
      photo: caseData.photo,
      status: caseData.status,
      verified: caseData.verified,
      description: caseData.description,
    }
  }

  // Fetch des données depuis le backend
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true)
        const res = await fetch("http://localhost:8000/cases")
        
        if (!res.ok) {
          throw new Error(`Failed to fetch cases: ${res.status}`)
        }
        
        const data: CaseData[] = await res.json()
        
        // Formater les données pour l'affichage
        const formattedCases = data.map(formatCaseForCard)
        setCases(formattedCases)
        setError(null)
      } catch (err) {
        console.error("Error fetching cases:", err)
        setError(err instanceof Error ? err.message : "Failed to load cases")
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  // Filtrer les cas selon la recherche et le filtre
  const filteredCases = cases.filter((c) => {
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
                href="/login?redirect=/reporter/new-case"
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
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading cases...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-2">Error loading cases</p>
              <p className="text-muted-foreground text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                {filteredCases.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {filteredCases.map((caseItem) => (
                      <CaseCard key={caseItem._id} case={caseItem} />
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
          )}
        </section>
      </main>
    </div>
  )
}