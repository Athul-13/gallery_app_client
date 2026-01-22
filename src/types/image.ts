/**
 * Image types for the frontend application
 */

/**
 * Image interface matching server response
 */
export interface Image {
  id: string
  title: string
  url: string
  order: number
  ownerId: string
  createdAt: string
  updatedAt: string
}

/**
 * Bulk image upload response
 */
export interface BulkUploadResponse {
  images: Image[]
  total: number
}

/**
 * Paginated images response
 */
export interface PaginatedImagesResponse {
  images: Image[]
  total: number
  page: number
  limit: number
}

/**
 * Upload image data (for single upload)
 */
export interface UploadImageData {
  file: File
  title: string
}

/**
 * Bulk upload image data (for multiple uploads)
 */
export interface BulkUploadImageData {
  files: File[]
  titles: string[]
}

/**
 * Upload progress information
 */
export interface UploadProgress {
  currentImage: number
  totalImages: number
  currentImageName: string
  percentage: number
}

/**
 * Image upload state
 */
export type ImageUploadState = 'idle' | 'uploading' | 'success' | 'error'

/**
 * Bulk order update request payload
 */
export interface BulkOrderUpdateRequest {
  orders: Array<{
    id: string
    order: number
  }>
}

/**
 * Bulk order update response
 */
export interface BulkOrderUpdateResponse {
  images: Image[]
  total: number
}
