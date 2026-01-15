import { useState, useEffect } from 'react'
import { useImageStore } from '@/store'
import { Navbar, UploadProgressBar } from '@/components/common'
import { ImageCard, ImageCardPlaceholder, UploadModal } from '@/components/images'

export const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const { images, isLoading, fetchImages, uploadState, uploadProgress } = useImageStore()

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  useEffect(() => {
    if (uploadState === 'success') {
      fetchImages()
    }
  }, [uploadState, fetchImages])

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
  }

  const handleUploadStart = () => {
    setIsModalOpen(false)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    if (uploadState === 'success' || uploadState === 'idle') {
      setSelectedFiles([])
    }
  }

  // Derive modal open state - open if user opened it or if upload failed with files
  const shouldShowModal = isModalOpen || (uploadState === 'error' && selectedFiles.length > 0)

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
                <ImageCardPlaceholder onClick={() => setIsModalOpen(true)} />
                {images.map((image) => (
                  <ImageCard key={image.id} image={image} />
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
    </div>
  )
}
