'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useCart } from '../../context/CartContext'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Star, StarHalf, ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw, ChevronDown, CheckCircle, X } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  image_url: string
  category: string
}

interface Review {
  id: string
  rating: number
  review: string
  created_at: string
  status?: string
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const supabase = createClient()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')

  // Check user on load
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Try to get from users table
        const { data: userData } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .eq('email', session.user.email)
          .maybeSingle()
        
        if (userData) {
          setUser(userData)
        } else {
          // Fallback to auth metadata
          const userMeta = session.user.user_metadata
          setUser({
            id: session.user.id,
            first_name: userMeta?.first_name || 'User',
            last_name: userMeta?.last_name || ''
          })
        }
      }
    }
    checkUser()
  }, [supabase])

  useEffect(() => {
    async function loadProduct() {
      try {
        const productId = params.id
        
        const productRes = await fetch(`/api/products/${productId}`)
        if (!productRes.ok) {
          router.push('/products')
          return
        }
        const productData = await productRes.json()
        setProduct(productData)

        const reviewsRes = await fetch(`/api/reviews?productId=${productId}`)
        const reviewsData = await reviewsRes.json()
        
        const approvedReviews = reviewsData.filter((r: any) => r.status === 'approved')
        setReviews(approvedReviews)
        
        if (approvedReviews.length > 0) {
          const sum = approvedReviews.reduce((acc: number, r: any) => acc + r.rating, 0)
          setAverageRating(sum / approvedReviews.length)
          setTotalReviews(approvedReviews.length)
          
          const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          approvedReviews.forEach((r: any) => {
            if (r.rating >= 1 && r.rating <= 5) dist[r.rating as keyof typeof dist]++
          })
          setRatingDistribution(dist)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        router.push('/products')
      }
      setLoading(false)
    }
    loadProduct()
  }, [params.id, router])

  const handleAddToCart = () => {
    if (!product) return
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    alert(`✅ Added ${quantity} x ${product.name} to cart!`)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setReviewMessage('Please login to submit a review')
      return
    }

    setSubmitting(true)
    
    // Add temporary review (optimistic update)
    const tempReview = {
      id: 'temp-' + Date.now(),
      rating: reviewRating,
      review: reviewText,
      created_at: new Date().toISOString(),
      status: 'pending'
    }
    setReviews(prev => [tempReview, ...prev])
    
    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: params.id,
        user_id: user.id,
        rating: reviewRating,
        review: reviewText,
        status: 'pending'
      })

    if (error) {
      // Remove temp review if error
      setReviews(prev => prev.filter(r => r.id !== tempReview.id))
      setReviewMessage('Error: ' + error.message)
    } else {
      setReviewMessage('✅ Review submitted! Waiting for admin approval.')
      setReviewText('')
      setReviewRating(5)
      setShowReviewForm(false)
      
      // Refresh reviews to get real data
      const reviewsRes = await fetch(`/api/reviews?productId=${params.id}`)
      const reviewsData = await reviewsRes.json()
      const approvedReviews = reviewsData.filter((r: any) => r.status === 'approved')
      setReviews(approvedReviews)
    }
    setSubmitting(false)
  }

  const renderStars = (rating: number, size: number = 16) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} style={{ width: size, height: size }} className="fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf style={{ width: size, height: size }} className="fill-yellow-400 text-yellow-400" />}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <Star key={`empty-${i}`} style={{ width: size, height: size }} className="text-gray-300" />
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

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Product Not Found</h1>
            <Link href="/products" className="text-blue-600 mt-4 inline-block">Back to Products</Link>
          </div>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-blue-600">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center p-8">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-gray-400">No Image</div>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                {renderStars(averageRating || 0, 20)}
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {averageRating.toFixed(1)}
              </span>
              <Link 
                href={`/product/${product.id}/reviews`}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                {totalReviews} Reviews
                <ChevronDown size={16} className="text-gray-400" />
              </Link>
            </div>

            {product.category && (
              <span className="inline-block mt-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {product.category}
              </span>
            )}
            
            <p className="text-gray-600 mt-4 text-lg leading-relaxed">{product.description}</p>
            
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold text-blue-600">
                  R{product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  Stock: {product.stock_quantity} available
                </span>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={16} className="text-green-600" />
                <span>Free delivery on orders over R500</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield size={16} className="text-green-600" />
                <span>1 Year Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RefreshCw size={16} className="text-green-600" />
                <span>30-Day Return Policy</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button 
                onClick={handleAddToCart}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              
              <div className="flex gap-3">
                <button className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Heart size={18} />
                  Wishlist
                </button>
                <button className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-200 pt-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Ratings & Reviews</h2>
              {totalReviews > 0 && (
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    {renderStars(averageRating || 0, 20)}
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({totalReviews} reviews)
                  </span>
                </div>
              )}
            </div>
            {user ? (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
            ) : (
              <Link 
                href={`/login?redirect=${encodeURIComponent(`/product/${product.id}`)}`}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Login to Review
              </Link>
            )}
          </div>

          {/* Review Form - Optimized */}
          {showReviewForm && user && (
            <div className="mb-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Write Your Review</h3>
                <button 
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="hover:scale-110 transition-transform duration-150"
                      >
                        <Star 
                          size={32} 
                          className={star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your experience with this product..."
                    required
                  />
                </div>
                {reviewMessage && (
                  <div className={`mb-4 p-3 rounded-lg ${reviewMessage.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {reviewMessage}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Rating Distribution */}
          {totalReviews > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 min-w-[50px]">
                        <span className="text-sm font-medium">{star}</span>
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${ratingPercentages[star as keyof typeof ratingPercentages]}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 min-w-[40px]">
                        {ratingDistribution[star as keyof typeof ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500 text-lg">No reviews yet</p>
              <p className="text-sm text-gray-400 mt-2">Be the first to review this product</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.slice(0, 4).map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating, 16)}
                    <span className="text-xs text-gray-400 ml-2">
                      {review.status === 'pending' ? '⏳ Pending approval' : new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{review.review}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <CheckCircle size={14} className={review.status === 'pending' ? 'text-yellow-500' : 'text-green-500'} />
                    <span className="text-xs text-gray-400">
                      {review.status === 'pending' ? 'Awaiting Approval' : 'Verified Purchase'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}