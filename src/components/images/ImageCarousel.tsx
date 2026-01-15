import { useState, useRef, useCallback, memo, useImperativeHandle, forwardRef } from 'react'
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
  type Modifier,
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

export interface ImageCarouselRef {
  goToNext: () => void
  goToPrevious: () => void
}

/**
 * Custom modifier to restrict dragging to horizontal axis only
 */
const restrictToHorizontalAxis: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: 0,
  }
}

/**
 * Sortable Image Item Component
 */
const SortableImageItem = memo(({
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

  // Apply drag transform (no scaling needed in reorder mode as we use fixed widths)
  const style = {
    transform: CSS.Transform.toString(transform) || undefined,
    transition: isReorderMode ? 'transform 0.3s ease' : transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(image.id, e.target.value)
  }, [image.id, onTitleChange])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'transition-all duration-300 origin-center flex flex-col items-center justify-center',
        isReorderMode ? 'px-1 shrink-0 w-[80px] sm:w-[100px]' : 'w-full px-2 sm:px-4',
        isActive && !isReorderMode
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
          'relative rounded-lg overflow-hidden bg-white/5 border-2 transition-all duration-300',
          isReorderMode ? 'w-full aspect-square' : 'w-full max-w-sm mx-auto h-[150px] sm:h-[180px] md:h-[200px]',
          isActive && !isReorderMode ? 'border-blue-500/80' : 'border-white/10',
          isReorderMode && 'cursor-grab active:cursor-grabbing',
          isDragging && 'shadow-2xl z-30'
        )}
      >
        <img
          src={image.preview}
          alt={image.file.name}
          className="w-full h-full object-cover pointer-events-none"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Title Input - Hidden in reorder mode */}
      {!isReorderMode && (
        <div className="mt-2 sm:mt-3 w-full max-w-sm mx-auto shrink-0">
        <label className="block text-xs sm:text-sm font-medium text-white/80 mb-1 sm:mb-1.5">
          Image Title <span className="text-red-400">*</span>
        </label>
      <input
        type="text"
        value={image.title}
        onChange={handleTitleChange}
        placeholder="Enter image title"
        maxLength={200}
        className={clsx(
          'w-full px-3 py-2 border rounded-md bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-colors',
          image.title.trim()
            ? 'border-white/20'
            : 'border-red-400/50 focus:border-red-400 focus:ring-red-400/50'
        )}
      />
      <div className="mt-1 flex items-center justify-between">
        <p className="text-xs text-white/60">
          {image.title.length}/200 characters
        </p>
        {!image.title.trim() && (
          <p className="text-xs text-red-400">Title required</p>
        )}
      </div>
      </div>
      )}
    </div>
  )
})

SortableImageItem.displayName = 'SortableImageItem'

/**
 * Image Carousel Component
 * Horizontal scrollable carousel with drag-to-reorder functionality
 */
export const ImageCarousel = forwardRef<ImageCarouselRef, ImageCarouselProps>(({
  images,
  onImagesChange,
  onTitleChange,
}, ref) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

    // Set active index to pressed image
    const pressedIndex = images.findIndex((img) => img.id === active.id)
    if (pressedIndex !== -1) {
      setActiveIndex(pressedIndex)
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
  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => {
      const newIndex = Math.max(0, prev - 1)
      setSwipeOffset(0)
      return newIndex
    })
  }, [])

  /**
   * Navigate to next image
   */
  const goToNext = useCallback(() => {
    setActiveIndex((prev) => {
      const newIndex = Math.min(images.length - 1, prev + 1)
      setSwipeOffset(0)
      return newIndex
    })
  }, [images.length])

  /**
   * Navigate to specific image
   */
  const goToImage = (index: number) => {
    setActiveIndex(index)
    setSwipeOffset(0)
  }

  /**
   * Expose navigation methods via ref
   */
  useImperativeHandle(ref, () => ({
    goToNext,
    goToPrevious,
  }), [goToNext, goToPrevious])

  /**
   * Handle touch start for swipe detection
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isReorderMode) return
    // Don't start swipe if touching an input element
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.closest('input')) return
    
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [isReorderMode])

  /**
   * Handle touch move for swipe detection
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isReorderMode || !touchStartRef.current) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)
    
    // Only process horizontal swipes (deltaX > deltaY)
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      e.preventDefault()
      
      // Calculate offset relative to container width
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const offset = (deltaX / containerWidth) * 100
        setSwipeOffset(offset)
      }
    }
  }, [isReorderMode])

  /**
   * Handle touch end for swipe detection
   */
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isReorderMode || !touchStartRef.current) {
      touchStartRef.current = null
      return
    }

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)
    const swipeThreshold = 50 // Minimum swipe distance in pixels

    touchStartRef.current = null

    // Only process horizontal swipes
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0 && activeIndex > 0) {
        // Swipe right - go to previous
        setActiveIndex((prev) => Math.max(0, prev - 1))
        setSwipeOffset(0)
      } else if (deltaX < 0 && activeIndex < images.length - 1) {
        // Swipe left - go to next
        setActiveIndex((prev) => Math.min(images.length - 1, prev + 1))
        setSwipeOffset(0)
      } else {
        setSwipeOffset(0)
      }
    } else {
      setSwipeOffset(0)
    }
  }, [isReorderMode, activeIndex, images.length])

  /**
   * Handle mouse down for drag detection
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isReorderMode) return
    // Don't start swipe if clicking on an input element
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.closest('input')) return
    
    touchStartRef.current = { x: e.clientX, y: e.clientY }
  }, [isReorderMode])

  /**
   * Handle mouse move for drag detection
   */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isReorderMode || !touchStartRef.current) return
    
    const deltaX = e.clientX - touchStartRef.current.x
    const deltaY = Math.abs(e.clientY - touchStartRef.current.y)
    
    // Only process horizontal drags
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const offset = (deltaX / containerWidth) * 100
        setSwipeOffset(offset)
      }
    }
  }, [isReorderMode])

  /**
   * Handle mouse up for drag detection
   */
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isReorderMode || !touchStartRef.current) {
      touchStartRef.current = null
      return
    }

    const deltaX = e.clientX - touchStartRef.current.x
    const deltaY = Math.abs(e.clientY - touchStartRef.current.y)
    const swipeThreshold = 50

    touchStartRef.current = null

    // Only process horizontal drags
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0 && activeIndex > 0) {
        setActiveIndex((prev) => Math.max(0, prev - 1))
        setSwipeOffset(0)
      } else if (deltaX < 0 && activeIndex < images.length - 1) {
        setActiveIndex((prev) => Math.min(images.length - 1, prev + 1))
        setSwipeOffset(0)
      } else {
        setSwipeOffset(0)
      }
    } else {
      setSwipeOffset(0)
    }
  }, [isReorderMode, activeIndex, images.length])

  /**
   * Handle mouse leave to reset swipe
   */
  const handleMouseLeave = useCallback(() => {
    touchStartRef.current = null
    setSwipeOffset(0)
  }, [])



  if (images.length === 0) {
    return null
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col flex-1 min-h-0 space-y-2 sm:space-y-3">
        {/* Image Display Area */}
        <div className="relative flex-1 min-h-0 flex flex-col">
          {/* Navigation Buttons - Hidden in reorder mode */}
          {images.length > 1 && !isReorderMode && (
            <>
              <button
                onClick={goToPrevious}
                disabled={activeIndex === 0}
                className={clsx(
                  'absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-1.5 sm:p-2 shadow-lg transition-all',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
                aria-label="Previous image"
              >
                <HiChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                disabled={activeIndex === images.length - 1}
                className={clsx(
                  'absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 rounded-full p-1.5 sm:p-2 shadow-lg transition-all',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
                aria-label="Next image"
              >
                <HiChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </button>
            </>
          )}

          {/* Image Container - Shows all images in reorder mode, single image otherwise */}
          <div 
            ref={containerRef}
            className={clsx(
              'flex-1 min-h-0 flex items-center relative',
              isReorderMode 
                ? 'overflow-x-auto overflow-y-hidden' 
                : 'justify-center overflow-hidden'
            )}
            onTouchStart={!isReorderMode ? handleTouchStart : undefined}
            onTouchMove={!isReorderMode ? handleTouchMove : undefined}
            onTouchEnd={!isReorderMode ? handleTouchEnd : undefined}
            onMouseDown={!isReorderMode ? handleMouseDown : undefined}
            onMouseMove={!isReorderMode ? handleMouseMove : undefined}
            onMouseUp={!isReorderMode ? handleMouseUp : undefined}
            onMouseLeave={!isReorderMode ? handleMouseLeave : undefined}
          >
            <SortableContext
              items={images.map((img) => img.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div 
                className={clsx(
                  'flex relative transition-transform duration-300 ease-out',
                  isReorderMode ? 'gap-2 px-2' : 'w-full h-full'
                )}
                style={!isReorderMode ? {
                  transform: `translateX(${-activeIndex * 100 + (swipeOffset / 100) * 100}%)`,
                } : undefined}
              >
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    data-image-index={index}
                    className={clsx(
                      isReorderMode ? 'shrink-0' : 'w-full h-full shrink-0'
                    )}
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
          <div className="flex justify-center gap-1 sm:gap-1.5 mt-2 sm:mt-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={clsx(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  index === activeIndex
                    ? 'bg-blue-500 w-5'
                    : 'bg-white/30 hover:bg-white/50'
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image Counter - Hidden in reorder mode */}
        {!isReorderMode && (
          <div className="text-center text-xs text-white/60">
            Image {activeIndex + 1} of {images.length}
          </div>
        )}
      </div>
    </DndContext>
  )
})

ImageCarousel.displayName = 'ImageCarousel'
