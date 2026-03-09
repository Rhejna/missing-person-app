'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarChart3, Users, AlertTriangle, Lock, LogOut, Loader2 } from 'lucide-react'

interface Activity {
  id: string
  action: string
  details: string
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    active_cases: 0,
    total_users: 0,
    suspicious: 0,
    blocked: 0,
    activities: [] as Activity[]
  })

  // 1. Implementation of Logout
  const handleLogout = () => {
    localStorage.removeItem("token") // Clear the JWT
    router.push("/") // Redirect to home
    router.refresh() // Force refresh to update UI state
  }

  // 2. Fetch Real Data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch('http://localhost:8000/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!res.ok) throw new Error("Unauthorized")

        const result = await res.json()
        setData(result)
      } catch (err) {
        console.error("Dashboard error:", err)
        // If unauthorized, kick them out to login
        router.push("/login?admin=true")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  const stats = [
    { label: 'Active Cases', value: data.active_cases, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Users', value: data.total_users, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Suspicious Activities', value: data.suspicious, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Blocked Accounts', value: data.blocked, icon: Lock, color: 'text-red-600', bg: 'bg-red-50' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Monitor cases, users, and security</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { href: "/admin/users", icon: Users, title: "Users", desc: "Manage accounts" },
            { href: "/admin/cases", icon: BarChart3, title: "Cases", desc: "Verify reports" },
            { href: "/admin/logs", icon: LogOut, title: "Logs", desc: "Audit trail" },
            { href: "/admin/security", icon: AlertTriangle, title: "Security", desc: "Threat detection" }
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group p-6 bg-card border border-border rounded-lg hover:border-primary transition shadow-sm">
               <item.icon className="w-6 h-6 text-primary mb-3" />
               <h2 className="font-semibold group-hover:text-primary transition">{item.title}</h2>
               <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Real Recent Activities */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Recent System Logs</h2>
          <div className="divide-y divide-border">
            {data.activities.length > 0 ? data.activities.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-sm capitalize">{log.action.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">{log.details}</p>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </p>
              </div>
            )) : (
                <p className="text-sm text-muted-foreground py-4">No recent activity found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}