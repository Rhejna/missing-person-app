"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Upload } from "lucide-react"



export default function NewCasePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    description: "",
    lastSeenLocation: "",
    lastSeenDate: "",
    lastSeenTime: "",
    photo: null as File | null,
    reporterName: "",
    reporterRelation: "",
    reporterPhone: "",
    reporterEmail: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // On utilise FormData pour envoyer des fichiers
    const formDataToSend = new FormData()
    
    // On ajoute tous les champs texte
    formDataToSend.append("firstName", formData.firstName)
    formDataToSend.append("lastName", formData.lastName)
    formDataToSend.append("age", formData.age)
    formDataToSend.append("description", formData.description)
    formDataToSend.append("lastSeenLocation", formData.lastSeenLocation)
    formDataToSend.append("lastSeenDate", formData.lastSeenDate)
    formDataToSend.append("lastSeenTime", formData.lastSeenTime)
    formDataToSend.append("reporterName", formData.reporterName)
    formDataToSend.append("reporterRelation", formData.reporterRelation)
    formDataToSend.append("reporterPhone", formData.reporterPhone)
    formDataToSend.append("reporterEmail", formData.reporterEmail)

    // On ajoute le fichier image
    if (formData.photo) {
      formDataToSend.append("photo", formData.photo)
    }

    const token = localStorage.getItem("token")

    try {
      const response = await fetch("http://localhost:8000/cases", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) throw new Error("Failed to create case")

      const createdCase = await response.json()
      window.location.href = `/case/${createdCase.id}`
    } catch (error) {
      console.error(error)
      alert("Something went wrong.")
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const res = await fetch("http://localhost:8000/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) return

        const user = await res.json()

        setFormData((prev) => ({
          ...prev,
          reporterName: user.fullName || "",
          reporterEmail: user.email || "",
          reporterPhone: user.phone || "",
        }))
      } catch (err) {
        console.error(err)
      }
    }

    fetchUser()
  }, [])


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <Link
            href="/reporter"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Report a Missing Person</h1>
          <p className="text-muted-foreground">Please provide as much detail as possible to help find this person</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Person details */}
          <section className="bg-card border border-border rounded-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Person Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Age</label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Physical Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Height, build, clothing, distinguishing marks..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Photo</label>
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:border-primary transition overflow-hidden"
              >
                {/* Si une photo est sélectionnée, on l'affiche, sinon on montre l'icône Upload */}
                {formData.photo ? (
                  <div className="space-y-2">
                    <img 
                      src={URL.createObjectURL(formData.photo)} 
                      alt="Preview" 
                      className="max-h-48 mx-auto rounded-md object-cover"
                    />
                    <p className="text-xs text-primary font-medium underline">Changer la photo</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-foreground font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, photo: file });
                    }
                  }}
                />
              </div>
            </div>
          </section>

          {/* Last seen details */}
          <section className="bg-card border border-border rounded-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Last Seen Information</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Location</label>
              <input
                type="text"
                required
                value={formData.lastSeenLocation}
                onChange={(e) => setFormData({ ...formData, lastSeenLocation: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Deido Market, near the main entrance"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.lastSeenDate}
                  onChange={(e) => setFormData({ ...formData, lastSeenDate: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Time</label>
                <input
                  type="time"
                  value={formData.lastSeenTime}
                  onChange={(e) => setFormData({ ...formData, lastSeenTime: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          {/* Reporter details */}
          <section className="bg-card border border-border rounded-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Your Information</h2>
            <p className="text-xs text-muted-foreground">
              You can modify this if you are reporting on behalf of someone else.
            </p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
              <input
                type="text"
                required
                value={formData.reporterName}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Relationship to Missing Person</label>
              <select
                required
                value={formData.reporterRelation}
                onChange={(e) => setFormData({ ...formData, reporterRelation: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select relationship...</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="spouse">Spouse</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.reporterPhone}
                  onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+237 XXX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.reporterEmail}
                  onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:bg-primary/90 transition"
            >
              Submit Report
            </button>
            <Link
              href="/reporter"
              className="flex-1 border border-border text-foreground py-3 rounded-md font-semibold hover:bg-muted transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}