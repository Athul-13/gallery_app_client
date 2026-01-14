import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types'
import { APP_CONFIG } from '@/constants'
import { API_ROUTES } from '@/constants'
import { useAuthStore } from '@/store'

/**
 * Create axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

/**
 * Request interceptor
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Token refresh state management
 */
let isRefreshing = false
let refreshPromise: Promise<void> | null = null

/**
 * Helper: Handle session expiration
 */
const handleSessionExpired = (errorData: unknown) => {
  useAuthStore.getState().clearAuth()
  return Promise.reject({
    message: 'Session expired. Please login again.',
    status: 401,
    data: errorData,
  })
}

/**
 * Helper: Check if refresh should be skipped
 */
const shouldSkipRefresh = (request: InternalAxiosRequestConfig & { _retry?: boolean }): boolean => {
  return (
    request._retry === true || // Already retried
    request.url === API_ROUTES.AUTH.REFRESH_TOKEN // Refresh endpoint itself
  )
}

/**
 * Response interceptor
 * Handle errors consistently across the application
 * Implements automatic token refresh on 401 errors
 */
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Handle common error cases
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.message || 'An error occurred'

      // Handle 401 Unauthorized - Automatic token refresh
      if (status === 401 && originalRequest) {
        // Skip refresh if already retried or is refresh endpoint
        if (shouldSkipRefresh(originalRequest)) {
          return handleSessionExpired(error.response.data)
        }

        // If already refreshing, wait for it to complete then retry
        if (isRefreshing && refreshPromise) {
          return refreshPromise
            .then(() => apiClient(originalRequest))
            .catch(() => handleSessionExpired(error.response?.data))
        }

        // Start refresh process
        originalRequest._retry = true
        isRefreshing = true
        refreshPromise = useAuthStore.getState().refreshToken()

        try {
          await refreshPromise
          // Token refreshed successfully, retry original request
          return apiClient(originalRequest)
        } catch {
          // Refresh failed, clear auth and reject
          return handleSessionExpired(error.response.data)
        } finally {
          isRefreshing = false
          refreshPromise = null
        }
      }

      // Handle other error statuses
      return Promise.reject({
        message,
        status: error.response.status,
        data: error.response.data,
      })
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
      })
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        status: 0,
      })
    }
  }
)

export default apiClient
