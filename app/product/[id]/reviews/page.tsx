'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Link from 'next/link'
import { Star, StarHalf, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export default function ReviewsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [product, setProduct] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

  useEffect(() => {
    async function loadData() {
      const productId = params.id

      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()
      setProduct(productData)

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      setReviews(reviewsData || [])

      if (reviewsData && reviewsData.length > 0) {
        const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0)
        setAverageRating(sum / reviewsData.length)
        setTotalReviews(reviewsData.length)
        
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        reviewsData.forEach((r: any) => {
          if (r.rating >= 1 && r.rating <= 5) dist[r.rating as keyof typeof dist]++
        })
        setRatingDistribution(dist)
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('email', session.user.email)
          .single()
        setUser(userData)
      }

      setLoading(false)
    }

    loadData()
  }, [params.id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setMessage('Please login to submit a review')
      return
    }

    setSubmitting(true)
    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: params.id,
        user_id: user.id,
        rating: rating,
        review: reviewText,
        status: 'pending'
      })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('✅ Review submitted! Waiting for admin approval.')
      setReviewText('')
      setRating(5)
      setShowForm(false)
    }
    setSubmitting(false)
  }

  const renderStars = (rating: number, size: number = 16) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} style={{ width: size, height: size }} className="fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf style={{ width: size, height: size }} className="fill-yellow-400 text-yellow-400" />}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <Star key={i} style={{ width: size, height: size }} className="text-gray-300" />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </>
    )
  }

  const ratingPercentages = {
    5: totalReviews > 0 ? (ratingDistribution[5] / totalReviews) * 100 : 0,
    4: totalReviews > 0 ? (ratingDistribution[4] / totalReviews) * 100 : 0,
    3: totalReviews > 0 ? (ratingDistribution[3] / totalReviews) * 100 : 0,
    2: totalReviews > 0 ? (ratingDistribution[2] / totalReviews) * 100 : 0,
    1: totalReviews > 0 ? (ratingDistribution[1] / totalReviews) * 100 : 0,
  }

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href={`/product/${params.id}`} className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
          <ArrowLeft size={16} />
          Back to Product
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mt-6">{product?.name}</h1>

        {/* Rating Summary */}
        {totalReviews > 0 && (
          <div className="flex items-center gap-6 mt-4 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mt-2">{renderStars(averageRating, 20)}</div>
              <div className="text-sm text-gray-500 mt-1">{totalReviews} reviews</div>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 min-w-[45px]">
                    <span className="text-sm font-medium">{star}</span>
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${ratingPercentages[star as keyof typeof ratingPercentages]}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 min-w-[30px]">
                    {ratingDistribution[star as keyof typeof ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Write Review Button */}
        {user && !showForm && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Write a Review
            </button>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Write Your Review</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="hover:scale-110 transition"
                    >
                      <Star 
                        size={36} 
                        className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                <textarea
                  rows={5}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>
              {message && (
                <div className={`mb-4 p-3 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {message}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="mt-8 space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="text-6xl mb-4">⭐</div>
              <p className="text-gray-500 text-lg">No reviews yet</p>
              <p className="text-sm text-gray-400 mt-2">Be the first to review this product</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating, 18)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('en-ZA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <p className="text-gray-700 text-base mt-3 leading-relaxed">{review.review}</p>
                <div className="flex items-center gap-2 mt-4">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-xs text-gray-400">Verified Purchase</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}