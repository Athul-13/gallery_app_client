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
          <div className="border-4 border-dashed border-white/10 rounded-lg p-5 sm:p-6 lg:p-8 bg-white/5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Welcome to Dashboard
            </h1>
            {user && (
              <div className="mb-4 space-y-2">
                <p className="text-sm sm:text-base text-white/80 break-words">
                  <strong className="font-semibold">Email:</strong> {user.email}
                </p>
                <p className="text-sm sm:text-base text-white/80 break-words">
                  <strong className="font-semibold">Phone:</strong> {user.phone}
                </p>
              </div>
            )}
            <button
              onClick={logout}
              className="px-5 py-3 sm:px-4 sm:py-2 text-base sm:text-sm bg-red-600/80 text-white rounded-md hover:bg-red-600 active:bg-red-700 transition-colors min-h-[44px] touch-manipulation"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
