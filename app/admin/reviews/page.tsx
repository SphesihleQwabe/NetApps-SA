'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { Star, CheckCircle, XCircle, Trash2, RefreshCw } from 'lucide-react'

export default function AdminReviews() {
  const supabase = createClient()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReviews()
  }, [])

  async function loadReviews() {
    setLoading(true)
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products (name)
      `)
      .order('created_at', { ascending: false })

    if (!error) {
      setReviews(data || [])
    }
    setLoading(false)
  }

  async function approveReview(id: string) {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      loadReviews()
    }
  }

  async function rejectReview(id: string) {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      loadReviews()
    }
  }

  async function deleteReview(id: string) {
    if (confirm('Delete this review?')) {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)

      if (!error) {
        loadReviews()
      }
    }
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total: <span className="font-semibold text-blue-600">{reviews.length}</span>
            {' | '}
            Pending: <span className="font-semibold text-yellow-600">{reviews.filter(r => r.status === 'pending').length}</span>
            {' | '}
            Approved: <span className="font-semibold text-green-600">{reviews.filter(r => r.status === 'approved').length}</span>
          </p>
        </div>
        <button 
          onClick={loadReviews}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {reviews.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">No reviews yet</div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="px-6 py-4 hover:bg-gray-50/50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800">
                        Product: {review.products?.name || review.product_id || 'N/A'}
                      </span>
                      <span className="text-sm text-gray-500">by User</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">"{review.review}"</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => approveReview(review.id)} 
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => rejectReview(review.id)} 
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    {review.status === 'approved' && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-600">Approved</span>
                    )}
                    {review.status === 'rejected' && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600">Rejected</span>
                    )}
                    <button 
                      onClick={() => deleteReview(review.id)} 
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}