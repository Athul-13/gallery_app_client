/**
 * API Route Constants
 * Centralized location for all API endpoint paths
 */

export const API_ROUTES = {
  // Auth routes
  AUTH: {
    BASE: '/auth',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    CHANGE_PASSWORD: '/auth/change-password',
    REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
    RESET_PASSWORD: '/auth/reset-password',
  },
  // User routes (if implemented in future)
  USER: {
    BASE: '/user',
    PROFILE: '/user/profile',
  },
} as const
