"use client"

import { useEffect, useState } from 'react'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Custom/sideBar'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function AdminLayout({ children }) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is admin
    const checkAuth = async () => {
      try {
        const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
        
        if (!user || user.role !== 'ADMIN') {
          // Redirect non-admin users to home page
          router.push('/')
          return
        }
        
        setIsAdmin(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  // Only render admin layout if user is admin
  if (!isAdmin) return null

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
        {children}
      </main>
    </div>
  )
}
