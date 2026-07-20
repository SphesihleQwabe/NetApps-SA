// src/components/ui/Toast.tsx

import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: () => void
}

export function Toast({ 
  message, 
  type = 'success', 
  duration = 4000, 
  onClose 
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const configs = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: XCircle,
      iconColor: 'text-red-500'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-500'
    }
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-down max-w-md ${config.bg}`}>
      <Icon className={`w-5 h-5 ${config.iconColor}`} />
      <span className="text-sm text-gray-700 flex-1">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}