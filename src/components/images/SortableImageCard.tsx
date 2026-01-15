import { memo, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { ImageCard } from './ImageCard'
import type { Image } from '@/types'
import clsx from 'clsx'

interface SortableImageCardProps {
  image: Image
  onClick?: () => void
  onEdit?: (image: Image) => void
}

/**
 * Sortable Image Card Component
 * Wraps ImageCard with drag-and-drop functionality
 */
export const SortableImageCard = memo(({
  image,
  onClick,
  onEdit,
}: SortableImageCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: image.id })

  // Use translate3d for GPU acceleration and disable transitions during drag
  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x ?? 0}px, ${transform.y ?? 0}px, 0)`
      : undefined,
    transition: isSortableDragging ? 'none' : transition,
    opacity: isSortableDragging ? 0.5 : 1,
    willChange: 'transform',
  }

  // Prevent onClick when dragging
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isSortableDragging) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      onClick?.()
    },
    [onClick, isSortableDragging]
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        isSortableDragging && 'z-50 cursor-grabbing',
        !isSortableDragging && 'cursor-grab'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        onClick={handleClick}
        className="h-full"
      >
        <ImageCard
          image={image}
          onClick={undefined} // Prevent double click handling
          onEdit={onEdit}
          className={clsx(
            isSortableDragging && 'shadow-2xl ring-2 ring-blue-500/50',
            !isSortableDragging && 'hover:shadow-lg'
          )}
        />
      </div>
    </div>
  )
})

SortableImageCard.displayName = 'SortableImageCard'
