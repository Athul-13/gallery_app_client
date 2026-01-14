/**
 * User types for the frontend application
 */

/**
 * User data structure (without password)
 * This matches the user object returned from the API
 */
export interface User {
  id: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
}

/**
 * User creation data (for registration)
 */
export interface CreateUser {
  email: string
  phone: string
  password: string
}
