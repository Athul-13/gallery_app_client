import { useState } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { useAuthStore } from '@/store'
import { HiLogout, HiChevronDown, HiLockClosed } from 'react-icons/hi'
import clsx from 'clsx'
import { ChangePasswordModal } from '@/components/auth'

/**
 * Navbar Component
 * Fixed navbar at the top with user dropdown menu
 */
export const Navbar = () => {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/10" style={{ isolation: 'isolate' }}>
      {/* Backdrop blur pseudo-element */}
      <div 
        className="absolute inset-0 bg-white/5"
        style={{
          backdropFilter: 'blur(4px) saturate(150%)',
          WebkitBackdropFilter: 'blur(4px) saturate(150%)',
          zIndex: -1,
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">Galley</h1>
          </div>

          {/* Right side - User dropdown menu */}
          {user && (
            <div className="flex items-center">
              <Menu as="div" className="relative">
                <MenuButton
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 rounded-md hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
                  aria-label="User menu"
                >
                  <span className="hidden sm:inline-block">{user.email}</span>
                  <span className="sm:hidden">Menu</span>
                  <HiChevronDown className="h-4 w-4" />
                </MenuButton>
                <MenuItems 
                  modal={false} 
                  className="absolute right-0 mt-4 w-48 rounded-md bg-white/5 border border-white/10 shadow-lg ring-1 ring-black/5 focus:outline-none"
                  style={{
                    backdropFilter: 'blur(4px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(4px) saturate(150%)',
                  }}
                >
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => setIsChangePasswordOpen(true)}
                        className={clsx(
                          'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                          focus
                            ? 'bg-white/10 text-white'
                            : 'text-white/80'
                        )}
                      >
                        <HiLockClosed className="h-4 w-4" />
                        Change Password
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={logout}
                        className={clsx(
                          'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                          focus
                            ? 'bg-red-500/20 text-red-400'
                            : 'text-red-400/80'
                        )}
                      >
                        <HiLogout className="h-4 w-4" />
                        Logout
                      </button>
                    )}
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </nav>
  )
}
