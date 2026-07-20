'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  image_url: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: any) => void
  removeFromCart: (id: string) => void
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage when page loads
  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      setItems(JSON.parse(saved))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: any) => {
    setItems(current => {
      const exists = current.find(item => item.id === product.id)
      if (exists) {
        return current.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...current, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setItems(current => current.filter(item => item.id !== id))
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}