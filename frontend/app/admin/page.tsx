"use client"

import { useState } from "react"
import { LogOut, CheckCircle, AlertCircle, XCircle } from "lucide-react"

// Mock admin cases
const adminCases = [
  {
    id: 1,
    name: "Samuel Nkomo",
    status: "missing",
    verification: "pending",
    reports: 2,
    lastUpdate: "Jan 12, 2025",
  },
  {
    id: 2,
    name: "Grace Tando",
    status: "missing",
    verification: "verified",
    reports: 0,
    lastUpdate: "Jan 10, 2025",
  },
  {
    id: 3,
    name: "Joseph Mbili",
    status: "sighting",
    verification: "flagged",
    reports: 1,
    lastUpdate: "Jan 5, 2025",
  },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "flagged">("pending")

  const filteredCases = adminCases.filter((c) => {
    if (activeTab === "pending") return c.verification === "pending"
    if (activeTab === "verified") return c.verification === "verified"
    return c.verification === "flagged"
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-card z-40">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center justify-between">
          <h1 className="font-semibold text-foreground">Admin Panel</h1>
          <button className="text-muted-foreground hover:text-foreground transition flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pending Verification", value: "3", icon: AlertCircle },
            { label: "Verified Cases", value: "12", icon: CheckCircle },
            { label: "Flagged Cases", value: "2", icon: XCircle },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{stat.label}</p>
                  <p className="text-3xl font-semibold text-foreground mt-2">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {[
            { id: "pending", label: "Pending Verification (3)" },
            { id: "verified", label: "Verified (12)" },
            { id: "flagged", label: "Flagged (2)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-2 font-medium text-sm transition ${
                activeTab === tab.id
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cases table */}
        <div className="space-y-2">
          {filteredCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-card border border-border rounded-md p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{caseItem.name}</h3>
                <p className="text-sm text-muted-foreground">Case ID: MISS-2025-000{caseItem.id}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Reports</p>
                  <p className="font-semibold text-foreground">{caseItem.reports}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="font-semibold text-foreground text-sm">{caseItem.lastUpdate}</p>
                </div>
                <div className="flex gap-2">
                  {activeTab === "pending" && (
                    <>
                      <button className="px-4 py-2 bg-success text-success-foreground rounded text-sm font-medium hover:bg-success/90 transition">
                        Verify
                      </button>
                      <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded text-sm font-medium hover:bg-destructive/90 transition">
                        Reject
                      </button>
                    </>
                  )}
                  {activeTab === "flagged" && (
                    <>
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition">
                        Investigate
                      </button>
                      <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded text-sm font-medium hover:bg-destructive/90 transition">
                        Remove
                      </button>
                    </>
                  )}
                  <button className="px-4 py-2 border border-border text-foreground rounded text-sm font-medium hover:bg-muted transition">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
