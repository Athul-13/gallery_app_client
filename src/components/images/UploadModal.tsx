import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { HiX, HiPhotograph } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { ImageCarousel, type ImageCarouselRef } from './ImageCarousel'
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
  const prevImagesRef = useRef<ImageWithTitle[]>([])
  const carouselRef = useRef<ImageCarouselRef | null>(null)

  const uploadBulkImages = useImageStore((state) => state.uploadBulkImages)
  const uploadImage = useImageStore((state) => state.uploadImage)

  /**
   * Cleanup function to revoke object URLs
   */
  const cleanupOldUrls = useCallback((oldImages: ImageWithTitle[]) => {
    oldImages.forEach((img) => {
      URL.revokeObjectURL(img.preview)
    })
  }, [])

  /**
   * Initialize images with titles when files are selected
   * Note: We need to use useEffect here to create object URLs when files change
   */
  useEffect(() => {
    // Cleanup previous URLs from ref
    if (prevImagesRef.current.length > 0) {
      cleanupOldUrls(prevImagesRef.current)
    }

    if (selectedFiles.length === 0) {
      // Reset state when no files - use microtask to avoid synchronous setState
      prevImagesRef.current = []
      queueMicrotask(() => {
        setImagesWithTitles([])
      })
      return
    }

    // Create new images
    const newImages: ImageWithTitle[] = selectedFiles.map((file, index) => {
      const existingImage = prevImagesRef.current.find((p) => p.file === file)
      return {
        file,
        preview: URL.createObjectURL(file),
        title: existingImage?.title || '',
        id: `${file.name}-${file.size}-${index}`,
      }
    })

    // Update ref and state - use microtask to avoid synchronous setState
    prevImagesRef.current = newImages
    queueMicrotask(() => {
      setImagesWithTitles(newImages)
    })
  }, [selectedFiles, cleanupOldUrls])

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

      const updated = [...prev, ...newImages]
      prevImagesRef.current = updated
      return updated
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
    prevImagesRef.current = newImages
    setImagesWithTitles(newImages)
  }

  /**
   * Handle title change
   */
  const handleTitleChange = (id: string, title: string) => {
    setImagesWithTitles((prev) => {
      const updated = prev.map((img) => (img.id === id ? { ...img, title: title } : img))
      prevImagesRef.current = updated
      return updated
    })
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

    // Additional validation: ensure all titles are non-empty
    const emptyTitles = imagesWithTitles.filter((img) => !img.title.trim())
    if (emptyTitles.length > 0) {
      toast.error('Please add titles to all images before uploading')
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

      // Close modal and reset only on success
      handleCloseModal()
    } catch (error) {
      console.error('Upload error:', error)
      setIsUploading(false)
    }
  }

  /**
   * Handle modal close with confirmation
   */
  const handleCloseClick = () => {
    // Prevent closing during upload
    if (isUploading) {
      toast.error('Please wait for upload to complete')
      return
    }

    // If there are images with titles, show confirmation
    if (imagesWithTitles.length > 0) {
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
    // Only cleanup if not uploading
    if (!isUploading) {
      // Cleanup object URLs
      imagesWithTitles.forEach((img) => {
        URL.revokeObjectURL(img.preview)
      })
      setImagesWithTitles([])
      setShowCloseConfirm(false)
      setIsUploading(false)
      onClose()
    }
  }

  /**
   * Reset modal state when it closes (but preserve during upload)
   */
  useEffect(() => {
    if (!isOpen && !isUploading) {
      // Cleanup when modal closes (but not during upload)
      cleanupOldUrls(prevImagesRef.current)
      prevImagesRef.current = []
      // Use microtask to avoid synchronous setState
      queueMicrotask(() => {
        setImagesWithTitles([])
        setShowCloseConfirm(false)
        setIsUploading(false)
      })
    }
  }, [isOpen, isUploading, cleanupOldUrls])

  /**
   * Keyboard shortcuts for image navigation
   * Shift + Arrow Right: Next image
   * Shift + Arrow Left: Previous image
   */
  useEffect(() => {
    if (!isOpen || imagesWithTitles.length <= 1 || isUploading) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Shift is pressed and user is not typing in an input
      if (!e.shiftKey) return
      
      const target = e.target as HTMLElement
      // Don't trigger if user is typing in an input field
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        carouselRef.current?.goToNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        carouselRef.current?.goToPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, imagesWithTitles.length, isUploading])

  return (
    <>
      <Dialog open={isOpen} onClose={handleCloseClick} className="relative z-50">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
          <DialogPanel className="mx-auto w-full max-w-md h-[85vh] sm:h-[80vh] max-h-[700px] flex flex-col rounded-lg bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 shrink-0">
              <DialogTitle className="text-base sm:text-lg font-semibold text-white">
                Upload Images
              </DialogTitle>
              <button
                onClick={handleCloseClick}
                disabled={isUploading}
                className="text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <HiX className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4">
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
                      ? 'border-blue-500/80 bg-blue-500/10'
                      : 'border-white/20 hover:border-white/30 bg-white/5'
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
                  <div className="rounded-full bg-white/10 p-4">
                    <HiPhotograph className="h-12 w-12 text-white/60" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      PNG, JPG, GIF, WebP up to 5MB each
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      Maximum {MAX_FILES} images
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Carousel with Title Input */
              <div className="flex flex-col flex-1 min-h-0 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between shrink-0">
                  <p className="text-xs font-medium text-white/80">
                    {imagesWithTitles.length} image{imagesWithTitles.length > 1 ? 's' : ''} selected
                  </p>
                  <button
                    onClick={handleClick}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Add More
                  </button>
                </div>
                <div className="flex-1 min-h-0 flex flex-col">
                  <ImageCarousel
                    ref={carouselRef}
                    images={imagesWithTitles}
                    onImagesChange={handleImagesChange}
                    onTitleChange={handleTitleChange}
                  />
                </div>
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
                <div className="pt-2 sm:pt-3 border-t border-white/10 shrink-0">
                  <button
                    onClick={handleUpload}
                    disabled={!areAllTitlesValid || isUploading || imagesWithTitles.length === 0}
                    className={`
                      w-full px-4 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base text-white transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      ${
                        areAllTitlesValid && !isUploading && imagesWithTitles.length > 0
                          ? 'bg-blue-600/80 hover:bg-blue-600 active:bg-blue-700'
                          : 'bg-white/10 cursor-not-allowed'
                      }
                    `}
                  >
                    {isUploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      `Upload ${imagesWithTitles.length} image${imagesWithTitles.length > 1 ? 's' : ''}`
                    )}
                  </button>
                  {!areAllTitlesValid && imagesWithTitles.length > 0 && (
                    <p className="mt-2 text-xs sm:text-sm text-red-400 text-center">
                      Please add valid titles to all images before uploading
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
