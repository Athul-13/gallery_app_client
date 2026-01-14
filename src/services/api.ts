import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types'
import { APP_CONFIG } from '@/constants'

/**
 * Create axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies (for HTTP-only tokens)
})

/**
 * Request interceptor
 * Can be used to add auth tokens or modify requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any request modifications here if needed
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor
 * Handle errors consistently across the application
 */
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    // Handle common error cases
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.message || 'An error occurred'
      
      // Handle 401 Unauthorized - token refresh logic to be added here
      if (error.response.status === 401) {
        // TODO: Add token refresh logic when implementing routes
        // - Call refresh token endpoint
        // - Retry original request on success
        // - Redirect to login on failure
        console.error('Unauthorized access')
      }
      
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
