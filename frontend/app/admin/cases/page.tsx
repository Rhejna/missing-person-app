'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, X, Clock, MapPin, User, ChevronRight } from 'lucide-react'

export default function CasesManagement() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'found'>('all')
  const [selectedCase, setSelectedCase] = useState<number | null>(null)

  const cases = [
    {
      id: 1,
      name: 'Jean Nkomo (8 years)',
      status: 'pending',
      location: 'Douala, Akwa District',
      submittedBy: 'Marie Dubois',
      submittedDate: '2024-02-25',
      verified: false,
      verificationAttempts: 0,
      description: 'Missing since Tuesday morning. Last seen near school.'
    },
    {
      id: 2,
      name: 'Sophie Kamdem (15 years)',
      status: 'verified',
      location: 'Douala, Deido District',
      submittedBy: 'Amira Hassan',
      submittedDate: '2024-02-20',
      verified: true,
      verificationAttempts: 1,
      description: 'Missing since Sunday. Police confirmation pending.',
      verificationDate: '2024-02-21'
    },
    {
      id: 3,
      name: 'Pierre Tala (42 years)',
      status: 'found',
      location: 'Douala, Bonabéri District',
      submittedBy: 'Family',
      submittedDate: '2024-02-10',
      verified: true,
      verificationAttempts: 1,
      description: 'Found safe at local hospital.',
      foundDate: '2024-02-23'
    },
    {
      id: 4,
      name: 'Yvette Kenne (32 years)',
      status: 'pending',
      location: 'Douala, Logbaba District',
      submittedBy: 'Husband',
      submittedDate: '2024-02-24',
      verified: false,
      verificationAttempts: 2,
      description: 'Missing 3 days. Possible sighting near market.'
    }
  ]

  const filteredCases = cases.filter(c => filterStatus === 'all' || c.status === filterStatus)

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'verified': return 'bg-blue-100 text-blue-700'
      case 'found': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
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
          <h1 className="text-2xl font-semibold text-foreground">Cases Management</h1>
          <p className="text-sm text-muted-foreground">Verify new cases and manage case status</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filters */}
        <div className="bg-white border border-border rounded-lg p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'verified', 'found'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  filterStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-foreground hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Cases' : status === 'pending' ? 'Pending Verification' : status === 'verified' ? 'Verified' : 'Found'}
              </button>
            ))}
          </div>
        </div>

        {/* Cases List */}
        <div className="space-y-3">
          {filteredCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-white border border-border rounded-lg p-4 hover:border-primary transition cursor-pointer"
              onClick={() => setSelectedCase(selectedCase === caseItem.id ? null : caseItem.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{caseItem.id}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{caseItem.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {caseItem.location}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(caseItem.status)}`}>
                    {caseItem.status === 'pending' ? 'Pending' : caseItem.status === 'verified' ? 'Verified' : 'Found'}
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition ${selectedCase === caseItem.id ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expanded Details */}
              {selectedCase === caseItem.id && (
                <div className="border-t border-border pt-4 mt-4 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground">{caseItem.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted By</p>
                      <p className="text-sm font-medium text-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {caseItem.submittedBy}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date Submitted</p>
                      <p className="text-sm font-medium text-foreground">{caseItem.submittedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Verification Status</p>
                      <p className={`text-sm font-medium ${caseItem.verified ? 'text-green-600' : 'text-orange-600'}`}>
                        {caseItem.verified ? '✓ Verified' : '✗ Unverified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Verification Attempts</p>
                      <p className="text-sm font-medium text-foreground">{caseItem.verificationAttempts}</p>
                    </div>
                  </div>

                  {caseItem.status === 'pending' && !caseItem.verified && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-xs font-semibold text-yellow-700 mb-2">Action Required</p>
                      <p className="text-sm text-yellow-600 mb-3">Please verify this case or request more information from the submitter.</p>
                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-medium transition">
                          <Check className="w-4 h-4" />
                          Verify Case
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-md text-sm font-medium transition">
                          <Clock className="w-4 h-4" />
                          Request Info
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm font-medium transition">
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {caseItem.status === 'verified' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-xs font-semibold text-blue-700 mb-2">Case Status</p>
                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition">
                          <Clock className="w-4 h-4" />
                          Mark as Searching
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-medium transition">
                          <Check className="w-4 h-4" />
                          Mark as Found
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
