import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useImageStore } from '@/store'
import { useObjectUrls } from '@/hooks'
import { validateTitle } from './uploadModal.utils'
import type { Image } from '@/types'

export interface ImageWithTitle {
  file: File | null // null for edit mode when using existing image URL
  preview: string
  title: string
  id: string
}

interface UseUploadModalOptions {
  mode: 'upload' | 'edit'
  editImage?: Image
  selectedFiles: File[]
  isOpen: boolean
  onImagesWithTitlesChange?: (images: ImageWithTitle[]) => void
  onUploadStart?: () => void
  onClose: () => void
}

/**
 * Custom hook for managing upload modal state and operations
 */
export const useUploadModal = ({
  mode,
  editImage,
  selectedFiles,
  isOpen,
  onImagesWithTitlesChange,
  onUploadStart,
  onClose,
}: UseUploadModalOptions) => {
  const [imagesWithTitles, setImagesWithTitles] = useState<ImageWithTitle[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const titlesRef = useRef<Map<string, string>>(new Map())
  const initializedRef = useRef(false)
  const prevModeRef = useRef<'upload' | 'edit'>('upload')

  const uploadBulkImages = useImageStore((state) => state.uploadBulkImages)
  const uploadImage = useImageStore((state) => state.uploadImage)
  const updateImageViaAPI = useImageStore((state) => state.updateImageViaAPI)

  /**
   * Generate ID for files (memoized to prevent infinite loops)
   */
  const generateId = useCallback((file: File, index: number) => {
    return `${file.name}-${file.size}-${index}`
  }, [])

  /**
   * Preserve data when files change (memoized to prevent infinite loops)
   */
  const preserveData = useCallback(
    (existing: Array<Omit<ImageWithTitle, 'file'> & { file: File }>, newFiles: File[]) => {
      return newFiles.map((file) => {
        const existingImage = existing.find((img) => img.file === file)
        const title = existingImage?.title || titlesRef.current.get(file.name) || ''
        return { title }
      })
    },
    []
  )

  /**
   * Files to pass to hook (empty array for edit mode, memoized to prevent re-renders)
   */
  const filesForHook = useMemo(() => {
    return mode === 'edit' ? [] : selectedFiles
  }, [mode, selectedFiles])

  /**
   * Use object URLs hook to manage file previews (only for upload mode)
   */
  const imagesWithUrls = useObjectUrls<Omit<ImageWithTitle, 'file'> & { file: File }>({
    files: filesForHook,
    generateId,
    preserveData,
  })

  /**
   * Initialize and sync images with titles based on mode
   */
  useEffect(() => {
    // Reset initialization when mode changes
    if (prevModeRef.current !== mode) {
      initializedRef.current = false
      prevModeRef.current = mode
    }

    if (mode === 'edit' && editImage && isOpen) {
      // Initialize edit mode
      if (!initializedRef.current || imagesWithTitles.length === 0 || imagesWithTitles[0]?.id !== editImage.id) {
        const editImageWithTitle: ImageWithTitle = {
          file: null,
          preview: editImage.url,
          title: editImage.title,
          id: editImage.id,
        }
        setImagesWithTitles([editImageWithTitle])
        titlesRef.current.set(editImage.id, editImage.title)
        initializedRef.current = true
      }
    } else if (mode === 'upload') {
      if (imagesWithUrls.length > 0) {
        // Sync with hook output for upload mode
        const currentFileNames = imagesWithTitles.map((img) => img.file?.name).filter((name): name is string => !!name)
        const newFileNames = imagesWithUrls.map((img) => img.file?.name).filter((name): name is string => !!name)
        const filesChanged = currentFileNames.length !== newFileNames.length ||
          !currentFileNames.every((name) => newFileNames.includes(name))

        if (!initializedRef.current || filesChanged) {
          setImagesWithTitles(imagesWithUrls as ImageWithTitle[])
          initializedRef.current = true
        }
      } else if (!isOpen && selectedFiles.length === 0) {
        // Reset on close for upload mode
        setImagesWithTitles([])
        titlesRef.current.clear()
        initializedRef.current = false
      }
    }
  }, [mode, editImage?.id, editImage?.url, editImage?.title, isOpen, imagesWithUrls.length, selectedFiles.length])

  /**
   * Sync titles ref with current images
   */
  useEffect(() => {
    if (mode === 'upload') {
      imagesWithUrls.forEach((img) => {
        if (img.file) {
          titlesRef.current.set(img.file.name, img.title)
        }
      })
    }
  }, [mode, imagesWithUrls])

  /**
   * Notify parent of images with titles changes
   */
  useEffect(() => {
    if (onImagesWithTitlesChange) {
      onImagesWithTitlesChange(imagesWithTitles)
    }
  }, [imagesWithTitles, onImagesWithTitlesChange])

  /**
   * Handle file replace in edit mode
   */
  const handleFileReplace = useCallback(
    (newFile: File) => {
      const existingImage = imagesWithTitles[0]
      if (existingImage) {
        // Cleanup old preview if it was created from a File
        if (existingImage.file) {
          URL.revokeObjectURL(existingImage.preview)
        }
        const updatedImage: ImageWithTitle = {
          file: newFile,
          preview: URL.createObjectURL(newFile),
          title: existingImage.title, // Preserve existing title
          id: existingImage.id,
        }
        setImagesWithTitles([updatedImage])
      }
    },
    [imagesWithTitles]
  )

  /**
   * Handle images reorder
   */
  const handleImagesChange = useCallback((newImages: ImageWithTitle[]) => {
    setImagesWithTitles(newImages)
    newImages.forEach((img) => {
      // Use id as key for edit mode, file name for upload mode
      const key = img.file ? img.file.name : img.id
      titlesRef.current.set(key, img.title)
    })
  }, [])

  /**
   * Handle title change
   */
  const handleTitleChange = useCallback((id: string, title: string) => {
    setImagesWithTitles((prev) => {
      const updated = prev.map((img) => {
        if (img.id === id) {
          // Use id as key for edit mode, file name for upload mode
          const key = img.file ? img.file.name : img.id
          titlesRef.current.set(key, title)
          return { ...img, title }
        }
        return img
      })
      return updated
    })
  }, [])

  /**
   * Check if all images have valid titles
   */
  const areAllTitlesValid = useMemo(() => {
    if (imagesWithTitles.length === 0) return false
    return imagesWithTitles.every((img) => {
      const error = validateTitle(img.title)
      return error === null
    })
  }, [imagesWithTitles])

  /**
   * Check if ready to submit
   */
  const isReadyToSubmit = useMemo(() => {
    if (mode === 'edit') {
      // In edit mode, title is required, file is optional
      return areAllTitlesValid && imagesWithTitles.length > 0
    }
    // In upload mode, need valid titles and files
    return (
      areAllTitlesValid &&
      imagesWithTitles.length > 0 &&
      imagesWithTitles.every((img) => img.file !== null)
    )
  }, [mode, areAllTitlesValid, imagesWithTitles])

  /**
   * Handle upload or update
   */
  const handleUpload = useCallback(async () => {
    // Validate all titles
    const invalidTitles: string[] = []
    imagesWithTitles.forEach((img, index) => {
      const error = validateTitle(img.title)
      if (error) {
        invalidTitles.push(`Image ${index + 1}: ${error}`)
      }
    })

    if (invalidTitles.length > 0) {
      invalidTitles.forEach((error) => toast.error(error))
      return
    }

    // Additional validation: ensure all titles are non-empty
    const emptyTitles = imagesWithTitles.filter((img) => !img.title.trim())
    if (emptyTitles.length > 0) {
      toast.error('Please add valid titles to all images')
      return
    }

    setIsUploading(true)
    if (onUploadStart) {
      onUploadStart()
    }

    try {
      if (mode === 'edit' && editImage) {
        // Edit mode - update existing image
        const imageData = imagesWithTitles[0]
        const newFile = imageData.file // May be null if not replacing image

        await updateImageViaAPI(editImage.id, {
          title: imageData.title.trim(),
          ...(newFile && { file: newFile }),
        })

        // Close modal and reset only on success
        handleCloseModal()
      } else {
        // Upload mode
        const files = imagesWithTitles
          .map((img) => img.file)
          .filter((f): f is File => f !== null)
        const titles = imagesWithTitles.map((img) => img.title.trim())

        if (files.length === 1) {
          // Single upload
          await uploadImage(files[0], titles[0])
        } else {
          // Bulk upload
          await uploadBulkImages(files, titles)
        }

        // Close modal and reset only on success
        handleCloseModal()
      }
    } catch (error) {
      console.error(mode === 'edit' ? 'Update error:' : 'Upload error:', error)
      setIsUploading(false)
    }
  }, [mode, editImage, imagesWithTitles, onUploadStart, updateImageViaAPI, uploadImage, uploadBulkImages])

  /**
   * Handle close modal and cleanup
   */
  const handleCloseModal = useCallback(() => {
    // Only cleanup if not uploading
    if (!isUploading) {
      setIsUploading(false)
      titlesRef.current.clear()
      onClose()
    }
  }, [isUploading, onClose])

  /**
   * Reset modal state when it closes
   */
  useEffect(() => {
    if (!isOpen && !isUploading) {
      queueMicrotask(() => {
        setIsUploading(false)
        titlesRef.current.clear()
      })
    }
  }, [isOpen, isUploading])

  return {
    imagesWithTitles,
    isUploading,
    areAllTitlesValid,
    isReadyToSubmit,
    handleFileReplace,
    handleImagesChange,
    handleTitleChange,
    handleUpload,
    handleCloseModal,
  }
}
