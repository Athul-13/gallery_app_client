import { useAuthStore } from '@/store'

/**
 * Dashboard Page (Protected)
 */
export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-white/10 rounded-lg p-8 bg-white/5">
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome to Dashboard
            </h1>
            {user && (
              <div className="mb-4">
                <p className="text-white/80">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-white/80">
                  <strong>Phone:</strong> {user.phone}
                </p>
              </div>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600/80 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
