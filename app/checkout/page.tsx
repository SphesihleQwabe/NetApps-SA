'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import PayFastButton from '../components/PayFastButton'

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const { items, removeFromCart } = useCart()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loadingUserData, setLoadingUserData] = useState(true)

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    province: 'Gauteng',
    postalCode: '',
    paymentMethod: 'payfast'
  })

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const vat = subtotal * 0.15
  const deliveryFee = subtotal > 500 ? 0 : 99
  const total = subtotal + vat + deliveryFee

  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login?redirect=checkout')
        return
      }
      
      setUser(session.user)
      setAuthLoading(false)
      
      // Load user data from users table
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()
      
      if (userData) {
        setForm({
          email: userData.email || '',
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          province: userData.province || 'Gauteng',
          postalCode: userData.postal_code || '',
          paymentMethod: 'payfast'
        })
      }
      setLoadingUserData(false)
    }
    
    checkAuth()
  }, [router, supabase])

  // Validation functions
  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }

  const validateName = (name: string) => {
    const re = /^[A-Za-z\s\-]+$/
    return re.test(name) && name.length >= 2
  }

  const validatePhone = (phone: string) => {
    const re = /^0[0-9]{9}$/
    return re.test(phone)
  }

  const validateStep1 = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!form.firstName) {
      newErrors.firstName = 'First name is required'
    } else if (form.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters'
    } else if (!validateName(form.firstName)) {
      newErrors.firstName = 'First name can only contain letters'
    }
    
    if (!form.lastName) {
      newErrors.lastName = 'Last name is required'
    } else if (form.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters'
    } else if (!validateName(form.lastName)) {
      newErrors.lastName = 'Last name can only contain letters'
    }
    
    if (!form.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    
    if (!form.phone) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(form.phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number starting with 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!form.address) newErrors.address = 'Address is required'
    if (!form.city) newErrors.city = 'City is required'
    if (!form.postalCode) {
      newErrors.postalCode = 'Postal code is required'
    } else if (!/^[0-9]{4}$/.test(form.postalCode)) {
      newErrors.postalCode = 'Enter a valid 4-digit postal code'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(step + 1)
    } else if (step === 2 && validateStep2()) {
      setStep(step + 1)
    }
  }

  const prevStep = () => setStep(step - 1)

  if (authLoading || loadingUserData) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Your Cart is Empty</h1>
            <p className="text-gray-500 mb-8">Browse our products and find something you love!</p>
            <Link href="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition">
              Start Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
            <span className="text-sm text-gray-500">Welcome, {user?.email}</span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input 
                      name="firstName" 
                      placeholder="First Name" 
                      value={form.firstName}
                      onChange={updateForm} 
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : ''}`} 
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <input 
                      name="lastName" 
                      placeholder="Last Name" 
                      value={form.lastName}
                      onChange={updateForm} 
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : ''}`} 
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="Email Address" 
                      value={form.email}
                      onChange={updateForm} 
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`} 
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <input 
                      name="phone" 
                      placeholder="Phone Number" 
                      value={form.phone}
                      onChange={updateForm} 
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : ''}`} 
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
                <button onClick={nextStep} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2: Delivery Address */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input 
                      name="address" 
                      placeholder="Street Address" 
                      value={form.address}
                      onChange={updateForm} 
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : ''}`} 
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <input 
                      name="city" 
                      placeholder="City" 
                      value={form.city}
                      onChange={updateForm} 
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : ''}`} 
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <select 
                      name="province" 
                      value={form.province}
                      onChange={updateForm} 
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Gauteng</option>
                      <option>Western Cape</option>
                      <option>KwaZulu-Natal</option>
                      <option>Eastern Cape</option>
                      <option>Free State</option>
                      <option>Limpopo</option>
                      <option>Mpumalanga</option>
                      <option>North West</option>
                      <option>Northern Cape</option>
                    </select>
                  </div>
                  <div>
                    <input 
                      name="postalCode" 
                      placeholder="Postal Code (4 digits)" 
                      value={form.postalCode}
                      onChange={updateForm} 
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.postalCode ? 'border-red-500' : ''}`} 
                    />
                    {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={prevStep} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Back</button>
                  <button onClick={nextStep} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Continue →</button>
                </div>
              </div>
            )}

            {/* Step 3: Payment - WITH PAYFAST */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Payment</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600"><strong>Customer:</strong> {form.firstName} {form.lastName}</p>
                  <p className="text-sm text-gray-600"><strong>Email:</strong> {form.email}</p>
                  <p className="text-sm text-gray-600"><strong>Phone:</strong> {form.phone}</p>
                  <p className="text-sm text-gray-600"><strong>Delivery:</strong> {form.address}, {form.city}, {form.province}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>R{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between"><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>VAT (15%)</span><span>R{vat.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Delivery</span><span>{deliveryFee === 0 ? 'Free' : `R${deliveryFee}`}</span></div>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span>Total</span>
                      <span className="text-blue-600">R{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 🔥 PAYFAST PAYMENT BUTTON - UPDATED WITH ALL DATA */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Pay with PayFast</h3>
                  <PayFastButton
                    amount={total}
                    email={form.email}
                    itemName={`TechStore Order - ${form.firstName} ${form.lastName}`}
                    buttonText={`Pay R${total.toFixed(2)} with PayFast`}
                    className="w-full py-3 text-lg"
                    firstName={form.firstName}
                    lastName={form.lastName}
                    phone={form.phone}
                    address={form.address}
                    city={form.city}
                    province={form.province}
                    postalCode={form.postalCode}
                    subtotal={subtotal}
                    vat={vat}
                    deliveryFee={deliveryFee}
                    total={total}
                    items={items}
                  />
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  <button 
                    onClick={prevStep} 
                    className="w-full px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}