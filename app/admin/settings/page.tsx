'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { Save, RefreshCw } from 'lucide-react'

export default function AdminSettings() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const [settings, setSettings] = useState({
    site_name: 'NetApps Development',
    email: 'info@netappsdevelopment.com',
    phone: '071 175 3994',
    address: '125 Florence Nzama Street, North Beach, Durban, 4001',
    currency: 'ZAR',
    tax_rate: 15,
    shipping_fee: 99,
    free_shipping_threshold: 500,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()
      
      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
    setLoading(false)
  }

  async function saveSettings() {
    setSaving(true)
    setMessage('')
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1,
          site_name: settings.site_name,
          email: settings.email,
          phone: settings.phone,
          address: settings.address,
          currency: settings.currency,
          tax_rate: settings.tax_rate,
          shipping_fee: settings.shipping_fee,
          free_shipping_threshold: settings.free_shipping_threshold,
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        setMessage('❌ Failed to save settings')
        console.error('Error:', error)
      } else {
        setMessage('✅ Settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('❌ Error saving settings')
      console.error('Error:', error)
    }
    setSaving(false)
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
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store settings</p>
        </div>
        <button 
          onClick={loadSettings}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg mb-4 ${
          message.includes('✅') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Store Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              rows={3}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-6">Store Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ZAR">ZAR - South African Rand</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                value={settings.tax_rate}
                onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Fee (R)</label>
              <input
                type="number"
                value={settings.shipping_fee}
                onChange={(e) => setSettings({ ...settings, shipping_fee: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (R)</label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white transition ${
              saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}