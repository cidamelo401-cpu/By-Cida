'use client'

import { useState, useEffect, useCallback } from 'react'

export type CartItem = {
  id: string
  name: string
  product_type: string
  size: string
  sizeLabel: string
  price: number
  photo_url: string | null
}

const CART_KEY = 'pijamas-cart'

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch {
    // storage full or blocked
  }
}

// Simple event emitter for cross-component sync
const listeners = new Set<() => void>()
function notify() {
  listeners.forEach((fn) => fn())
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  // Sync from localStorage on mount and on notify
  const sync = useCallback(() => {
    setItems(readCart())
  }, [])

  useEffect(() => {
    sync()
    listeners.add(sync)
    return () => { listeners.delete(sync) }
  }, [sync])

  const addItem = useCallback((item: CartItem) => {
    const current = readCart()
    // Don't add duplicates (same product id)
    if (current.some((i) => i.id === item.id)) return
    const updated = [...current, item]
    writeCart(updated)
    setItems(updated)
    notify()
  }, [])

  const removeItem = useCallback((id: string) => {
    const current = readCart()
    const updated = current.filter((i) => i.id !== id)
    writeCart(updated)
    setItems(updated)
    notify()
  }, [])

  const clearCart = useCallback(() => {
    writeCart([])
    setItems([])
    notify()
  }, [])

  const isInCart = useCallback((id: string) => {
    return items.some((i) => i.id === id)
  }, [items])

  return { items, addItem, removeItem, clearCart, isInCart }
}
