'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function ContactPage() {
  const supabase = createClient()
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      console.log('Sending message:', form)
      
      const { data, error: insertError } = await supabase
        .from('messages')
        .insert({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          status: 'unread'
        })
        .select()

      console.log('Response:', data, insertError)

      if (insertError) {
        console.error('Insert Error:', insertError)
        setError('Failed to send message: ' + insertError.message)
      } else {
        setSuccess(true)
        setForm({ name: '', email: '', subject: '', message: '' })
        console.log('✅ Message sent successfully!')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  return (
    <>
      <Header />
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 overflow-hidden">
        {/* Background Logo */}
        <div className="absolute inset-0 opacity-[0.04] flex items-center justify-center pointer-events-none">
          <img 
            src="/images/products/logo.jpg"
            alt="NetApps Development"
            className="object-contain w-[70%] h-[70%] max-w-5xl mx-auto"
          />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
            <p className="text-gray-500 mb-6">We'd love to hear from you! Send us a message.</p>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                ✅ Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Order Inquiry"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={5}
                  placeholder="Write your message here..."
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">
                📧 Or email us directly: <strong>info@netappsdevelopment.com</strong>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                📞 Call us: <strong>071 175 3994</strong>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                📍 125 Florence Nzama Street, North Beach, Durban, 4001
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}