"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react"
import CaseDetailsModal from "./case-details-modal"

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
  contactPhone?: string
}

interface CaseCardProps {
  caseItem: Case
}

export default function CaseCard({ caseItem }: CaseCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getDaysAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    return `${days} days ago`
  }

  const isVerified = caseItem.status === "verified" || caseItem.verification?.familyAttestation

  return (
    <>
      <Link
        href={`/case/${caseItem._id}`}
        className="bg-card border border-border rounded-md overflow-hidden hover:shadow-lg hover:border-primary/50 transition group block"
      >
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          {/* Photo */}
          <div className="flex-shrink-0">
            <img
              src={caseItem.photoUrl || "/placeholder.svg"}
              alt={caseItem.fullName}
              className="w-28 h-28 sm:w-24 sm:h-24 object-cover rounded-md group-hover:scale-105 transition"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-semibold text-foreground">{caseItem.fullName}</h3>
                <p className="text-sm text-muted-foreground">{caseItem.age} years old</p>
              </div>

              {/* Status badge */}
              {isVerified ? (
                <span className="badge-verified text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="badge-unverified text-xs">
                  <AlertCircle className="w-3 h-3" />
                  Unverified
                </span>
              )}
            </div>

            {/* Last seen info */}
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{caseItem.lastSeenLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{getDaysAgo(caseItem.lastSeenDate)}</span>
              </div>
            </div>

            {/* Description preview */}
            <p className="text-sm text-foreground/80 mt-2 line-clamp-1">{caseItem.description}</p>
          </div>
        </div>
      </Link>

      {/* Details modal */}
      {showDetails && <CaseDetailsModal caseItem={caseItem} onClose={() => setShowDetails(false)} />}
    </>
  )
}
