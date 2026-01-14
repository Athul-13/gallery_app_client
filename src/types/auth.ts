/**
 * Authentication types for the frontend application
 */

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  userId: string
  email: string
}

/**
 * Token pair structure
 */
export interface Tokens {
  accessToken: string
  refreshToken: string
}

/**
 * User registration data
 */
export interface RegisterData {
  email: string
  phone: string
  password: string
}

/**
 * User login credentials
 * Note: Server implementation currently only supports email login
 * Tokens are sent as HTTP-only cookies, not in response body
 */
export interface LoginCredentials {
  email?: string
  phone?: string
  password: string
}

/**
 * User registration response
 * Returns user object without tokens (tokens are not sent for registration)
 */
export interface RegisterResponse {
  id: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
}

/**
 * Login response
 * Tokens are sent as HTTP-only cookies, not in response body
 */
export interface LoginResponse {
  user: {
    id: string
    email: string
    phone: string
  }
}

/**
 * Token refresh response
 * Access token is sent as HTTP-only cookie, not in response body
 */
export interface TokenRefreshResponse {
  user: {
    id: string
    email: string
    phone: string
  }
}

/**
 * Change password data (for authenticated users)
 */
export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

/**
 * Change password response
 */
export interface ChangePasswordResponse {
  message: string
}

/**
 * Request password reset data
 */
export interface RequestPasswordResetData {
  email: string
}

/**
 * Password reset request response
 * resetToken is only included in development mode
 */
export interface RequestPasswordResetResponse {
  message: string
  resetToken?: string
}

/**
 * Reset password data
 */
export interface ResetPasswordData {
  token: string
  newPassword: string
}

/**
 * Reset password response
 */
export interface ResetPasswordResponse {
  message: string
}

/**
 * Logout response
 */
export interface LogoutResponse {
  success: boolean
  message: string
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
