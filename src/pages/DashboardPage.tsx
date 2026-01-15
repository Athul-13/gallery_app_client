import { useState, useEffect, useCallback, useRef } from 'react'
import { useImageStore } from '@/store'
import { Navbar, UploadProgressBar } from '@/components/common'
import { ImageCard, ImageCardPlaceholder, UploadModal, ImageLightbox } from '@/components/images'

export const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const images = useImageStore((state) => state.images)
  const isLoading = useImageStore((state) => state.isLoading)
  const isLoadingMore = useImageStore((state) => state.isLoadingMore)
  const page = useImageStore((state) => state.page)
  const limit = useImageStore((state) => state.limit)
  const total = useImageStore((state) => state.total)
  const fetchImages = useImageStore((state) => state.fetchImages)
  const uploadState = useImageStore((state) => state.uploadState)
  const uploadProgress = useImageStore((state) => state.uploadProgress)

  // Calculate if there are more images to load
  const hasMore = page * limit < total

  // Fetch initial images on mount (first 20 images)
  useEffect(() => {
    fetchImages({ page: 1, limit: 20, append: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset to first page when upload succeeds
  useEffect(() => {
    if (uploadState === 'success') {
      fetchImages({ page: 1, limit: 20, append: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadState])

  /**
   * Load more images when user scrolls to bottom
   */
  const loadMoreImages = useCallback(() => {
    if (!isLoadingMore && !isLoading && hasMore) {
      fetchImages({ page: page + 1, limit: 20, append: true })
    }
  }, [isLoadingMore, isLoading, hasMore, page, fetchImages])

  /**
   * Intersection Observer for infinite scroll
   */
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMoreImages()
        }
      },
      {
        root: null,
        rootMargin: '100px', // Start loading 100px before reaching the sentinel
        threshold: 0.1,
      }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoadingMore, isLoading, loadMoreImages])

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
              <>
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

                {/* Sentinel element for infinite scroll */}
                {hasMore && (
                  <div ref={sentinelRef} className="h-10 flex items-center justify-center py-8">
                    {isLoadingMore && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white/60"
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
                        <p className="text-white/60 text-sm">Loading more images...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* End of list indicator */}
                {!hasMore && images.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-white/40 text-sm">
                      You've reached the end. Showing all {total} image{total !== 1 ? 's' : ''}.
                    </p>
                  </div>
                )}
              </>
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
