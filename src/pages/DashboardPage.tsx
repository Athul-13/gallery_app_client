import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { useImageStore } from '@/store'
import { Navbar, UploadProgressBar } from '@/components/common'
import {
  SortableImageCard,
  ImageCardPlaceholder,
  UploadModal,
  ImageLightbox,
} from '@/components/images'
import { useInfiniteScroll } from '@/hooks'
import type { Image } from '@/types'
import toast from 'react-hot-toast'

export const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [editImage, setEditImage] = useState<Image | null>(null)

  const images = useImageStore((state) => state.images)
  const isLoading = useImageStore((state) => state.isLoading)
  const isLoadingMore = useImageStore((state) => state.isLoadingMore)
  const page = useImageStore((state) => state.page)
  const limit = useImageStore((state) => state.limit)
  const total = useImageStore((state) => state.total)
  const fetchImages = useImageStore((state) => state.fetchImages)
  const uploadState = useImageStore((state) => state.uploadState)
  const uploadProgress = useImageStore((state) => state.uploadProgress)
  const isReordering = useImageStore((state) => state.isReordering)
  const reorderImages = useImageStore((state) => state.reorderImages)
  const bulkUpdateOrder = useImageStore((state) => state.bulkUpdateOrder)

  // Sensors for drag and drop with optimized activation delay
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150, // Reduced delay for smoother feel
        tolerance: 8, // Increased tolerance for better responsiveness
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Memoize items array to prevent unnecessary re-renders
  const sortableItems = useMemo(
    () => images.map((img) => img.id),
    [images]
  )

  // Calculate if there are more images to load
  const hasMore = page * limit < total

  // Fetch initial images on mount (first 20 images)
  useEffect(() => {
    fetchImages({ page: 1, limit: 14, append: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset to first page when upload/update succeeds
  useEffect(() => {
    if (uploadState === 'success') {
      fetchImages({ page: 1, limit: 14, append: false })
      setEditImage(null) // Reset edit image after successful update
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadState])

  /**
   * Load more images when user scrolls to bottom
   */
  const loadMoreImages = useCallback(() => {
    fetchImages({ page: page + 1, limit: 14, append: true })
  }, [page, fetchImages])

  /**
   * Infinite scroll hook
   */
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoadingMore,
    isLoading,
    onLoadMore: loadMoreImages,
  })

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(files)
  }, [])

  const handleUploadStart = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setEditImage(null) // Reset edit image when closing modal
    // Check uploadState from store - if success or idle, clear selected files
    const currentUploadState = useImageStore.getState().uploadState
    if (currentUploadState === 'success' || currentUploadState === 'idle') {
      setSelectedFiles([])
    }
  }, [])

  // Derive modal open state - open if user opened it or if upload failed with files
  const shouldShowModal = isModalOpen || (uploadState === 'error' && selectedFiles.length > 0)
  
  // Determine modal mode based on whether we're editing an image
  const modalMode = editImage ? 'edit' : 'upload'

  /**
   * Handle image card click - open lightbox
   */
  const handleImageClick = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  /**
   * Handle modal open (for upload mode)
   */
  const handleModalOpen = useCallback(() => {
    setEditImage(null) // Ensure we're in upload mode
    setIsModalOpen(true)
  }, [])

  /**
   * Handle edit image - open modal in edit mode
   */
  const handleEditImage = useCallback((image: Image) => {
    setEditImage(image)
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

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback((_event: DragStartEvent) => {
    // Drag start handled by @dnd-kit automatically
  }, [])

  /**
   * Handle drag over - show visual feedback
   */
  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback is handled by @dnd-kit automatically
  }, [])

  /**
   * Handle drag end - save new order
   */
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event

      if (!over || active.id === over.id) {
        return
      }

      // Prevent concurrent drags
      if (isReordering) {
        return
      }

      const activeId = active.id as string
      const overId = over.id as string

      // Optimistically update UI
      reorderImages(activeId, overId)

      // Prepare orders array for API call
      const currentImages = useImageStore.getState().images
      const orders = currentImages.map((img, index) => ({
        id: img.id,
        order: index,
      }))

      // Show loading toast
      const toastId = toast.loading('Saving new order...')

      try {
        // Save to backend
        await bulkUpdateOrder(orders)
        toast.success('Order saved successfully', { id: toastId })
      } catch (error) {
        // Error handling and revert is done in the store
        toast.error('Failed to save order', { id: toastId })
      }
    },
    [isReordering, reorderImages, bulkUpdateOrder]
  )

  /**
   * Handle drag cancel
   */
  const handleDragCancel = useCallback(() => {
    // Drag cancel handled by @dnd-kit automatically
  }, [])

  return (
    <div className="min-h-screen">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Upload/Update Progress Bar - Show at top during upload or update */}
      {uploadState === 'uploading' && uploadProgress && (
        <UploadProgressBar 
          progress={uploadProgress} 
          mode={editImage ? 'update' : 'upload'}
        />
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  modifiers={[restrictToParentElement]}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext
                    items={sortableItems}
                    strategy={rectSortingStrategy}
                    disabled={isReordering}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      <ImageCardPlaceholder onClick={handleModalOpen} />
                      {images.map((image, index) => (
                        <SortableImageCard
                          key={image.id}
                          image={image}
                          onClick={() => handleImageClick(index)}
                          onEdit={handleEditImage}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

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
        mode={modalMode}
        editImage={editImage || undefined}
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
