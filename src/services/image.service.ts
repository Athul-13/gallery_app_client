import apiClient from '@/api'
import { API_ROUTES } from '@/constants'
import type {
  Image,
  BulkUploadResponse,
  PaginatedImagesResponse,
  ApiResponse,
} from '@/types'

/**
 * Image service
 * Handles all image-related API calls
 */
export const imageService = {
  /**
   * Upload single image
   * @param file - Image file to upload
   * @param title - Image title
   * @returns Uploaded image
   */
  async uploadImage(file: File, title: string): Promise<Image> {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('title', title)

    const response = await apiClient.post<ApiResponse<Image>>(
      API_ROUTES.IMAGE.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data.data
  },

  /**
   * Upload multiple images (bulk upload)
   * @param files - Array of image files to upload
   * @param titles - Array of titles corresponding to each file
   * @returns Bulk upload response with all uploaded images
   */
  async uploadBulkImages(
    files: File[],
    titles: string[]
  ): Promise<BulkUploadResponse> {
    const formData = new FormData()

    // Append all files
    files.forEach((file) => {
      formData.append('images', file)
    })

    // Append all titles
    titles.forEach((title) => {
      formData.append('titles', title)
    })

    const response = await apiClient.post<ApiResponse<BulkUploadResponse>>(
      API_ROUTES.IMAGE.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data.data
  },

  /**
   * Get all images for authenticated user
   * @param options - Pagination options
   * @returns Paginated images response
   */
  async getUserImages(options?: {
    page?: number
    limit?: number
  }): Promise<PaginatedImagesResponse> {
    const params = new URLSearchParams()

    if (options?.page) {
      params.append('page', options.page.toString())
    }

    if (options?.limit) {
      params.append('limit', options.limit.toString())
    }

    const queryString = params.toString()
    const url = queryString
      ? `${API_ROUTES.IMAGE.GET_ALL}?${queryString}`
      : API_ROUTES.IMAGE.GET_ALL

    const response = await apiClient.get<ApiResponse<PaginatedImagesResponse>>(
      url
    )

    return response.data.data
  },

  /**
   * Get image by ID
   * @param id - Image ID
   * @returns Image details
   */
  async getImageById(id: string): Promise<Image> {
    const response = await apiClient.get<ApiResponse<Image>>(
      API_ROUTES.IMAGE.GET_BY_ID(id)
    )

    return response.data.data
  },
}
