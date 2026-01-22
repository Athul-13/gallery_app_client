import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { HiX } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { ImageCarousel, type ImageCarouselRef } from './ImageCarousel'
import { ConfirmDialog } from '@/components/common'
import { FileDropZone } from './FileDropZone'
import { useFileHandling } from './useFileHandling'
import { useUploadModal, type ImageWithTitle } from './useUploadModal'
import type { Image } from '@/types'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onFilesSelected: (files: File[]) => void
  selectedFiles?: File[]
  onImagesWithTitlesChange?: (images: ImageWithTitle[]) => void
  onUploadStart?: () => void
  // Edit mode props
  mode?: 'upload' | 'edit'
  editImage?: Image
}

/**
 * Upload Modal Component
 * Handles file selection, validation, and upload/update operations
 */
export const UploadModal = ({
  isOpen,
  onClose,
  onFilesSelected,
  selectedFiles = [],
  onImagesWithTitlesChange,
  onUploadStart,
  mode = 'upload',
  editImage,
}: UploadModalProps) => {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const carouselRef = useRef<ImageCarouselRef | null>(null)

  // Use custom hooks for file handling and upload logic
  const {
    imagesWithTitles,
    isUploading,
    areAllTitlesValid,
    isReadyToSubmit,
    handleFileReplace,
    handleImagesChange,
    handleTitleChange,
    handleUpload,
    handleCloseModal,
  } = useUploadModal({
    mode,
    editImage,
    selectedFiles,
    isOpen,
    onImagesWithTitlesChange,
    onUploadStart,
    onClose,
  })

  const {
    dragActive,
    fileInputRef,
    handleFileInputChange,
    handleDrag,
    handleDrop,
    handleClick,
  } = useFileHandling({
    mode,
    onFilesSelected,
    selectedFiles,
    onFileReplace: handleFileReplace,
  })

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
   * Reset confirmation dialog when modal closes
   */
  useEffect(() => {
    if (!isOpen && !isUploading) {
      queueMicrotask(() => {
        setShowCloseConfirm(false)
      })
    }
  }, [isOpen, isUploading])

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
                {mode === 'edit' ? 'Edit Image' : 'Upload Images'}
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
              {mode === 'upload' && selectedFiles.length === 0 ? (
                /* File Drop Zone */
                <FileDropZone
                  onFileSelect={handleClick}
                  onDrag={handleDrag}
                  onDrop={handleDrop}
                  dragActive={dragActive}
                  fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                  onFileInputChange={handleFileInputChange}
                />
              ) : (
                /* Carousel with Title Input */
                <div className="flex flex-col flex-1 min-h-0 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between shrink-0">
                    <p className="text-xs font-medium text-white/80">
                      {mode === 'edit'
                        ? 'Edit image details'
                        : `${imagesWithTitles.length} image${imagesWithTitles.length > 1 ? 's' : ''} selected`}
                    </p>
                    {mode !== 'edit' && (
                      <button
                        onClick={handleClick}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Add More
                      </button>
                    )}
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
                    multiple={mode !== 'edit'}
                    onChange={handleFileInputChange}
                    className="hidden"
                    aria-label={mode === 'edit' ? 'Replace image' : 'Select images'}
                    disabled={isUploading}
                  />
                  {mode === 'edit' && (
                    <div className="pt-2 sm:pt-3 border-t border-white/10 shrink-0">
                      <button
                        onClick={handleClick}
                        className="w-full px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Replace Image
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="pt-2 sm:pt-3 border-t border-white/10 shrink-0">
                    <button
                      onClick={handleUpload}
                      disabled={!isReadyToSubmit || isUploading}
                      className={`
                        w-full px-4 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base text-white transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                        ${
                          isReadyToSubmit && !isUploading
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
                          {mode === 'edit' ? 'Updating...' : 'Uploading...'}
                        </span>
                      ) : (
                        mode === 'edit'
                          ? 'Update Image'
                          : `Upload ${imagesWithTitles.length} image${imagesWithTitles.length > 1 ? 's' : ''}`
                      )}
                    </button>
                    {!areAllTitlesValid && imagesWithTitles.length > 0 && (
                      <p className="mt-2 text-xs sm:text-sm text-red-400 text-center">
                        Please add valid titles to all images before {mode === 'edit' ? 'updating' : 'uploading'}
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
        message={`You have unsaved changes. Are you sure you want to close without ${mode === 'edit' ? 'updating' : 'uploading'}?`}
        confirmText="Discard"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  )
}
