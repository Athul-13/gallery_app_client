import { useState, useRef, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import clsx from 'clsx'

interface ImageWithTitle {
  file: File
  preview: string
  title: string
  id: string
}

interface ImageCarouselProps {
  images: ImageWithTitle[]
  onImagesChange: (images: ImageWithTitle[]) => void
  onTitleChange: (id: string, title: string) => void
}

/**
 * Sortable Image Item Component
 */
const SortableImageItem = ({
  image,
  isActive,
  isReorderMode,
  onTitleChange,
  dragOverId,
}: {
  image: ImageWithTitle
  isActive: boolean
  isReorderMode: boolean
  onTitleChange: (id: string, title: string) => void
  dragOverId: string | null
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over,
  } = useSortable({ id: image.id })

  const isOver = over?.id === image.id
  const showDropZone = isReorderMode && dragOverId && dragOverId !== image.id && isOver

  // Combine transform with scale for reorder mode
  const scaleTransform = isReorderMode ? 'scale(0.35)' : ''
  const combinedTransform = scaleTransform
    ? `${scaleTransform} ${CSS.Transform.toString(transform)}`.trim()
    : CSS.Transform.toString(transform)

  const style = {
    transform: combinedTransform || undefined,
    transition: isReorderMode ? 'transform 0.3s ease' : transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'shrink-0 w-full transition-all duration-300 origin-center',
        isReorderMode ? 'px-1' : 'px-4',
        isActive && !isReorderMode && 'ring-2 ring-blue-500 rounded-lg'
      )}
    >
      {/* Drop Zone Indicator */}
      {showDropZone && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 z-20 rounded" />
      )}

      <div
        {...attributes}
        {...listeners}
        className={clsx(
          'relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-all duration-300',
          isActive && !isReorderMode ? 'border-blue-500' : 'border-gray-200',
          isReorderMode && 'cursor-grab active:cursor-grabbing',
          isDragging && 'shadow-2xl z-30'
        )}
      >
        <img
          src={image.preview}
          alt={image.file.name}
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* Title Input - Hidden in reorder mode */}
      {!isReorderMode && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={image.title}
            onChange={(e) => onTitleChange(image.id, e.target.value)}
            placeholder="Enter image title"
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            {image.title.length}/200 characters
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Image Carousel Component
 * Horizontal scrollable carousel with drag-to-reorder functionality
 */
export const ImageCarousel = ({
  images,
  onImagesChange,
  onTitleChange,
}: ImageCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)

  // Sensors for drag and drop with 500ms press delay
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 500, // 500ms press delay
        tolerance: 5, // Allow 5px movement during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  /**
   * Handle drag start - enter reorder mode
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setIsReorderMode(true)

    // Center scroll on pressed image and show adjacent images
    const pressedIndex = images.findIndex((img) => img.id === active.id)
    if (pressedIndex !== -1) {
      setActiveIndex(pressedIndex)
      
      // Wait for scale animation to complete (300ms) before calculating scroll
      setTimeout(() => {
        const container = scrollContainerRef.current
        if (container) {
          const pressedElement = container.querySelector(
            `[data-image-index="${pressedIndex}"]`
          ) as HTMLElement
          
          if (pressedElement) {
            const containerRect = container.getBoundingClientRect()
            const containerWidth = containerRect.width
            
            // Each image container is full width (w-full), so to show adjacent images:
            // Scroll to center the pressed image's container, which will show adjacent containers
            const pressedElementRect = pressedElement.getBoundingClientRect()
            const scrollLeft = container.scrollLeft
            const pressedElementLeft = pressedElementRect.left - containerRect.left + scrollLeft
            const pressedElementWidth = pressedElementRect.width // This is the full container width
            
            // Center the pressed image's container in the viewport
            // This ensures adjacent containers (with images) are visible
            const targetScroll = pressedElementLeft - (containerWidth / 2) + (pressedElementWidth / 2)

            container.scrollTo({
              left: Math.max(0, targetScroll),
              behavior: 'smooth',
            })
          }
        }
      }, 350) // Wait for scale animation (300ms) + small buffer
    }
  }

  /**
   * Handle drag over - show drop zone feedback
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setDragOverId(over?.id as string | null)
  }

  /**
   * Handle drag end - reorder images and exit reorder mode
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over.id)

      const newImages = arrayMove(images, oldIndex, newIndex)
      onImagesChange(newImages)

      // Zoom to reordered image
      setActiveIndex(newIndex)
    }

    // Exit reorder mode
    setIsReorderMode(false)
    setDragOverId(null)

    // Scroll to reordered image after zoom animation
    setTimeout(() => {
      const container = scrollContainerRef.current
      if (container) {
        const targetIndex = over && active.id !== over.id
          ? images.findIndex((img) => img.id === over.id)
          : activeIndex

        const activeElement = container.querySelector(
          `[data-image-index="${targetIndex}"]`
        ) as HTMLElement

        if (activeElement) {
          const containerRect = container.getBoundingClientRect()
          const elementRect = activeElement.getBoundingClientRect()
          const scrollLeft = container.scrollLeft
          const elementLeft = elementRect.left - containerRect.left + scrollLeft
          const elementWidth = elementRect.width
          const containerWidth = containerRect.width
          const targetScroll = elementLeft - (containerWidth / 2) + (elementWidth / 2)

          container.scrollTo({
            left: targetScroll,
            behavior: 'smooth',
          })
        }
      }
    }, 300) // Wait for zoom animation
  }

  /**
   * Handle drag cancel - exit reorder mode if user releases without dragging
   */
  const handleDragCancel = () => {
    setIsReorderMode(false)
    setDragOverId(null)
  }

  /**
   * Navigate to previous image
   */
  const goToPrevious = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1))
  }

  /**
   * Navigate to next image
   */
  const goToNext = () => {
    setActiveIndex((prev) => Math.min(images.length - 1, prev + 1))
  }

  /**
   * Navigate to specific image
   */
  const goToImage = (index: number) => {
    setActiveIndex(index)
  }


  /**
   * Scroll to active image (only when not in reorder mode)
   */
  useEffect(() => {
    if (isReorderMode) return

    const container = scrollContainerRef.current
    if (!container) return

    const activeElement = container.querySelector(
      `[data-image-index="${activeIndex}"]`
    ) as HTMLElement

    if (activeElement) {
      isScrollingRef.current = true
      
      const containerRect = container.getBoundingClientRect()
      const elementRect = activeElement.getBoundingClientRect()
      const scrollLeft = container.scrollLeft
      const elementLeft = elementRect.left - containerRect.left + scrollLeft
      const elementWidth = elementRect.width
      const containerWidth = containerRect.width
      const targetScroll = elementLeft - (containerWidth / 2) + (elementWidth / 2)

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      })

      // Reset scrolling flag after animation completes
      setTimeout(() => {
        isScrollingRef.current = false
      }, 500)
    }
  }, [activeIndex, isReorderMode])

  if (images.length === 0) {
    return null
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="space-y-4">
        {/* Image Display Area */}
        <div className="relative">
          {/* Navigation Buttons - Hidden in reorder mode */}
          {images.length > 1 && !isReorderMode && (
            <>
              <button
                onClick={goToPrevious}
                disabled={activeIndex === 0}
                className={clsx(
                  'absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
                aria-label="Previous image"
              >
                <HiChevronLeft className="h-6 w-6 text-gray-700" />
              </button>
              <button
                onClick={goToNext}
                disabled={activeIndex === images.length - 1}
                className={clsx(
                  'absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
                aria-label="Next image"
              >
                <HiChevronRight className="h-6 w-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className={clsx(
              'overflow-x-auto scrollbar-hide transition-all duration-300',
              isReorderMode ? '' : 'snap-x snap-mandatory'
            )}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
            onScroll={(e) => {
              // Update active index based on scroll position (only when not in reorder mode and not programmatically scrolling)
              if (!isReorderMode && !isScrollingRef.current) {
                const container = e.currentTarget
                const containerWidth = container.clientWidth
                
                // Find which image is closest to center
                let closestIndex = 0
                let closestDistance = Infinity
                
                images.forEach((_, index) => {
                  const element = container.querySelector(
                    `[data-image-index="${index}"]`
                  ) as HTMLElement
                  
                  if (element) {
                    const elementRect = element.getBoundingClientRect()
                    const containerRect = container.getBoundingClientRect()
                    const elementCenter = elementRect.left - containerRect.left + (elementRect.width / 2)
                    const containerCenter = containerWidth / 2
                    const distance = Math.abs(elementCenter - containerCenter)
                    
                    if (distance < closestDistance) {
                      closestDistance = distance
                      closestIndex = index
                    }
                  }
                })
                
                if (closestIndex !== activeIndex && closestIndex >= 0 && closestIndex < images.length) {
                  setActiveIndex(closestIndex)
                }
              }
            }}
          >
            <SortableContext
              items={images.map((img) => img.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    data-image-index={index}
                    className="shrink-0 w-full snap-center"
                  >
                    <SortableImageItem
                      image={image}
                      isActive={index === activeIndex}
                      isReorderMode={isReorderMode}
                      onTitleChange={onTitleChange}
                      dragOverId={dragOverId}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </div>
        </div>

        {/* Dots Indicator - Hidden in reorder mode */}
        {images.length > 1 && !isReorderMode && (
          <div className="flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={clsx(
                  'w-2 h-2 rounded-full transition-all',
                  index === activeIndex
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image Counter - Hidden in reorder mode */}
        {!isReorderMode && (
          <div className="text-center text-sm text-gray-500">
            Image {activeIndex + 1} of {images.length}
          </div>
        )}
      </div>
    </DndContext>
  )
}
