import { useAuthStore } from '@/store'
import { HiLogout } from 'react-icons/hi'

/**
 * Navbar Component
 * Fixed navbar at the top with logout button
 */
export const Navbar = () => {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/5 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">Galley</h1>
          </div>

          {/* Right side - User info and Logout */}
          <div className="flex items-center gap-4">
            {user && (
              <span className="hidden sm:inline-block text-sm text-white/80">
                {user.email}
              </span>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600/80 rounded-md hover:bg-red-600 active:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              aria-label="Logout"
            >
              <HiLogout className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
