import { useState, useRef, useCallback, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { HiX, HiPhotograph } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { ImageCarousel } from './ImageCarousel'

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
}: UploadModalProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [imagesWithTitles, setImagesWithTitles] = useState<ImageWithTitle[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      prev.map((img) => (img.id === id ? { ...img, title } : img))
    )
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
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
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
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
                />
              </div>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
