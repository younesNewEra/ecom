import { Inter } from 'next/font/google'
import Sidebar from '@/components/Custom/sideBar'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Admin Panel',
  description: 'Modern and responsive admin panel',
}

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
