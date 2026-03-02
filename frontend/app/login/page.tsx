"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"


export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "admin">("login")
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const [isAdminMode, setIsAdminMode] = useState(false) // New state to "remember" admin access
  
  // Added to the login page via URL parameter (`?admin=true`)
  useEffect(() => {
    if (searchParams?.get("admin") === "true") {
      setIsAdminMode(true)
      setActiveTab("admin")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const endpoint =
        activeTab === "login"
          ? "http://127.0.0.1:8000/auth/login"
          : "http://127.0.0.1:8000/auth/signup"

      const body =
        activeTab === "login"
          ? { email, password }
          : { fullName, email, password, phone: "+237000000000" } // replace with real state

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.detail || "Something went wrong")
        return
      }

      // Only login returns token
      if (data.access_token) {
        localStorage.setItem("token", data.access_token)

        // Redirect to homepage
        router.push(redirect || "/")
      } else {
        // After signup, automatically switch to login
        setActiveTab("login")
        alert("Account created. Please login.")
      }

    } catch (err) {
      alert("Server error")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Back</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2 text-foreground">Welcome</h1>
          <p className="text-muted-foreground">Report a missing person or manage existing cases</p>
        </div>

        {/* Tab selection */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("login")}
            className={`pb-3 px-2 font-medium text-sm transition ${
              activeTab === "login"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          {!isAdminMode && (
            <button
              onClick={() => setActiveTab("signup")}
              className={`pb-3 px-2 font-medium text-sm transition ${
                activeTab === "signup"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          )}

          {isAdminMode && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`pb-3 px-2 font-medium text-sm transition text-foreground border-b-2 border-primary`}
            >
              Admin Login
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "signup" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">FullName</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {activeTab === "admin" ? "Admin Email" : "Email Address"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {activeTab === "admin" ? "Admin Password" : "Password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          {activeTab === "signup" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Phone Number (OTP Verification)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+237 XXX XXX XXX"
              />
              <p className="text-xs text-muted-foreground mt-2">
                We'll send a verification code to confirm your identity
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-semibold hover:bg-primary/90 transition disabled:opacity-50"
          >
            {isLoading ? "Processing..." : activeTab === "login" ? "Sign In" : activeTab === "signup" ? "Create Account" : "Admin Sign In"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          By continuing, you agree to our terms of service and privacy policy
        </p>
      </main>
    </div>
  )
}
