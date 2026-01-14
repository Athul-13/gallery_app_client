/**
 * Application Configuration Constants
 */

export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  APP_NAME: 'Galley App',
  // Add other app-wide config constants here
} as const
