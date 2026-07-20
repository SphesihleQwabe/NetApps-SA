// src/components/ui/StatusBadge.tsx

import { CheckCircle, AlertTriangle, XCircle, Eye, EyeOff, Archive, Clock } from 'lucide-react'

interface StatusBadgeProps {
  status: 'active' | 'draft' | 'hidden' | 'archived' | 'in_stock' | 'low_stock' | 'out_of_stock'
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const configs = {
    active: {
      label: 'Active',
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle
    },
    draft: {
      label: 'Draft',
      color: 'bg-gray-100 text-gray-600',
      icon: Clock
    },
    hidden: {
      label: 'Hidden',
      color: 'bg-yellow-100 text-yellow-700',
      icon: EyeOff
    },
    archived: {
      label: 'Archived',
      color: 'bg-gray-200 text-gray-600',
      icon: Archive
    },
    in_stock: {
      label: 'In Stock',
      color: 'bg-green-100 text-green-700',
      icon: CheckCircle
    },
    low_stock: {
      label: 'Low Stock',
      color: 'bg-yellow-100 text-yellow-700',
      icon: AlertTriangle
    },
    out_of_stock: {
      label: 'Out of Stock',
      color: 'bg-red-100 text-red-700',
      icon: XCircle
    }
  }

  const config = configs[status]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}