import { create } from 'zustand'
import { imageService } from '@/services'
import type {
  Image,
  UploadProgress,
  ImageUploadState,
} from '@/types'
import toast from 'react-hot-toast'

/**
 * Image Store State Interface
 */
interface ImageState {
  images: Image[]
  total: number
  page: number
  limit: number
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  
  // Upload state
  uploadState: ImageUploadState
  uploadProgress: UploadProgress | null
  
  // Selected files for upload (before upload starts)
  selectedFiles: File[]
  selectedTitles: string[]
}

/**
 * Image Store Actions Interface
 */
interface ImageActions {
  // Image operations
  fetchImages: (options?: { page?: number; limit?: number; append?: boolean }) => Promise<void>
  uploadImage: (file: File, title: string) => Promise<void>
  uploadBulkImages: (files: File[], titles: string[]) => Promise<void>
  getImageById: (id: string) => Promise<Image | null>
  deleteImage: (id: string) => Promise<void>
  updateImageViaAPI: (
    id: string,
    updates: { title?: string; order?: number; file?: File }
  ) => Promise<void>
  
  // Upload state management
  setUploadState: (state: ImageUploadState) => void
  setUploadProgress: (progress: UploadProgress | null) => void
  setSelectedFiles: (files: File[]) => void
  setSelectedTitles: (titles: string[]) => void
  clearUploadState: () => void
  
  // State management
  addImage: (image: Image) => void
  addImages: (images: Image[]) => void
  updateImage: (id: string, updates: Partial<Image>) => void
  removeImage: (id: string) => void
  clearError: () => void
  reset: () => void
}

/**
 * Combined Image Store Type
 */
type ImageStore = ImageState & ImageActions

/**
 * Initial state
 */
const initialState: ImageState = {
  images: [],
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  uploadState: 'idle',
  uploadProgress: null,
  selectedFiles: [],
  selectedTitles: [],
}

/**
 * Create Image Store using Zustand
 */
export const useImageStore = create<ImageStore>((set, get) => ({
  ...initialState,

  /**
   * Fetch all images for authenticated user
   * @param options - Pagination options and append flag
   * @param options.page - Page number (default: 1)
   * @param options.limit - Number of images per page (default: 20)
   * @param options.append - Whether to append to existing images (default: false)
   */
  fetchImages: async (options?: { page?: number; limit?: number; append?: boolean }) => {
    const { append = false } = options || {}
    
    // Set appropriate loading state
    if (append) {
      set({ isLoadingMore: true, error: null })
    } else {
      set({ isLoading: true, error: null })
    }

    try {
      const result = await imageService.getUserImages(options)

      if (append) {
        // Append new images to existing ones
        set((state) => ({
          images: [...state.images, ...result.images],
          total: result.total,
          page: result.page,
          limit: result.limit,
          isLoadingMore: false,
          error: null,
        }))
      } else {
        // Replace all images (initial load or refresh)
        set({
          images: result.images,
          total: result.total,
          page: result.page,
          limit: result.limit,
          isLoading: false,
          isLoadingMore: false,
          error: null,
        })
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch images'
      
      if (append) {
        set({
          isLoadingMore: false,
          error: errorMessage,
        })
      } else {
        set({
          isLoading: false,
          error: errorMessage,
        })
      }
      
      toast.error(errorMessage)
      throw error
    }
  },

  /**
   * Upload single image
   */
  uploadImage: async (file: File, title: string) => {
    set({
      uploadState: 'uploading',
      uploadProgress: {
        currentImage: 1,
        totalImages: 1,
        currentImageName: file.name,
        percentage: 0,
      },
      error: null,
    })

    try {
      const image = await imageService.uploadImage(file, title)

      // Add image to store
      set((state) => ({
        images: [image, ...state.images],
        total: state.total + 1,
        uploadState: 'success',
        uploadProgress: null,
      }))

      toast.success('Image uploaded successfully')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload image'
      set({
        uploadState: 'error',
        uploadProgress: null,
        error: errorMessage,
      })
      toast.error(errorMessage)
      throw error
    }
  },

  /**
   * Upload multiple images (bulk upload)
   * Uploads images sequentially to track per-image progress
   * Stops all uploads on error and shows which image failed
   */
  uploadBulkImages: async (files: File[], titles: string[]) => {
    const totalImages = files.length
    const uploadedImages: Image[] = []
    let failedImageIndex: number | null = null

    set({
      uploadState: 'uploading',
      uploadProgress: {
        currentImage: 0,
        totalImages,
        currentImageName: files[0]?.name || '',
        percentage: 0,
      },
      error: null,
    })

    try {
      // Upload images sequentially to track progress
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const title = titles[i]
        const currentImageNum = i + 1

        // Update progress before uploading
        set({
          uploadProgress: {
            currentImage: currentImageNum,
            totalImages,
            currentImageName: file.name,
            percentage: (i / totalImages) * 100,
          },
        })

        try {
          // Upload single image
          const image = await imageService.uploadImage(file, title)
          uploadedImages.push(image)

          // Update progress after uploading
          set({
            uploadProgress: {
              currentImage: currentImageNum,
              totalImages,
              currentImageName: file.name,
              percentage: (currentImageNum / totalImages) * 100,
            },
          })
        } catch (error) {
          // Stop all uploads on first error
          failedImageIndex = i
          throw error
        }
      }

      // Add all successfully uploaded images to store
      if (uploadedImages.length > 0) {
        set((state) => ({
          images: [...uploadedImages, ...state.images],
          total: state.total + uploadedImages.length,
        }))
      }

      // Set success state
      set({
        uploadState: 'success',
        uploadProgress: null,
      })

      if (uploadedImages.length === totalImages) {
        toast.success(`Successfully uploaded ${uploadedImages.length} image(s)`)
      } else {
        toast.error(
          `Upload failed. ${uploadedImages.length} of ${totalImages} images uploaded successfully.`
        )
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to upload images'
      
      const detailedMessage =
        failedImageIndex !== null
          ? `Failed to upload image ${failedImageIndex + 1} (${files[failedImageIndex]?.name}): ${errorMessage}`
          : errorMessage

      set({
        uploadState: 'error',
        uploadProgress: null,
        error: detailedMessage,
      })
      
      toast.error(detailedMessage)
      throw error
    }
  },

  /**
   * Get image by ID
   */
  getImageById: async (id: string) => {
    set({ isLoading: true, error: null })

    try {
      const image = await imageService.getImageById(id)

      // Update image in store if it exists
      set((state) => {
        const existingIndex = state.images.findIndex((img) => img.id === id)
        if (existingIndex !== -1) {
          const updatedImages = [...state.images]
          updatedImages[existingIndex] = image
          return { images: updatedImages, isLoading: false }
        }
        return { isLoading: false }
      })

      return image
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch image'
      set({
        isLoading: false,
        error: errorMessage,
      })
      toast.error(errorMessage)
      return null
    }
  },

  /**
   * Delete an image via API
   */
  deleteImage: async (id: string) => {
    // Optimistically remove from store
    const imageToDelete = get().images.find((img) => img.id === id)
    get().removeImage(id)

    try {
      await imageService.deleteImage(id)
      toast.success('Image deleted successfully')
    } catch (error) {
      // Revert optimistic update on error
      if (imageToDelete) {
        get().addImage(imageToDelete)
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete image'
      set({ error: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  },

  /**
   * Update an image via API
   */
  updateImageViaAPI: async (
    id: string,
    updates: { title?: string; order?: number; file?: File }
  ) => {
    // Optimistically update in store
    const originalImage = get().images.find((img) => img.id === id)
    if (originalImage) {
      get().updateImage(id, updates as Partial<Image>)
    }

    // Set upload state and progress if file is being updated
    const isUpdatingFile = !!updates.file
    const imageName = originalImage?.title || updates.file?.name || 'image'

    if (isUpdatingFile) {
      set({
        uploadState: 'uploading',
        uploadProgress: {
          currentImage: 1,
          totalImages: 1,
          currentImageName: imageName,
          percentage: 0,
        },
      })
    }

    try {
      const updatedImage = await imageService.updateImage(id, updates)

      // Update with server response
      get().updateImage(id, updatedImage)
      
      if (isUpdatingFile) {
        set({
          uploadState: 'success',
          uploadProgress: null,
        })
      }
      
      toast.success('Image updated successfully')
    } catch (error) {
      // Revert optimistic update on error
      if (originalImage) {
        get().updateImage(id, originalImage)
      }
      
      if (isUpdatingFile) {
        set({
          uploadState: 'error',
          uploadProgress: null,
        })
      }
      
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update image'
      set({ error: errorMessage })
      toast.error(errorMessage)
      throw error
    }
  },

  /**
   * Set upload state
   */
  setUploadState: (state: ImageUploadState) => {
    set({ uploadState: state })
  },

  /**
   * Set upload progress
   */
  setUploadProgress: (progress: UploadProgress | null) => {
    set({ uploadProgress: progress })
  },

  /**
   * Set selected files for upload
   */
  setSelectedFiles: (files: File[]) => {
    set({ selectedFiles: files })
  },

  /**
   * Set selected titles for upload
   */
  setSelectedTitles: (titles: string[]) => {
    set({ selectedTitles: titles })
  },

  /**
   * Clear upload state
   */
  clearUploadState: () => {
    set({
      uploadState: 'idle',
      uploadProgress: null,
      selectedFiles: [],
      selectedTitles: [],
    })
  },

  /**
   * Add single image to store
   */
  addImage: (image: Image) => {
    set((state) => ({
      images: [image, ...state.images],
      total: state.total + 1,
    }))
  },

  /**
   * Add multiple images to store
   */
  addImages: (images: Image[]) => {
    set((state) => ({
      images: [...images, ...state.images],
      total: state.total + images.length,
    }))
  },

  /**
   * Update image in store
   */
  updateImage: (id: string, updates: Partial<Image>) => {
    set((state) => {
      const index = state.images.findIndex((img) => img.id === id)
      if (index === -1) return state

      const updatedImages = [...state.images]
      updatedImages[index] = { ...updatedImages[index], ...updates }
      return { images: updatedImages }
    })
  },

  /**
   * Remove image from store
   */
  removeImage: (id: string) => {
    set((state) => {
      const filteredImages = state.images.filter((img) => img.id !== id)
      return {
        images: filteredImages,
        total: Math.max(0, state.total - 1),
      }
    })
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null })
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState)
  },
}))
