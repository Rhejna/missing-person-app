"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Clock, Flag, MessageCircle, Phone } from "lucide-react"

// Type pour les données du cas
interface CaseUpdate {
  date: string
  status: string
  type: string
}

interface CaseComment {
  id: number
  author: string
  verified: boolean
  date: string
  text: string
  isOfficer?: boolean
}

interface CaseData {
  id: number
  name: string
  age: number
  lastSeen: string
  location: string
  photo: string
  status: string
  verified: boolean
  description: string
  reporterContact: string
  reporterPhone: string
  reportedDate: string
  caseNumber: string
  updates: CaseUpdate[]
  comments: CaseComment[]
}

export default function CasePage({ params }: { params: Promise<{ id: string }> }) {
  // Extraire les params avec use()
  const { id } = use(params)
  
  const [showInfoForm, setShowInfoForm] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [infoFormData, setInfoFormData] = useState({ message: "", contact: "" })
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCase = async () => {
      try {
        console.log("Fetching case with ID:", id); // Debug
        const res = await fetch(`http://localhost:8000/cases/${id}`)
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error("Backend error response:", errorText)
          throw new Error(`Failed to fetch case: ${res.status} - ${errorText}`)
        }
        
        const data = await res.json()
        console.log("Fetched data:", data); // Debug
        setCaseData(data)
      } catch (err) {
        console.error("Error fetching case:", err)
        setError(err instanceof Error ? err.message : "Failed to load case")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCase()
    }
  }, [id]) // Dépendance sur id

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Info submitted:", infoFormData)
    setShowInfoForm(false)
    setInfoFormData({ message: "", contact: "" })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-red-500">Error: {error || "Case not found"}</div>
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition mt-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold">Back to Cases</span>
        </Link>
      </div>
    )
  }

  const statusColor = {
    missing: "bg-yellow-500/10 text-yellow-600",
    sighting: "bg-blue-500/10 text-blue-600",
    found: "bg-green-500/10 text-green-600",
    closed: "bg-gray-500/10 text-gray-600",
  }[caseData.status] || "bg-gray-500/10 text-gray-600"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-card/80 backdrop-blur-sm z-40">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back to Cases</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-8">
            {/* Hero section with photo */}
            <div className="space-y-4">
              <div className="aspect-square rounded-md overflow-hidden bg-muted">
                <img
                  src={caseData.photo || "/placeholder.svg"}
                  alt={caseData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-semibold text-foreground mb-2">{caseData.name}</h1>
                  <p className="text-lg text-muted-foreground">{caseData.age} years old</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                    {caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
                  </span>
                  {caseData.verified && (
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Case details */}
            <div className="bg-card border border-border rounded-md p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Case Details</h2>
              <div className="grid gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Case Number
                  </p>
                  <p className="text-foreground font-medium">{caseData.caseNumber}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">Last Seen</p>
                  <div className="flex items-center gap-2 text-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{caseData.lastSeen}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">Location</p>
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{caseData.location}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Description
                  </p>
                  <p className="text-foreground">{caseData.description}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card border border-border rounded-md p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Timeline</h2>
              <div className="space-y-4">
                {caseData.updates.map((update, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-primary rounded-full mt-2" />
                      {i < caseData.updates.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm text-muted-foreground">{update.date}</p>
                      <p className="text-foreground mt-1">{update.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setShowInfoForm(!showInfoForm)}
                className="bg-primary text-primary-foreground px-4 py-3 rounded-md font-semibold hover:bg-primary/90 transition"
              >
                I Have Information
              </button>
              <button
                onClick={() => setShowReportForm(!showReportForm)}
                className="border border-border text-foreground px-4 py-3 rounded-md font-semibold hover:bg-muted transition flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4" />
                Report This Case
              </button>
            </div>

            {/* Information form */}
            {showInfoForm && (
              <div className="bg-card border border-border rounded-md p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Share Information</h3>
                <p className="text-sm text-muted-foreground">
                  Your information will be sent directly to the family. You can remain anonymous.
                </p>
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">What did you see?</label>
                    <textarea
                      value={infoFormData.message}
                      onChange={(e) => setInfoFormData({ ...infoFormData, message: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Describe what you saw, where, and when..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Contact (Optional)</label>
                    <input
                      type="tel"
                      value={infoFormData.contact}
                      onChange={(e) => setInfoFormData({ ...infoFormData, contact: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Phone number (family will use to contact you)"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-primary-foreground py-2 rounded-md font-semibold hover:bg-primary/90 transition"
                    >
                      Send Information
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInfoForm(false)}
                      className="flex-1 border border-border text-foreground py-2 rounded-md font-semibold hover:bg-muted transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Report form */}
            {showReportForm && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-md p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Report This Case</h3>
                <div className="space-y-3">
                  {["Fake or misleading", "Already found", "Wrong information", "Suspicious activity"].map((reason) => (
                    <label key={reason} className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="reason" value={reason} className="w-4 h-4" />
                      <span className="text-sm text-foreground">{reason}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 pt-4">
                  <button className="flex-1 bg-destructive text-destructive-foreground py-2 rounded-md font-semibold hover:bg-destructive/90 transition">
                    Submit Report
                  </button>
                  <button
                    onClick={() => setShowReportForm(false)}
                    className="flex-1 border border-border text-foreground py-2 rounded-md font-semibold hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="bg-card border border-border rounded-md p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Community Updates ({caseData.comments.length})
              </h2>
              <div className="space-y-4">
                {caseData.comments.map((comment) => (
                  <div key={comment.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{comment.author}</p>
                        {comment.verified && (
                          <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded">Verified</span>
                        )}
                        {comment.isOfficer && <p className="text-xs badge-admin">Police Officer</p>}
                      </div>
                      <p className="text-xs text-muted-foreground">{comment.date}</p>
                    </div>
                    <p className="text-foreground">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Reporter info */}
            <div className="bg-card border border-border rounded-md p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Reported By</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium text-foreground">{caseData.reporterContact}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Reported</p>
                  <p className="font-medium text-foreground">{caseData.reportedDate}</p>
                </div>
                {caseData.verified && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-success font-semibold">✓ Verified by family</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-card border border-border rounded-md p-6 space-y-3">
              <h3 className="font-semibold text-foreground mb-4">Emergency Contact</h3>
              <a
                href={`tel:${caseData.reporterPhone}`}
                className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Family
              </a>
              <a
                href={`https://wa.me/237${caseData.reporterPhone.replace(/\D/g, "").slice(-9)}`}
                className="w-full border border-border text-foreground px-4 py-3 rounded-md font-semibold hover:bg-muted transition"
              >
                Message on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}