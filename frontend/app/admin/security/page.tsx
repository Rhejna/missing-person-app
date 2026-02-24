'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Lock, MapPin, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react'

export default function SecurityMonitoring() {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([])

  const alerts = [
    {
      id: 1,
      severity: 'critical',
      type: 'Failed Login Threshold',
      description: 'jean.martin@email.com has exceeded 5 failed login attempts in 15 minutes',
      timestamp: '2024-02-25 14:10',
      action: 'Auto-blocked user account',
      resolved: true
    },
    {
      id: 2,
      severity: 'high',
      type: 'Suspicious Case Activity',
      description: 'Case ID 136 has 8 duplicate reports from different IPs with similar descriptions',
      timestamp: '2024-02-25 13:50',
      action: 'Case flagged for review',
      resolved: false
    },
    {
      id: 3,
      severity: 'medium',
      type: 'Unusual Location Access',
      description: 'User amira.hassan@email.com logged in from new IP (197.156.x.x) at unusual time',
      timestamp: '2024-02-25 13:15',
      action: 'Monitoring - no action taken',
      resolved: true
    },
    {
      id: 4,
      severity: 'critical',
      type: 'Failed Login Threshold',
      description: 'pierre.nkumo@email.com has exceeded 5 failed login attempts in 20 minutes',
      timestamp: '2024-02-25 12:50',
      action: 'Auto-blocked user account',
      resolved: true
    },
    {
      id: 5,
      severity: 'high',
      type: 'Mass Report Pattern',
      description: 'Multiple accounts reporting the same missing person with identical descriptions',
      timestamp: '2024-02-25 11:30',
      action: 'Investigation ongoing',
      resolved: false
    }
  ]

  const stats = [
    { label: 'Active Alerts', value: '2', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Resolved Today', value: '3', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Blocked Accounts', value: '2', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Flagged Cases', value: '1', color: 'text-yellow-600', bg: 'bg-yellow-50' }
  ]

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5" />
      case 'high': return <AlertTriangle className="w-5 h-5" />
      case 'medium': return <Clock className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">Security Monitoring</h1>
          <p className="text-sm text-muted-foreground">Detect and manage suspicious activities</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className={`${stat.bg} border border-gray-200 rounded-lg p-4`}>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Active Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Security Alerts</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              Real-time monitoring
            </div>
          </div>

          {alerts.map((alert) => {
            if (dismissedAlerts.includes(alert.id)) return null

            return (
              <div key={alert.id} className={`border border-solid rounded-lg p-5 ${getSeverityColor(alert.severity)}`}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-sm">{alert.type}</h3>
                        <p className="text-sm mt-1 opacity-90">{alert.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs opacity-75 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-current border-opacity-20">
                      <div className="flex items-center gap-2 text-xs">
                        {alert.resolved ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Resolved: {alert.action}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Pending: {alert.action}</span>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!alert.resolved && (
                          <>
                            <button className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs font-medium transition">
                              Investigate
                            </button>
                            <button className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs font-medium transition">
                              Take Action
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])}
                          className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs font-medium transition"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Security Rules */}
        <div className="mt-12 bg-white border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Security Rules</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-foreground">Failed Login Auto-Block</p>
                <p className="text-xs text-muted-foreground">Block account after 5 failed login attempts within 15 minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-foreground">Duplicate Case Detection</p>
                <p className="text-xs text-muted-foreground">Flag cases with 5+ similar reports from different IPs</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-foreground">Unusual Access Pattern Detection</p>
                <p className="text-xs text-muted-foreground">Alert on login from new location at unusual time</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-foreground">Rate Limiting</p>
                <p className="text-xs text-muted-foreground">Limit case submissions to 5 per day per user</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
