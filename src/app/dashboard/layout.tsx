import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import {
  LayoutDashboard,
  Image,
  Package,
  Settings,
  BarChart3,
  Plus,
} from 'lucide-react'
import { authOptions } from '@/lib/auth'

const sidebarLinks = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Artworks', href: '/dashboard/artworks', icon: Image },
  { name: 'Orders', href: '/dashboard/orders', icon: Package },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login?callbackUrl=/dashboard')
  }

  if (!session.user.artistId) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto hidden lg:block">
          <div className="p-4">
            <Link
              href="/dashboard/artworks/new"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-gallery-accent text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Artwork
            </Link>
          </div>

          <nav className="px-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gallery-accent rounded-lg transition-colors"
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6">{children}</main>
      </div>
    </div>
  )
}
