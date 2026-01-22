import { memo, useEffect, useCallback } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import type { Image } from '@/types'
import clsx from 'clsx'

interface ImageLightboxProps {
  images: Image[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

/**
 * Image Lightbox Component
 * Full-screen image viewer with navigation arrows
 */
export const ImageLightbox = memo(({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrevious,
  onNext,
}: ImageLightboxProps) => {
  const currentImage = images[currentIndex]

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image failed to load:', currentImage.url)
    const target = e.currentTarget
    target.style.display = 'none'
  }, [currentImage.url])

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onPrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        onNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onPrevious, onNext])

  if (!currentImage) {
    return null
  }

  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < images.length - 1

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

      {/* Lightbox Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close lightbox"
          >
            <HiX className="h-6 w-6 text-white" />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className={clsx(
                  'absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  canGoPrevious && 'hover:scale-110'
                )}
                aria-label="Previous image"
              >
                <HiChevronLeft className="h-8 w-8 text-white" />
              </button>

              {/* Next Button */}
              <button
                onClick={onNext}
                disabled={!canGoNext}
                className={clsx(
                  'absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all',
                  'disabled:opacity-30 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-white/50',
                  canGoNext && 'hover:scale-110'
                )}
                aria-label="Next image"
              >
                <HiChevronRight className="h-8 w-8 text-white" />
              </button>
            </>
          )}

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                key={currentImage.id}
                src={currentImage.url}
                alt={currentImage.title}
                className="max-w-full max-h-full object-contain transition-opacity duration-300"
                onError={handleImageError}
              />
            </div>
          </div>

          {/* Image Info Footer */}
          <div className="mt-4 text-center">
            <h3 className="text-white text-lg font-medium mb-1">{currentImage.title}</h3>
            {images.length > 1 && (
              <p className="text-white/60 text-sm">
                {currentIndex + 1} of {images.length}
              </p>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
})

ImageLightbox.displayName = 'ImageLightbox'
