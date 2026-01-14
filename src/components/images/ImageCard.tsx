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
        'group relative aspect-square overflow-hidden rounded-lg bg-white/5 border border-white/10 cursor-pointer transition-all hover:border-white/20 hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      {/* Image */}
      <img
        src={image.url}
        alt={image.title}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />

      {/* Title overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-white text-sm font-medium line-clamp-2">{image.title}</p>
      </div>
    </div>
  )
}
