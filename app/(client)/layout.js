import Navbar from '@/components/Custom/Navbar'

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  )
} 