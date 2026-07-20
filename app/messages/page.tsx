'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Link from 'next/link'
import { Mail, Inbox, MessageSquare, CheckCircle, Clock, RefreshCw, Bell } from 'lucide-react'

export default function CustomerMessages() {
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Format date and time
  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: 'N/A', time: 'N/A', full: 'N/A' }
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      full: date.toLocaleString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  async function loadMessages() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login?redirect=messages')
      return
    }

    setUser(session.user)

    console.log('📧 Customer logged in as:', session.user.email)

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('email', session.user.email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error loading messages:', error)
    } else {
      console.log('✅ Messages loaded:', data)
      setMessages(data || [])
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadMessages()
  }

  const unreadCount = messages.filter(m => m.status === 'unread').length
  const repliedCount = messages.filter(m => m.reply).length

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

  return (
    <>
      <Header />
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-10 overflow-hidden">
        {/* Background Logo */}
        <div className="absolute inset-0 opacity-[0.04] flex items-center justify-center pointer-events-none">
          <img 
            src="/images/products/logo.jpg"
            alt="NetApps Development"
            className="object-contain w-[70%] h-[70%] max-w-5xl mx-auto"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Header with Notification Badge */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                  <Mail size={28} className="text-blue-600" />
                  My Messages
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </h1>
                <p className="text-gray-500 mt-1">
                  {messages.length} messages total
                  {' • '}
                  <span className="text-blue-600">{unreadCount}</span> unread
                  {' • '}
                  <span className="text-green-600">{repliedCount}</span> replied
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <Link 
                  href="/contact"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  ✏️ New Message
                </Link>
              </div>
            </div>

            {/* Messages List */}
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="mx-auto text-gray-300" size={48} />
                <p className="text-gray-500 mt-3">No messages yet</p>
                <Link href="/contact" className="text-blue-600 hover:underline mt-2 inline-block">
                  Send your first message →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const created = formatDateTime(msg.created_at)
                  const replied = msg.replied_at ? formatDateTime(msg.replied_at) : null
                  
                  return (
                    <div key={msg.id} className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition ${
                      msg.status === 'unread' ? 'border-blue-300 bg-blue-50/20' : 'border-gray-100'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className={msg.status === 'unread' ? 'text-blue-600' : 'text-gray-400'} />
                          <span className="font-medium text-gray-800">{msg.subject}</span>
                          {msg.status === 'unread' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-600">Unread</span>
                          )}
                          {msg.reply && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-600 flex items-center gap-1">
                              <CheckCircle size={10} /> Replied
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{created.date}</p>
                          <p className="text-xs text-gray-400">{created.time}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600">{msg.message}</p>
                      
                      {/* ✅ Show Admin Reply */}
                      {msg.reply ? (
                        <div className="mt-3 bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                            <MessageSquare size={14} />
                            <span className="font-medium">Admin Reply:</span>
                          </div>
                          <p className="text-sm text-gray-700">{msg.reply}</p>
                          {replied && (
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <Clock size={12} />
                              Replied on {replied.date} at {replied.time}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-2">⏳ Awaiting reply</p>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-400 flex items-center gap-3">
                        <span>📧 {msg.email}</span>
                        <span>•</span>
                        <span>Status: {msg.status}</span>
                        <span>•</span>
                        <span>🕐 {created.full}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}