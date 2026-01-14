import { create } from 'zustand'
import { authService } from '@/services'
import type { User, RegisterData, LoginCredentials } from '@/types'
import toast from 'react-hot-toast'

/**
 * Auth Store State Interface
 */
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Auth Store Actions Interface
 */
interface AuthActions {
  // Auth operations
  register: (data: RegisterData) => Promise<void>
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  
  // Password operations
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  
  // State management
  setUser: (user: User | null) => void
  clearError: () => void
  clearAuth: () => void
}

/**
 * Combined Auth Store Type
 */
type AuthStore = AuthState & AuthActions

/**
 * Create Auth Store using Zustand 
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null })
    
    try {
      const userData = await authService.register(data)
      
      // Convert RegisterResponse to User type
      const user: User = {
        id: userData.id,
        email: userData.email,
        phone: userData.phone,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      }
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      toast.success('Registration successful!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error // Re-throw so caller can handle if needed
    }
  },

  /**
   * Login user
   */
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await authService.login(credentials)
      
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        phone: response.user.phone,
        createdAt: '',
        updatedAt: '',
      }
      
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      toast.success('Login successful!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    set({ isLoading: true })
    
    try {
      await authService.logout()
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      
      toast.success('Logged out successfully')
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      
      const errorMessage = error instanceof Error ? error.message : 'Logout failed'
      toast.error(errorMessage)
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    try {
      const response = await authService.refreshToken()
      
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        phone: response.user.phone,
        createdAt: get().user?.createdAt || '',
        updatedAt: get().user?.updatedAt || '',
      }
      
      set({
        user,
        isAuthenticated: true,
        error: null,
      })
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      })
      throw error
    }
  },

  // ============================================
  // PASSWORD ACTIONS
  // ============================================

  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await authService.changePassword({ currentPassword, newPassword })
      set({ isLoading: false })
      toast.success('Password changed successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password'
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  },

  requestPasswordReset: async (email: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await authService.requestPasswordReset({ email })
      set({ isLoading: false })
      toast.success('Password reset email sent!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email'
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await authService.resetPassword({ token, newPassword })
      set({ isLoading: false })
      toast.success('Password reset successful!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password'
      set({ isLoading: false, error: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  },

  /**
   * Set user directly
   */
  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    })
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null })
  },

  /**
   * Clear all auth state
   */
  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
    })
  },
}))
