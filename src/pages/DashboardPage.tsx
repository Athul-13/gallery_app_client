import { useState, useEffect, useCallback } from 'react'
import { useImageStore } from '@/store'
import { Navbar, UploadProgressBar } from '@/components/common'
import { ImageCard, ImageCardPlaceholder, UploadModal, ImageLightbox } from '@/components/images'

export const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const images = useImageStore((state) => state.images)
  const isLoading = useImageStore((state) => state.isLoading)
  const fetchImages = useImageStore((state) => state.fetchImages)
  const uploadState = useImageStore((state) => state.uploadState)
  const uploadProgress = useImageStore((state) => state.uploadProgress)

  // Fetch images on mount - Zustand actions are stable, so we can safely omit from deps
  useEffect(() => {
    fetchImages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (uploadState === 'success') {
      fetchImages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadState])

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files)
  }, [])

  const handleUploadStart = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    // Check uploadState from store - if success or idle, clear selected files
    const currentUploadState = useImageStore.getState().uploadState
    if (currentUploadState === 'success' || currentUploadState === 'idle') {
      setSelectedFiles([])
    }
  }, [])

  // Derive modal open state - open if user opened it or if upload failed with files
  const shouldShowModal = isModalOpen || (uploadState === 'error' && selectedFiles.length > 0)

  /**
   * Handle image card click - open lightbox
   */
  const handleImageClick = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  /**
   * Handle modal open
   */
  const handleModalOpen = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  /**
   * Handle lightbox close
   */
  const handleLightboxClose = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  /**
   * Navigate to previous image in lightbox
   */
  const handleLightboxPrevious = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev !== null && prev > 0) {
        return prev - 1
      }
      return prev
    })
  }, [])

  /**
   * Navigate to next image in lightbox
   */
  const handleLightboxNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev !== null && prev < images.length - 1) {
        return prev + 1
      }
      return prev
    })
  }, [images.length])

  return (
    <div className="min-h-screen">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Upload Progress Bar - Show at top during upload */}
      {uploadState === 'uploading' && uploadProgress && (
        <UploadProgressBar progress={uploadProgress} />
      )}

      {/* Main Content - with top padding for navbar and progress bar */}
      <div className={uploadState === 'uploading' ? 'pt-32' : 'pt-16'}>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                My Images
              </h1>
              <p className="text-white/60 text-sm">
                Upload and manage your images
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-white/60">Loading images...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60 mb-4">No images yet</p>
                <p className="text-white/40 text-sm">Click the upload button to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <ImageCardPlaceholder onClick={handleModalOpen} />
                {images.map((image, index) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    onClick={() => handleImageClick(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <UploadModal
        isOpen={shouldShowModal}
        onClose={handleModalClose}
        onFilesSelected={handleFilesSelected}
        selectedFiles={selectedFiles}
        onUploadStart={handleUploadStart}
      />

      {/* Image Lightbox */}
      {lightboxIndex !== null && images.length > 0 && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={handleLightboxClose}
          onPrevious={handleLightboxPrevious}
          onNext={handleLightboxNext}
        />
      )}
    </div>
  )
}
