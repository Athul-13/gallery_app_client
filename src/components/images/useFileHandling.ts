import { useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { validateFile, MAX_FILES } from './uploadModal.utils'

interface UseFileHandlingOptions {
  mode: 'upload' | 'edit'
  onFilesSelected: (files: File[]) => void
  selectedFiles: File[]
  onAddMoreFiles?: (files: File[]) => void
  onFileReplace?: (file: File) => void
}

/**
 * Custom hook for handling file selection, drag & drop, and validation
 */
export const useFileHandling = ({
  mode,
  onFilesSelected,
  selectedFiles,
  onAddMoreFiles,
  onFileReplace,
}: UseFileHandlingOptions) => {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Handle adding more files
   */
  const handleAddMoreFiles = useCallback(
    (newFiles: File[]) => {
      const existingFiles = new Set(selectedFiles.map((f) => `${f.name}-${f.size}`))
      const uniqueNewFiles = newFiles.filter(
        (file) => !existingFiles.has(`${file.name}-${file.size}`)
      )

      if (uniqueNewFiles.length > 0) {
        if (onAddMoreFiles) {
          onAddMoreFiles([...selectedFiles, ...uniqueNewFiles])
        } else {
          onFilesSelected([...selectedFiles, ...uniqueNewFiles])
        }
      }
    },
    [selectedFiles, onFilesSelected, onAddMoreFiles]
  )

  /**
   * Handle file selection
   */
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const fileArray = Array.from(files)

      // In edit mode, only allow single file
      if (mode === 'edit' && fileArray.length > 1) {
        toast.error('Please select only one image to replace')
        return
      }

      // Check max files limit (only for upload mode)
      if (mode === 'upload' && fileArray.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} images can be uploaded at once`)
        return
      }

      // Validate all files
      const errors: string[] = []
      const validFiles: File[] = []

      fileArray.forEach((file) => {
        const error = validateFile(file)
        if (error) {
          errors.push(error)
        } else {
          validFiles.push(file)
        }
      })

      // Show errors if any
      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error))
      }

      // If we have valid files, proceed
      if (validFiles.length > 0) {
        if (mode === 'edit' && onFileReplace) {
          // Edit mode - replace the existing image
          onFileReplace(validFiles[0])
        } else {
          // Upload mode - add files
          handleAddMoreFiles(validFiles)
        }
      }
    },
    [mode, onFilesSelected, handleAddMoreFiles, onFileReplace]
  )

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    },
    [handleFiles]
  )

  /**
   * Handle drag events
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  /**
   * Handle drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  /**
   * Trigger file input click
   */
  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return {
    dragActive,
    fileInputRef,
    handleFileInputChange,
    handleDrag,
    handleDrop,
    handleClick,
  }
}
