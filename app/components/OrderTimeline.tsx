'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { CheckCircle, Clock, Truck, Package, CreditCard, XCircle, Edit, MapPin, Mail } from 'lucide-react'

interface Activity {
  id: string
  action: string
  description: string
  status_from: string
  status_to: string
  created_at: string
  metadata: any
}

export default function OrderTimeline({ orderId }: { orderId: string }) {
  const supabase = createClient()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActivities() {
      const { data } = await supabase
        .from('order_activities')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true })

      setActivities(data || [])
      setLoading(false)
    }

    loadActivities()
  }, [orderId, supabase])

  const getIcon = (action: string) => {
    switch(action) {
      case 'created': return <Package className="w-5 h-5 text-blue-500" />
      case 'payment_updated': return <CreditCard className="w-5 h-5 text-green-500" />
      case 'status_update': 
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'tracking_updated': return <Truck className="w-5 h-5 text-purple-500" />
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-600',
      processing: 'bg-yellow-100 text-yellow-700',
      shipped: 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500">No activity recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Order Timeline
      </h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative pl-8 pb-4 last:pb-0">
            {/* Timeline dot */}
            <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
              {getIcon(activity.action)}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
                {activity.status_to && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(activity.status_to)}`}>
                    {activity.status_to}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}