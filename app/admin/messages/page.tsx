'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { 
  Search, Mail, CheckCircle, Trash2, Inbox, RefreshCw, 
  Reply, Send, User, Calendar, Clock, Bell, MessageSquare
} from 'lucide-react'

export default function AdminMessages() {
  const supabase = createClient()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [replySuccess, setReplySuccess] = useState('')
  const [showReplyForm, setShowReplyForm] = useState(false)

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

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setMessages(data || [])
    }
    setLoading(false)
    
    // ✅ Update parent layout badge count
    await updateBadgeCount()
  }

  // ✅ Function to update badge count in parent
  async function updateBadgeCount() {
    try {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread')
      
      // Dispatch event to update sidebar badge
      window.dispatchEvent(new CustomEvent('messageCountUpdate', { detail: { unread: count || 0 } }))
    } catch (error) {
      console.error('Error updating badge count:', error)
    }
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from('messages')
      .update({ status: 'read', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' } : m))
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: 'read' })
      }
      // ✅ Update badge count after marking as read
      await updateBadgeCount()
    }
  }

  async function deleteMessage(id: string) {
    if (confirm('Delete this message?')) {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id)

      if (!error) {
        setMessages(messages.filter(m => m.id !== id))
        if (selectedMessage?.id === id) {
          setSelectedMessage(null)
          setShowReplyForm(false)
        }
        // ✅ Update badge count after deleting
        await updateBadgeCount()
      }
    }
  }

  async function sendReply(id: string) {
    if (!replyText.trim()) return
    
    setReplying(true)
    setReplySuccess('')
    
    const { error } = await supabase
      .from('messages')
      .update({
        reply: replyText,
        replied_at: new Date().toISOString(),
        status: 'read'
      })
      .eq('id', id)

    if (!error) {
      setReplySuccess('✅ Reply sent successfully!')
      setReplyText('')
      setShowReplyForm(false)
      loadMessages()
      
      if (selectedMessage?.id === id) {
        setSelectedMessage({
          ...selectedMessage,
          reply: replyText,
          replied_at: new Date().toISOString()
        })
      }
      // ✅ Update badge count after replying
      await updateBadgeCount()
      setTimeout(() => setReplySuccess(''), 4000)
    } else {
      setReplySuccess('❌ Failed to send reply. Please try again.')
    }
    setReplying(false)
  }

  const unreadCount = messages.filter(m => m.status === 'unread').length
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus ? msg.status === filterStatus : true
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with Notification Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <MessageSquare size={24} className="text-blue-600" />
            Customer Messages
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Total: <span className="font-semibold text-blue-600">{messages.length}</span> messages
            {' | '}
            <span className="font-semibold text-red-600">{unreadCount}</span> unread
            {' | '}
            <span className="font-semibold text-green-600">{messages.filter(m => m.reply).length}</span> replied
          </p>
        </div>
        <button 
          onClick={loadMessages}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by customer name, email or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 min-w-[150px]"
        >
          <option value="">All Messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <Inbox className="mx-auto mb-3 text-gray-300" size={40} />
                <p>No messages found</p>
              </div>
            ) : (
              filteredMessages.map((message) => {
                const msgDate = formatDateTime(message.created_at)
                return (
                  <div 
                    key={message.id} 
                    className={`px-6 py-4 hover:bg-gray-50/50 transition cursor-pointer ${
                      message.status === 'unread' ? 'bg-blue-50/30 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => {
                      setSelectedMessage(message)
                      setShowReplyForm(false)
                      setReplyText('')
                      if (message.status === 'unread') {
                        markAsRead(message.id)
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {message.name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium text-gray-800 truncate">{message.name}</span>
                          <span className="text-xs text-gray-400 truncate">({message.email})</span>
                          {message.status === 'unread' && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-600 flex-shrink-0">New</span>
                          )}
                          {message.reply && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-600 flex-shrink-0">Replied ✓</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-700 mt-1 truncate">{message.subject}</p>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{message.message}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                          <span>📅 {msgDate.date}</span>
                          <span>🕐 {msgDate.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteMessage(message.id); }}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Message Details + Reply */}
        <div className="lg:col-span-1">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            {selectedMessage ? (
              <div>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {selectedMessage.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{selectedMessage.name}</p>
                    <p className="text-sm text-gray-500 truncate">{selectedMessage.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Subject</label>
                    <p className="font-medium text-gray-800 mt-1">{selectedMessage.subject}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Message</label>
                    <div className="mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>📅 {formatDateTime(selectedMessage.created_at).date}</span>
                    <span>🕐 {formatDateTime(selectedMessage.created_at).time}</span>
                  </div>

                  {/* Show Reply if exists */}
                  {selectedMessage.reply && (
                    <div className="mt-3">
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Admin Reply</label>
                      <div className="mt-1 bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 leading-relaxed whitespace-pre-wrap">
                          {selectedMessage.reply}
                        </p>
                        {selectedMessage.replied_at && (
                          <p className="text-xs text-gray-400 mt-2">
                            Replied: {formatDateTime(selectedMessage.replied_at).full}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    {!showReplyForm ? (
                      <button
                        onClick={() => {
                          setShowReplyForm(true)
                          setReplyText('')
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        <Reply size={16} />
                        Reply to {selectedMessage.name}
                      </button>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Reply to Customer</label>
                          <button
                            onClick={() => setShowReplyForm(false)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                        <textarea
                          rows={4}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Write your reply to ${selectedMessage.name}...`}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        {replySuccess && (
                          <p className={`text-sm mt-2 ${replySuccess.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                            {replySuccess}
                          </p>
                        )}
                        <button
                          onClick={() => sendReply(selectedMessage.id)}
                          disabled={replying || !replyText.trim()}
                          className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition ${
                            replying || !replyText.trim()
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          <Send size={16} />
                          {replying ? 'Sending...' : 'Send Reply to Customer'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="mx-auto text-gray-300" size={48} />
                <p className="text-gray-500 mt-3">Select a message to view</p>
                <p className="text-sm text-gray-400 mt-1">Click on any message from the list</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}