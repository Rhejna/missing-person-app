'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Lock, Unlock, Trash2, ChevronRight } from 'lucide-react'

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all')
  const [selectedUser, setSelectedUser] = useState<number | null>(null)

  const users = [
    { id: 1, name: 'Marie Dubois', email: 'marie.dubois@email.com', phone: '+237 695 123 456', status: 'active', casesReported: 2, joinedDate: '2024-01-15', failedLogins: 0 },
    { id: 2, name: 'Jean Martin', email: 'jean.martin@email.com', phone: '+237 680 456 789', status: 'blocked', casesReported: 1, joinedDate: '2024-02-10', failedLogins: 5 },
    { id: 3, name: 'Sophie Laurent', email: 'sophie.laurent@email.com', phone: '+237 699 789 012', status: 'active', casesReported: 0, joinedDate: '2024-02-20', failedLogins: 0 },
    { id: 4, name: 'Pierre Nkumo', email: 'pierre.nkumo@email.com', phone: '+237 691 234 567', status: 'blocked', casesReported: 3, joinedDate: '2024-01-05', failedLogins: 6 },
    { id: 5, name: 'Amira Hassan', email: 'amira.hassan@email.com', phone: '+237 678 345 678', status: 'active', casesReported: 5, joinedDate: '2023-12-01', failedLogins: 0 },
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const blockedReason = (id: number) => {
    if (id === 2) return 'Failed login attempts (5 failed in 15 min)'
    if (id === 4) return 'Suspicious activity - multiple failed logins + duplicate reports'
    return 'Unknown'
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
          <h1 className="text-2xl font-semibold text-foreground">Users Management</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage user accounts</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filters */}
        <div className="bg-white border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'blocked'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    filterStatus === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-foreground hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Users' : status === 'active' ? 'Active' : 'Blocked'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-border rounded-lg p-4 hover:border-primary transition cursor-pointer"
              onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status === 'active' ? 'Active' : 'Blocked'}
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition ${selectedUser === user.id ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expanded Details */}
              {selectedUser === user.id && (
                <div className="border-t border-border pt-4 mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium text-foreground">{user.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-sm font-medium text-foreground">{user.joinedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cases Reported</p>
                      <p className="text-sm font-medium text-foreground">{user.casesReported}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Failed Logins</p>
                      <p className={`text-sm font-medium ${user.failedLogins > 3 ? 'text-red-600' : 'text-foreground'}`}>
                        {user.failedLogins}
                      </p>
                    </div>
                  </div>

                  {user.status === 'blocked' && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-xs font-semibold text-red-700 mb-1">Blocked Reason:</p>
                      <p className="text-sm text-red-600">{blockedReason(user.id)}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {user.status === 'blocked' ? (
                      <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-medium transition">
                        <Unlock className="w-4 h-4" />
                        Unblock Account
                      </button>
                    ) : (
                      <button className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-md text-sm font-medium transition">
                        <Lock className="w-4 h-4" />
                        Block Account
                      </button>
                    )}
                    <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md border border-red-200 text-sm font-medium transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
