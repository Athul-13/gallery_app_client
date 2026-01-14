import { useState, useEffect } from 'react'
import { useImageStore } from '@/store'
import { Navbar, UploadProgressBar } from '@/components/common'
import { ImageCard, ImageCardPlaceholder, UploadModal } from '@/components/images'

/**
 * Dashboard Page (Protected)
 */
export const DashboardPage = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const {
    images,
    isLoading,
    fetchImages,
    uploadState,
    uploadProgress,
  } = useImageStore()

  // Fetch images on mount
  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  // Refresh images after successful upload
  useEffect(() => {
    if (uploadState === 'success') {
      fetchImages()
    }
  }, [uploadState, fetchImages])

  /**
   * Handle file selection from upload modal
   */
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
    // Modal will be kept open for title input (Phase 4)
    // For now, we'll close it and files will be handled in next phase
  }

  /**
   * Handle upload modal close
   */
  const handleCloseModal = () => {
    setIsUploadModalOpen(false)
    setSelectedFiles([])
  }

  /**
   * Handle upload start - close modal to show progress bar
   */
  const handleUploadStart = () => {
    setIsUploadModalOpen(false)
  }

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

            {/* Image Gallery */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-white/60">Loading images...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Upload Placeholder */}
                <ImageCardPlaceholder
                  onClick={() => setIsUploadModalOpen(true)}
                />

                {/* Image Cards */}
                {images.map((image) => (
                  <ImageCard key={image.id} image={image} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && images.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/60 mb-4">No images yet</p>
                <p className="text-white/40 text-sm">
                  Click the upload button to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={handleCloseModal}
        onFilesSelected={handleFilesSelected}
        selectedFiles={selectedFiles}
        onUploadStart={handleUploadStart}
      />
    </div>
  )
}
