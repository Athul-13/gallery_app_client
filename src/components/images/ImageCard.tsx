import { memo, useCallback, useState } from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { HiDotsVertical, HiPencil, HiTrash } from 'react-icons/hi'
import type { Image } from '@/types'
import clsx from 'clsx'
import { useImageStore } from '@/store'
import { ConfirmDialog } from '@/components/common'

interface ImageCardProps {
  image: Image
  onClick?: () => void
  onEdit?: (image: Image) => void
  className?: string
}

/**
 * Image Card Component
 * Displays an image with its title and hover menu for edit/delete
 */
export const ImageCard = memo(({ image, onClick, onEdit, className }: ImageCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteImage = useImageStore((state) => state.deleteImage)

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image failed to load:', image.url)
    e.currentTarget.style.display = 'none'
  }, [image.url])

  const handleDelete = useCallback(async () => {
    try {
      await deleteImage(image.id)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Failed to delete image:', error)
      // Error is already handled in the store with toast
    }
  }, [image.id, deleteImage])

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (onEdit) {
        onEdit(image)
      }
    },
    [image, onEdit]
  )

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }, [])

  return (
    <>
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
          onError={handleError}
        />

        {/* Actions Menu - Visible on hover */}
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Menu as="div" className="relative">
            <MenuButton
              className="p-2 rounded-md bg-black/60 hover:bg-black/80 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <HiDotsVertical className="h-5 w-5" />
            </MenuButton>
            <MenuItems className="absolute right-0 mt-2 w-48 rounded-md bg-white/5 backdrop-blur-md border border-white/10 shadow-lg focus:outline-none">
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={handleEdit}
                    className={clsx(
                      'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                      focus ? 'bg-white/10 text-white' : 'text-white/80'
                    )}
                  >
                    <HiPencil className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={handleDeleteClick}
                    className={clsx(
                      'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                      focus ? 'bg-red-500/20 text-red-400' : 'text-red-400/80'
                    )}
                  >
                    <HiTrash className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>

        {/* Title overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
          <p className="text-white text-sm font-medium line-clamp-2">{image.title}</p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Image"
        message={`Are you sure you want to delete "${image.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  )
})

ImageCard.displayName = 'ImageCard'
