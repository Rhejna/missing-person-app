'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Calendar, Filter } from 'lucide-react'

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'login' | 'case' | 'comment' | 'verification'>('all')
  const [filterUser, setFilterUser] = useState('')

  const logs = [
    { id: 1, timestamp: '2024-02-25 14:23', user: 'marie.dubois@email.com', type: 'case_submitted', action: 'Submitted new missing person case', details: 'Case ID: 142 - Jean Nkomo (8 years)' },
    { id: 2, timestamp: '2024-02-25 14:10', user: 'jean.martin@email.com', type: 'login_failed', action: 'Failed login attempt', details: 'Attempt 3/5' },
    { id: 3, timestamp: '2024-02-25 14:05', user: 'jean.martin@email.com', type: 'login_failed', action: 'Failed login attempt', details: 'Attempt 2/5' },
    { id: 4, timestamp: '2024-02-25 14:00', user: 'jean.martin@email.com', type: 'login_failed', action: 'Failed login attempt', details: 'Attempt 1/5' },
    { id: 5, timestamp: '2024-02-25 13:45', user: 'amira.hassan@email.com', type: 'comment_posted', action: 'Posted comment on case', details: 'Case ID: 138 - Possible sighting reported' },
    { id: 6, timestamp: '2024-02-25 13:30', user: 'admin@platform.com', type: 'case_verified', action: 'Verified case submission', details: 'Case ID: 139 - Police confirmation received' },
    { id: 7, timestamp: '2024-02-25 13:15', user: 'sophie.laurent@email.com', type: 'login_success', action: 'Successful login', details: 'IP: 197.156.x.x' },
    { id: 8, timestamp: '2024-02-25 13:00', user: 'pierre.nkumo@email.com', type: 'login_failed', action: 'Failed login attempt', details: 'Attempt 5/5 - Account blocked' },
    { id: 9, timestamp: '2024-02-25 12:45', user: 'admin@platform.com', type: 'case_flagged', action: 'Flagged suspicious case', details: 'Case ID: 136 - Multiple duplicate reports detected' },
    { id: 10, timestamp: '2024-02-25 12:30', user: 'amira.hassan@email.com', type: 'case_status_changed', action: 'Case status updated', details: 'Case ID: 133 changed to FOUND' },
  ]

  const activityTypes = {
    login_failed: { label: 'Failed Login', color: 'text-red-600', bg: 'bg-red-50' },
    login_success: { label: 'Successful Login', color: 'text-green-600', bg: 'bg-green-50' },
    case_submitted: { label: 'Case Submitted', color: 'text-blue-600', bg: 'bg-blue-50' },
    case_verified: { label: 'Case Verified', color: 'text-green-600', bg: 'bg-green-50' },
    case_flagged: { label: 'Case Flagged', color: 'text-orange-600', bg: 'bg-orange-50' },
    case_status_changed: { label: 'Status Changed', color: 'text-purple-600', bg: 'bg-purple-50' },
    comment_posted: { label: 'Comment Posted', color: 'text-blue-600', bg: 'bg-blue-50' },
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || 
                       (filterType === 'login' && (log.type === 'login_failed' || log.type === 'login_success')) ||
                       (filterType === 'case' && log.type.includes('case')) ||
                       (filterType === 'comment' && log.type === 'comment_posted') ||
                       (filterType === 'verification' && log.type === 'case_verified')
    const matchesUser = filterUser === '' || log.user.includes(filterUser)
    return matchesSearch && matchesType && matchesUser
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">Activity Logs</h1>
          <p className="text-sm text-muted-foreground">Monitor all user and system activities</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filters */}
        <div className="bg-white border border-border rounded-lg p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by user or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter by type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-border rounded-md bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Activity Types</option>
              <option value="login">Login Activity</option>
              <option value="case">Case Activity</option>
              <option value="comment">Comments</option>
              <option value="verification">Verification</option>
            </select>

            {/* Filter by user */}
            <input
              type="text"
              placeholder="Filter by user email..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Activity Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const actType = activityTypes[log.type as keyof typeof activityTypes]
                  return (
                    <tr key={log.id} className="border-b border-border hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {log.timestamp}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{log.user}</td>
                      <td className="px-6 py-4">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${actType?.bg || 'bg-gray-100'} ${actType?.color || 'text-gray-700'}`}>
                          {actType?.label || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{log.action}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{log.details}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground">No logs found matching your filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
