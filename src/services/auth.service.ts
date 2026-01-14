import apiClient from '@/api'
import { API_ROUTES } from '@/constants'
import type {
  RegisterData,
  RegisterResponse,
  LoginCredentials,
  LoginResponse,
  TokenRefreshResponse,
  ChangePasswordData,
  ChangePasswordResponse,
  RequestPasswordResetData,
  RequestPasswordResetResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  LogoutResponse,
} from '@/types'

/**
 * Authentication service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      API_ROUTES.AUTH.REGISTER,
      data
    )
    return response.data
  },

  /**
   * Login user
   * Tokens are automatically set as HTTP-only cookies by the server
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ROUTES.AUTH.LOGIN,
      credentials
    )
    return response.data
  },

  /**
   * Logout user
   * Clears authentication cookies
   */
  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>(
      API_ROUTES.AUTH.LOGOUT
    )
    return response.data
  },

  /**
   * Refresh access token
   * Refresh token is sent automatically via HTTP-only cookie
   * New access token is returned as HTTP-only cookie
   */
  async refreshToken(): Promise<TokenRefreshResponse> {
    const response = await apiClient.post<TokenRefreshResponse>(
      API_ROUTES.AUTH.REFRESH_TOKEN
    )
    return response.data
  },

  /**
   * Change password (authenticated user)
   */
  async changePassword(data: ChangePasswordData): Promise<ChangePasswordResponse> {
    const response = await apiClient.post<ChangePasswordResponse>(
      API_ROUTES.AUTH.CHANGE_PASSWORD,
      data
    )
    return response.data
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(
    data: RequestPasswordResetData
  ): Promise<RequestPasswordResetResponse> {
    const response = await apiClient.post<RequestPasswordResetResponse>(
      API_ROUTES.AUTH.REQUEST_PASSWORD_RESET,
      data
    )
    return response.data
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ResetPasswordResponse>(
      API_ROUTES.AUTH.RESET_PASSWORD,
      data
    )
    return response.data
  },
}
