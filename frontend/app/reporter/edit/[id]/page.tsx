"use client"
import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, Save, Trash2, CheckCircle } from "lucide-react"

export default function EditCasePage() {
  const { id } = useParams()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // New state to hold the URL of the image already in the DB
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null)
  const [status, setStatus] = useState("")
  
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

  useEffect(() => {
    const fetchCase = async () => {
      const token = localStorage.getItem("token")
      const res = await fetch(`http://localhost:8000/cases/${id}/edit`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) { router.push("/reporter"); return }

      if (!token) {
        alert("Your session has expired. Please log in again to save your changes.")
        router.push("/login")
        return
      }

      const data = await res.json()
      
      // LOGIC: Parsing "Name (Relation)" back into two boxes
      let rName = data.reporterContact || ""
      let rRel = ""
      if (rName.includes("(")) {
        const parts = rName.split(" (")
        rName = parts[0]
        rRel = parts[1].replace(")", "")
      }

      // Logic to split "2026-01-26 at 23:50" or handle "2026-02-02"
      let dbDate = ""
      let dbTime = ""

      if (data.lastSeen) {
        if (data.lastSeen.includes(" at ")) {
          const parts = data.lastSeen.split(" at ")
          dbDate = parts[0] // "2026-01-26"
          dbTime = parts[1] // "23:50"
        } else {
          dbDate = data.lastSeen // "2026-02-02"
          dbTime = "" // No time provided
        }
      }

      setCurrentPhotoUrl(data.photo) // Store original photo
      setStatus(data.status)
      setFormData({
        firstName: data.name?.split(" ")[0] || "",
        lastName: data.name?.split(" ")[1] || "",
        age: data.age || "",
        description: data.description || "",
        lastSeenLocation: data.location || "",
        lastSeenDate: dbDate, 
        lastSeenTime: dbTime,
        photo: null,
        reporterName: rName,
        reporterRelation: rRel,
        reporterPhone: data.reporterPhone || "",
        reporterEmail: data.reporterEmail || "",
      })
    }
    fetchCase()
  }, [id])

  // Handler for changing status (PATCH)
  const handleStatusChange = async (newStatus: string) => {
    const token = localStorage.getItem("token")

    if (!token) {
      alert("Your session has expired. Please log in again to save your changes.")
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/cases/${id}/status?new_status=${newStatus}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setStatus(newStatus)
        alert(`Status updated to ${newStatus.toUpperCase()}`)
      } else {
        alert("Permission denied or server error.")
      }
    } catch (err) {
      alert("Connection failed.")
    }
  }

  // Handler for archiving/deleting (PATCH)
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to archive this case? It will no longer appear in public searches.")) return

    const token = localStorage.getItem("token")
    if (!token) {
      alert("Your session has expired. Please log in again to save your changes.")
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/cases/${id}/delete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        router.push("/reporter")
      }
    } catch (err) {
      alert("Could not delete case.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formDataToSend = new FormData()
    
    // Helper to only append if value exists, preventing empty string issues
    const appendIfValue = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== "") {
        formDataToSend.append(key, value)
      }
    }

    appendIfValue("firstName", formData.firstName)
    appendIfValue("lastName", formData.lastName)
    appendIfValue("age", formData.age) 
    appendIfValue("description", formData.description)
    appendIfValue("lastSeenLocation", formData.lastSeenLocation)
    appendIfValue("lastSeenDate", formData.lastSeenDate)
    appendIfValue("lastSeenTime", formData.lastSeenTime)
    appendIfValue("reporterName", formData.reporterName)
    appendIfValue("reporterRelation", formData.reporterRelation)
    appendIfValue("reporterPhone", formData.reporterPhone)
    appendIfValue("reporterEmail", formData.reporterEmail)

    if (formData.photo) {
      formDataToSend.append("photo", formData.photo)
    }

    const token = localStorage.getItem("token")

    if (!token) {
      alert("Your session has expired. Please log in again to save your changes.")
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/cases/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) throw new Error("Failed to update case")

      const editedCase = await response.json()
      router.push("/reporter")
    } catch (error) {
      console.error(error)
      alert("Something went wrong.")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file size is too large (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("File is too large. Please select an image under 10MB.");
        return;
      }
      
      // Update the formData state with the new file
      setFormData((prev) => ({ ...prev, photo: file }));
      
      // Clear the currentPhotoUrl so the preview shows the NEW file
      setCurrentPhotoUrl(null); 
    }
  };

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
          <h1 className="text-3xl font-semibold text-foreground mb-2">Edit Case</h1>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Current Status:</label>
              <select 
                value={status}
                className="bg-background border border-border rounded px-3 py-1 font-medium"
                onChange={(e) => handleStatusChange(e.target.value)} // You can move your logic to a function
              >
                <option value="missing">🔴 Missing</option>
                <option value="investigating">🟠 Investigating</option>
                <option value="found">🟢 Found</option>
                <option value="closed">⚪ Closed</option>
              </select>
            </div>
            
            <button 
              type="button"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" /> Archive Case
            </button>
          </div>
          <p className="text-muted-foreground">Update the information for this missing person case.</p>
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
              <label className="block text-sm font-medium text-foreground mb-2">Case Photo</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Current Image or Preview */}
                <div className="relative w-40 h-40 border border-border rounded-md overflow-hidden bg-muted">
                  <img 
                    src={formData.photo ? URL.createObjectURL(formData.photo) : `http://localhost:8000${currentPhotoUrl}`} 
                    alt="Person" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground">Update the photo to show a more recent image or a different angle.</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition"
                  >
                    <Upload className="w-4 h-4" /> Replace Image
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
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
            <div className="grid sm:grid-cols-2 gap-4">
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
            </div>
          </section>

          {/* Submit */}
          <div className="pt-6 border-t border-border flex items-center justify-end gap-4">
            <Link href="/reporter" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Cancel changes
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-md font-bold hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              <Save className="w-5 h-5" /> Save All Updates
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}