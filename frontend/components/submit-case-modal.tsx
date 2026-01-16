"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Upload } from "lucide-react"

interface SubmitCaseModalProps {
  onClose: () => void
  onSubmit: () => void
}

export default function SubmitCaseModal({ onClose, onSubmit }: SubmitCaseModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    lastSeenDate: "",
    lastSeenLocation: "",
    description: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    photoUrl: "",
  })

  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captchaVerified) {
      alert("Please verify CAPTCHA")
      return
    }

    setSubmitting(true)

    try {
      // Call your FastAPI backend endpoint
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: "unverified",
          createdAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Submission failed")

      onSubmit()
    } catch (error) {
      alert("Error submitting case. Please try again.")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-primary-foreground p-6 flex items-center justify-between border-b">
          <h2 className="text-xl font-bold">Report Missing Person</h2>
          <button onClick={onClose} className="p-1 hover:bg-primary/80 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo section */}
          <div>
            <label className="block text-sm font-semibold mb-2">Photo *</label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.photoUrl ? (
                <div>
                  <img
                    src={formData.photoUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded mx-auto mb-2"
                  />
                  <p className="text-sm text-muted-foreground">Click to change photo</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-semibold">Click to upload photo</p>
                  <p className="text-sm text-muted-foreground">JPG or PNG, max 5MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
          </div>

          {/* Person details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Missing Person Details</h3>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none"
            />
            <input
              type="number"
              name="age"
              placeholder="Age *"
              value={formData.age}
              onChange={handleInputChange}
              required
              className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none"
            />
            <input
              type="date"
              name="lastSeenDate"
              value={formData.lastSeenDate}
              onChange={handleInputChange}
              required
              className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none"
            />
            <input
              type="text"
              name="lastSeenLocation"
              placeholder="Last Seen Location *"
              value={formData.lastSeenLocation}
              onChange={handleInputChange}
              required
              className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none"
            />
            <textarea
              name="description"
              placeholder="Additional Description (height, clothing, distinguishing marks, etc.)"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none"
            />
          </div>

          {/* Contact details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Your Contact Information</h3>
            <input
              type="text"
              name="contactName"
              placeholder="Your Name *"
              value={formData.contactName}
              onChange={handleInputChange}
              required
              className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none"
            />
            <input
              type="tel"
              name="contactPhone"
              placeholder="Phone Number *"
              value={formData.contactPhone}
              onChange={handleInputChange}
              required
              className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none"
            />
            <input
              type="email"
              name="contactEmail"
              placeholder="Email Address"
              value={formData.contactEmail}
              onChange={handleInputChange}
              className="w-full border border-border rounded-lg p-3 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none"
            />
          </div>

          {/* CAPTCHA */}
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={captchaVerified}
                onChange={(e) => setCaptchaVerified(e.target.checked)}
                className="w-5 h-5 rounded border-border cursor-pointer"
              />
              <span className="text-sm">I'm not a robot - Please verify</span>
            </label>
            <p className="text-xs text-muted-foreground mt-2">In production, integrate with hCaptcha or reCAPTCHA</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border rounded-lg py-3 font-semibold hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
