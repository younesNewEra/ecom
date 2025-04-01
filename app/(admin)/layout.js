import AdminNavbar from '@/components/Custom/AdminNavbar'

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar>
        {children}
      </AdminNavbar>
    </div>
  )
} 