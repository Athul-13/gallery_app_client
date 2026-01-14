import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { HiX, HiPhotograph } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { ImageCarousel } from './ImageCarousel'
import { ConfirmDialog } from '@/components/common'
import { useImageStore } from '@/store'

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_FILES = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

interface ImageWithTitle {
  file: File
  preview: string
  title: string
  id: string
}

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onFilesSelected: (files: File[]) => void
  selectedFiles?: File[]
  onImagesWithTitlesChange?: (images: ImageWithTitle[]) => void
  onUploadStart?: () => void
}

/**
 * Upload Modal Component
 * Handles file selection and validation
 */
export const UploadModal = ({
  isOpen,
  onClose,
  onFilesSelected,
  selectedFiles = [],
  onImagesWithTitlesChange,
  onUploadStart,
}: UploadModalProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [imagesWithTitles, setImagesWithTitles] = useState<ImageWithTitle[]>([])
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadBulkImages, uploadImage } = useImageStore()

  /**
   * Initialize images with titles when files are selected
   * Note: We need to use useEffect here to create object URLs when files change
   */
  useEffect(() => {
    if (selectedFiles.length === 0) {
      // Cleanup and reset when no files
      setImagesWithTitles((prev) => {
        prev.forEach((img) => {
          URL.revokeObjectURL(img.preview)
        })
        return []
      })
      return
    }

    // Only update if files actually changed
    setImagesWithTitles((prev) => {
      // Cleanup previous URLs
      prev.forEach((img) => {
        URL.revokeObjectURL(img.preview)
      })

      // Create new images
      return selectedFiles.map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        title: prev.find((p) => p.file === file)?.title || '',
        id: `${file.name}-${file.size}-${index}`,
      }))
    })
  }, [selectedFiles])

  /**
   * Notify parent of images with titles changes
   */
  useEffect(() => {
    if (onImagesWithTitlesChange) {
      onImagesWithTitlesChange(imagesWithTitles)
    }
  }, [imagesWithTitles, onImagesWithTitlesChange])

  /**
   * Handle adding more files
   */
  const handleAddMoreFiles = useCallback((newFiles: File[]) => {
    setImagesWithTitles((prev) => {
      const existingIds = new Set(prev.map((img) => img.id))
      const newImages: ImageWithTitle[] = newFiles
        .map((file, index) => ({
          file,
          preview: URL.createObjectURL(file),
          title: '',
          id: `${file.name}-${file.size}-${Date.now()}-${index}`,
        }))
        .filter((img) => !existingIds.has(img.id))

      return [...prev, ...newImages]
    })
  }, [])

  /**
   * Validate file
   */
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File "${file.name}" is not a valid image type. Allowed types: JPEG, PNG, GIF, WebP`
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds the maximum size of 5MB`
    }

    return null
  }, [])

  /**
   * Handle file selection
   */
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const fileArray = Array.from(files)

      // Check max files limit
      if (fileArray.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} images can be uploaded at once`)
        return
      }

      // Validate all files
      const errors: string[] = []
      const validFiles: File[] = []

      fileArray.forEach((file) => {
        const error = validateFile(file)
        if (error) {
          errors.push(error)
        } else {
          validFiles.push(file)
        }
      })

      // Show errors if any
      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error))
      }

      // If we have valid files, proceed
      if (validFiles.length > 0) {
        if (imagesWithTitles.length > 0) {
          // Adding more files to existing selection
          handleAddMoreFiles(validFiles)
        } else {
          // First selection
          onFilesSelected(validFiles)
        }
      }
    },
    [onFilesSelected, validateFile, imagesWithTitles.length, handleAddMoreFiles]
  )

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  /**
   * Handle drag events
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  /**
   * Handle drop
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  /**
   * Trigger file input click
   */
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * Handle images reorder
   */
  const handleImagesChange = (newImages: ImageWithTitle[]) => {
    setImagesWithTitles(newImages)
  }

  /**
   * Handle title change
   */
  const handleTitleChange = (id: string, title: string) => {
    setImagesWithTitles((prev) =>
      prev.map((img) => (img.id === id ? { ...img, title: title.trim() } : img))
    )
  }

  /**
   * Validate title
   */
  const validateTitle = (title: string): string | null => {
    const trimmed = title.trim()
    if (!trimmed) {
      return 'Title cannot be empty or whitespace only'
    }
    if (trimmed.length > 200) {
      return 'Title cannot exceed 200 characters'
    }
    return null
  }

  /**
   * Check if all images have valid titles
   */
  const areAllTitlesValid = useMemo(() => {
    if (imagesWithTitles.length === 0) return false
    return imagesWithTitles.every((img) => {
      const error = validateTitle(img.title)
      return error === null
    })
  }, [imagesWithTitles])

  /**
   * Handle upload
   */
  const handleUpload = async () => {
    // Validate all titles
    const invalidTitles: string[] = []
    imagesWithTitles.forEach((img, index) => {
      const error = validateTitle(img.title)
      if (error) {
        invalidTitles.push(`Image ${index + 1}: ${error}`)
      }
    })

    if (invalidTitles.length > 0) {
      invalidTitles.forEach((error) => toast.error(error))
      return
    }

    setIsUploading(true)
    if (onUploadStart) {
      onUploadStart()
    }

    try {
      const files = imagesWithTitles.map((img) => img.file)
      const titles = imagesWithTitles.map((img) => img.title.trim())

      if (files.length === 1) {
        // Single upload
        await uploadImage(files[0], titles[0])
      } else {
        // Bulk upload
        await uploadBulkImages(files, titles)
      }

      // Close modal and reset
      handleCloseModal()
      toast.success(
        `Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`
      )
    } catch {
      // Error is already handled in the store
      // Don't close modal on error - let user retry
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Handle modal close with confirmation
   */
  const handleCloseClick = () => {
    // If there are images with titles, show confirmation
    if (imagesWithTitles.length > 0 && !isUploading) {
      const hasTitles = imagesWithTitles.some((img) => img.title.trim())
      if (hasTitles) {
        setShowCloseConfirm(true)
        return
      }
    }
    handleCloseModal()
  }

  /**
   * Handle close modal and cleanup
   */
  const handleCloseModal = () => {
    // Cleanup object URLs
    imagesWithTitles.forEach((img) => {
      URL.revokeObjectURL(img.preview)
    })
    setImagesWithTitles([])
    setShowCloseConfirm(false)
    setIsUploading(false)
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onClose={handleCloseClick} className="relative z-50">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-2xl w-full rounded-lg bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Upload Images
              </DialogTitle>
              <button
                onClick={handleCloseClick}
                disabled={isUploading}
                className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>

          {/* Content */}
          <div className="p-6">
            {selectedFiles.length === 0 ? (
              /* File Drop Zone */
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`
                  relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                  ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  aria-label="Select images"
                />

                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-gray-100 p-4">
                    <HiPhotograph className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      PNG, JPG, GIF, WebP up to 5MB each
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Maximum {MAX_FILES} images
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Carousel with Title Input */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    {imagesWithTitles.length} image{imagesWithTitles.length > 1 ? 's' : ''} selected
                  </p>
                  <button
                    onClick={handleClick}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add More
                  </button>
                </div>
                <ImageCarousel
                  images={imagesWithTitles}
                  onImagesChange={handleImagesChange}
                  onTitleChange={handleTitleChange}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  aria-label="Select images"
                  disabled={isUploading}
                />

                {/* Upload Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleUpload}
                    disabled={!areAllTitlesValid || isUploading}
                    className={`
                      w-full px-4 py-3 rounded-lg font-semibold text-white transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      ${
                        areAllTitlesValid && !isUploading
                          ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                          : 'bg-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {isUploading
                      ? 'Uploading...'
                      : `Upload ${imagesWithTitles.length} image${imagesWithTitles.length > 1 ? 's' : ''}`}
                  </button>
                  {!areAllTitlesValid && imagesWithTitles.length > 0 && (
                    <p className="mt-2 text-sm text-red-600 text-center">
                      Please add titles to all images before uploading
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>

    {/* Close Confirmation Dialog */}
    <ConfirmDialog
      isOpen={showCloseConfirm}
      onClose={() => setShowCloseConfirm(false)}
      onConfirm={handleCloseModal}
      title="Discard Changes?"
      message="You have unsaved changes. Are you sure you want to close without uploading?"
      confirmText="Discard"
      cancelText="Cancel"
      variant="danger"
    />
    </>
  )
}
