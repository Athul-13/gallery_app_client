import { HiPhotograph } from 'react-icons/hi'
import { MAX_FILES } from './uploadModal.utils'

interface FileDropZoneProps {
  onFileSelect: () => void
  onDrag: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  dragActive: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * File Drop Zone Component
 * Provides drag & drop and click-to-upload interface
 */
export const FileDropZone = ({
  onFileSelect,
  onDrag,
  onDrop,
  dragActive,
  fileInputRef,
  onFileInputChange,
}: FileDropZoneProps) => {
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFileInputChange}
        className="hidden"
        aria-label="Select images"
      />
      <div
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={onFileSelect}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${
            dragActive
              ? 'border-blue-500/80 bg-blue-500/10'
              : 'border-white/20 hover:border-white/30 bg-white/5'
          }
        `}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-white/10 p-4">
            <HiPhotograph className="h-12 w-12 text-white/60" />
          </div>
          <div>
            <p className="text-lg font-medium text-white">
              Click to upload or drag and drop
            </p>
            <p className="mt-2 text-sm text-white/60">
              PNG, JPG, GIF, WebP up to 5MB each
            </p>
            <p className="mt-1 text-sm text-white/60">
              Maximum {MAX_FILES} images
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
