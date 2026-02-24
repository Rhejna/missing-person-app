'use client'

import Link from 'next/link'
import { BarChart3, Users, AlertTriangle, Lock, LogOut } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Active Cases',
      value: '142',
      icon: BarChart3,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Total Users',
      value: '1,284',
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Suspicious Activities',
      value: '8',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      label: 'Blocked Accounts',
      value: '3',
      icon: Lock,
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  ]

  const recentActivities = [
    { id: 1, type: 'Case Submitted', user: 'Marie Dubois', time: '2 hours ago' },
    { id: 2, type: 'Failed Login (3x)', user: 'jean.martin@email.com', time: '1 hour ago' },
    { id: 3, type: 'Case Status Updated', user: 'Admin Review', time: '30 min ago' },
    { id: 4, type: 'New Verification', user: 'NGO Partner', time: '15 min ago' },
    { id: 5, type: 'Suspicious Report', user: 'Multiple Users', time: '5 min ago' }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-40 bg-background/95">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Monitor cases, users, and security</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/admin/users"
            className="bg-white border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Users Management</h2>
            </div>
            <p className="text-sm text-muted-foreground">Monitor users, view blocked accounts, and manage access</p>
          </Link>

          <Link
            href="/admin/cases"
            className="bg-white border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Cases Management</h2>
            </div>
            <p className="text-sm text-muted-foreground">Verify new cases and change case status</p>
          </Link>

          <Link
            href="/admin/logs"
            className="bg-white border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <LogOut className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Activity Logs</h2>
            </div>
            <p className="text-sm text-muted-foreground">View and filter logs by user or activity type</p>
          </Link>

          <Link
            href="/admin/security"
            className="bg-white border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Security Monitoring</h2>
            </div>
            <p className="text-sm text-muted-foreground">Detect suspicious activities and threats</p>
          </Link>
        </div>

        {/* Recent Activities */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="font-semibold text-foreground mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                <div>
                  <p className="font-medium text-sm text-foreground">{activity.type}</p>
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                </div>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
