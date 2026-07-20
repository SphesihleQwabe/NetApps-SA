// src/components/ui/ConfirmModal.tsx

import { X, AlertTriangle, AlertCircle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}: ConfirmModalProps) {
  if (!isOpen) return null

  const typeStyles = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      icon: 'text-red-600'
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      icon: 'text-yellow-600'
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      icon: 'text-blue-600'
    }
  }

  const style = typeStyles[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scale-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${style.icon} bg-opacity-10 bg-current mb-4`}>
            {type === 'danger' && <X className="w-6 h-6" />}
            {type === 'warning' && <AlertTriangle className="w-6 h-6" />}
            {type === 'info' && <AlertCircle className="w-6 h-6" />}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>

          <p className="text-sm text-gray-500 mb-6">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.button} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}