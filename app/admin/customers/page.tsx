'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { Search } from 'lucide-react'

export default function AdminCustomers() {
  const supabase = createClient()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    async function getCustomers() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching customers:', error)
      } else {
        console.log('✅ Customers found:', data?.length)
        setCustomers(data || [])
      }
      setLoading(false)
    }
    getCustomers()
  }, [])

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
           customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer.phone?.includes(searchTerm)
    
    // Status filter
    let matchesStatus = true
    if (statusFilter === 'active') {
      matchesStatus = customer.is_active === true
    } else if (statusFilter === 'inactive') {
      matchesStatus = customer.is_active === false
    } else if (statusFilter === 'verified') {
      matchesStatus = customer.is_verified === true
    } else if (statusFilter === 'unverified') {
      matchesStatus = customer.is_verified === false
    }
    
    return matchesSearch && matchesStatus
  })

  // Get status badge color
  const getStatusBadge = (customer: any) => {
    if (!customer.is_active) {
      return { color: 'bg-red-100 text-red-600', label: 'Inactive' }
    }
    if (customer.is_verified) {
      return { color: 'bg-green-100 text-green-600', label: 'Active' }
    }
    return { color: 'bg-yellow-100 text-yellow-600', label: 'Pending' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total Customers: <span className="font-semibold text-blue-600">{customers.length}</span>
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search customers by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 min-w-[150px]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const status = getStatusBadge(customer)
                  return (
                    <tr key={customer.id} className="border-b hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {customer.first_name?.charAt(0) || 'U'}{customer.last_name?.charAt(0) || ''}
                          </div>
                          <span className="font-medium text-gray-800">
                            {customer.first_name || 'Unknown'} {customer.last_name || ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {customer.role || 'Customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-gray-50/50">
          <span>Showing {filteredCustomers.length} of {customers.length} customers</span>
        </div>
      </div>
    </div>
  )
}