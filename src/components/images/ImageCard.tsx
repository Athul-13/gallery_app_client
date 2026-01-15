import type { Image } from '@/types'
import clsx from 'clsx'

interface ImageCardProps {
  image: Image
  onClick?: () => void
  className?: string
}

/**
 * Image Card Component
 * Displays an image with its title
 */
export const ImageCard = ({ image, onClick, className }: ImageCardProps) => {
  return (
    <div
      className={clsx(
        'group relative aspect-square overflow-hidden rounded-lg border border-white/10 cursor-pointer transition-all hover:border-white/20 hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      {/* Image */}
      <img
        src={image.url}
        alt={image.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        loading="lazy"
        onError={(e) => {
          console.error('Image failed to load:', image.url)
          e.currentTarget.style.display = 'none'
        }}
      />

      {/* Title overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
        <p className="text-white text-sm font-medium line-clamp-2">{image.title}</p>
      </div>
    </div>
  )
}
