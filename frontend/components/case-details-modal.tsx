"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Phone, MapPin, Clock, CheckCircle, AlertCircle, Flag } from "lucide-react"

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
  contactPhone?: string
  contactEmail?: string
  createdAt: string
}

interface Comment {
  _id: string
  author: string
  content: string
  createdAt: string
  isModerated?: boolean
  reports?: number
}

interface CaseDetailsModalProps {
  caseItem: Case
  onClose: () => void
}

export default function CaseDetailsModal({ caseItem, onClose }: CaseDetailsModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [caseItem._id])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/cases/${caseItem._id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      // Mock comments for demo
      setComments([
        {
          _id: "1",
          author: "John Doe",
          content: "I saw someone matching this description near the market yesterday",
          createdAt: "2025-01-13T10:30:00Z",
        },
      ])
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !authorName.trim()) return

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/cases/${caseItem._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: authorName,
          content: newComment,
          createdAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setNewComment("")
        setAuthorName("")
        fetchComments()
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const isVerified = caseItem.status === "verified" || caseItem.verification?.familyAttestation

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-primary-foreground p-6 flex items-center justify-between border-b">
          <h2 className="text-xl font-bold">{caseItem.fullName}</h2>
          <button onClick={onClose} className="p-1 hover:bg-primary/80 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main content grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Photo and key info */}
            <div className="md:col-span-1">
              <img
                src={caseItem.photoUrl || "/placeholder.svg"}
                alt={caseItem.fullName}
                className="w-full rounded-lg mb-4"
              />
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  {isVerified ? (
                    <div className="badge-verified">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                  ) : (
                    <div className="badge-unverified">
                      <AlertCircle className="w-4 h-4" />
                      Unverified
                    </div>
                  )}
                </div>
                {caseItem.contactPhone && (
                  <a
                    href={`tel:${caseItem.contactPhone}`}
                    className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition w-full justify-center"
                  >
                    <Phone className="w-4 h-4" />
                    Call Family
                  </a>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Age</h3>
                <p className="text-foreground">{caseItem.age} years old</p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4" />
                  Last Seen Location
                </h3>
                <p className="text-foreground">{caseItem.lastSeenLocation}</p>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  Last Seen Date
                </h3>
                <p className="text-foreground">{new Date(caseItem.lastSeenDate).toLocaleDateString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Description</h3>
                <p className="text-foreground">{caseItem.description}</p>
              </div>

              {/* Verification info */}
              {caseItem.verification && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold mb-2">Verification Status</h3>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      {caseItem.verification.familyAttestation && <CheckCircle className="w-4 h-4 text-success" />}
                      {!caseItem.verification.familyAttestation && <AlertCircle className="w-4 h-4 text-amber-600" />}
                      Family Attestation
                    </li>
                    {caseItem.verification.policeConfirmed && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Police Confirmed
                      </li>
                    )}
                    {caseItem.verification.ngoConfirmed && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        NGO Confirmed
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Comments section */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-bold mb-4">Community Comments ({comments.length})</h3>

            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} className="mb-6 space-y-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full border border-border rounded-lg p-2 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none text-sm"
              />
              <textarea
                placeholder="Share any information, tips, or sightings..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full border border-border rounded-lg p-2 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none text-sm"
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
              >
                Post Comment
              </button>
            </form>

            {/* Comments list */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground">{comment.author || "Anonymous"}</p>
                      <button className="text-muted-foreground hover:text-destructive transition">
                        <Flag className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-card-foreground mb-2">{comment.content}</p>
                    <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to share information!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
