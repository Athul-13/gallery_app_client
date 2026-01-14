/**
 * Frontend Route Constants
 * Centralized location for all application routes
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  GALLERY: '/gallery',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const
