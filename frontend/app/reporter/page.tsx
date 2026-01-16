"use client"

import Link from "next/link"
import { Plus, LogOut, Edit, Clock } from "lucide-react"

// Mock reporter cases
const reporterCases = [
  {
    id: 1,
    name: "Samuel Nkomo",
    status: "missing",
    lastUpdate: "Jan 12, 2025",
    location: "Deido, Douala",
    daysElapsed: 2,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    status: "found",
    lastUpdate: "Jan 8, 2025",
    location: "Akwa, Douala",
    daysElapsed: 7,
  },
]

export default function ReporterPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-card z-40">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center justify-between">
          <h1 className="font-semibold text-foreground">My Cases</h1>
          <button className="text-muted-foreground hover:text-foreground transition flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* New case button */}
        <div className="mb-8">
          <Link
            href="/reporter/new-case"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition"
          >
            <Plus className="w-5 h-5" />
            Report New Case
          </Link>
        </div>

        {/* Cases list */}
        <div className="space-y-4">
          {reporterCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-card border border-border rounded-md p-6 flex items-center justify-between"
            >
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground text-lg">{caseItem.name}</h3>
                <p className="text-sm text-muted-foreground">{caseItem.location}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Updated: {caseItem.lastUpdate}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {caseItem.daysElapsed} days
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={caseItem.status === "found" ? "badge-found text-xs" : "badge-missing text-xs"}>
                  {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                </span>
                <Link href={`/case/${caseItem.id}`} className="text-primary hover:text-primary/80 transition">
                  <Edit className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Reminder info */}
        <div className="mt-8 bg-accent/5 border border-accent/20 rounded-md p-6">
          <h3 className="font-semibold text-foreground mb-2">Keep Your Case Updated</h3>
          <p className="text-sm text-muted-foreground">
            We'll remind you every 48 hours to provide case updates. Regular updates help the community stay engaged and
            increases chances of finding your loved one.
          </p>
        </div>
      </main>
    </div>
  )
}
