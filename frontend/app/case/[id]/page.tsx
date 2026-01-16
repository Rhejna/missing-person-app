"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Clock, Flag, MessageCircle, Phone } from "lucide-react"

// Mock case data
const mockCase = {
  id: 1,
  name: "Samuel Nkomo",
  age: 34,
  lastSeen: "Jan 10, 2025 at 2:00 PM",
  location: "Deido, Douala",
  photo: "/missing-person-male.jpg",
  status: "missing",
  verified: true,
  description: "Last seen wearing blue shirt and dark pants near the market",
  reporterContact: "Jane Nkomo (Sister)",
  reporterPhone: "+237 XXX XXX XXX",
  reportedDate: "Jan 10, 2025",
  caseNumber: "MISS-2025-0001",
  updates: [
    { date: "Jan 12, 2025", status: "Possible sighting near Bonanjo reported", type: "sighting" },
    { date: "Jan 10, 2025", status: "Case reported and verified", type: "reported" },
  ],
  comments: [
    {
      id: 1,
      author: "Anonymous",
      verified: false,
      date: "Jan 11, 2025",
      text: "I saw someone matching this description near the central market yesterday around 3 PM",
    },
    {
      id: 2,
      author: "John Doe",
      verified: true,
      date: "Jan 10, 2025",
      text: "Please check hospitals in the area. I hope he is found safe.",
      isOfficer: true,
    },
  ],
}

export default function CasePage({ params }: { params: { id: string } }) {
  const [showInfoForm, setShowInfoForm] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [infoFormData, setInfoFormData] = useState({ message: "", contact: "" })

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Send to FastAPI backend
    console.log("Info submitted:", infoFormData)
    setShowInfoForm(false)
    setInfoFormData({ message: "", contact: "" })
  }

  const statusColor = {
    missing: "badge-missing",
    sighting: "badge-sighting",
    found: "badge-found",
    closed: "badge-closed",
  }[mockCase.status]

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
                  src={mockCase.photo || "/placeholder.svg"}
                  alt={mockCase.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-semibold text-foreground mb-2">{mockCase.name}</h1>
                  <p className="text-lg text-muted-foreground">{mockCase.age} years old</p>
                </div>
                <span className={`${statusColor} text-sm`}>
                  {mockCase.status.charAt(0).toUpperCase() + mockCase.status.slice(1)}
                </span>
                {mockCase.verified && <div className="badge-verified text-sm">Verified</div>}
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
                  <p className="text-foreground font-medium">{mockCase.caseNumber}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">Last Seen</p>
                  <div className="flex items-center gap-2 text-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{mockCase.lastSeen}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">Location</p>
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{mockCase.location}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Description
                  </p>
                  <p className="text-foreground">{mockCase.description}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card border border-border rounded-md p-6 space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Timeline</h2>
              <div className="space-y-4">
                {mockCase.updates.map((update, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-primary rounded-full mt-2" />
                      {i < mockCase.updates.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
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
                Community Updates ({mockCase.comments.length})
              </h2>
              <div className="space-y-4">
                {mockCase.comments.map((comment) => (
                  <div key={comment.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{comment.author}</p>
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
                  <p className="font-medium text-foreground">{mockCase.reporterContact}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Reported</p>
                  <p className="font-medium text-foreground">{mockCase.reportedDate}</p>
                </div>
                {mockCase.verified && (
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
                href={`tel:${mockCase.reporterPhone}`}
                className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Family
              </a>
              <a
                href={`https://wa.me/237${mockCase.reporterPhone.replace(/\D/g, "").slice(-9)}`}
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
