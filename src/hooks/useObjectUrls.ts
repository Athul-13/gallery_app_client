import { useState, useEffect, useRef, useCallback } from 'react'

interface ImageWithUrl<T = File> {
  file: T
  preview: string
  id: string
}

interface UseObjectUrlsOptions<T extends { file: File; id: string }> {
  /**
   * Array of files to create object URLs for
   */
  files: File[]
  /**
   * Function to generate a unique ID for each file
   */
  generateId?: (file: File, index: number) => string
  /**
   * Function to preserve existing data when files change
   */
  preserveData?: (existing: T[], newFiles: File[]) => Partial<T>[]
}

/**
 * Custom hook to manage object URLs for File objects
 * Automatically creates and revokes object URLs to prevent memory leaks
 */
export const useObjectUrls = <T extends { file: File; preview: string; id: string } = ImageWithUrl>({
  files,
  generateId = (file, index) => `${file.name}-${file.size}-${index}`,
  preserveData,
}: UseObjectUrlsOptions<T>): T[] => {
  const [images, setImages] = useState<T[]>([])
  const prevImagesRef = useRef<T[]>([])

  /**
   * Cleanup function to revoke object URLs
   */
  const cleanupUrls = useCallback((imagesToCleanup: T[]) => {
    imagesToCleanup.forEach((img) => {
      URL.revokeObjectURL(img.preview)
    })
  }, [])

  useEffect(() => {
    // Skip if files array hasn't actually changed (compare by reference and length)
    const filesChanged = 
      files.length !== prevImagesRef.current.length ||
      files.some((file, index) => prevImagesRef.current[index]?.file !== file)

    if (!filesChanged && files.length > 0) {
      return // No changes, skip update
    }

    if (files.length === 0) {
      // Cleanup all URLs when no files
      if (prevImagesRef.current.length > 0) {
        cleanupUrls(prevImagesRef.current)
        prevImagesRef.current = []
        // Use microtask to avoid synchronous setState
        queueMicrotask(() => {
          setImages([])
        })
      }
      return
    }

    // Find files that are no longer in the new array (need cleanup)
    const currentFileSet = new Set(files)
    const filesToCleanup = prevImagesRef.current.filter(
      (img) => !currentFileSet.has(img.file)
    )

    // Cleanup URLs for removed files
    if (filesToCleanup.length > 0) {
      cleanupUrls(filesToCleanup)
    }

    // Create new images with object URLs
    const preservedData = preserveData
      ? preserveData(prevImagesRef.current, files)
      : []

    const newImages: T[] = files.map((file, index) => {
      const existingImage = prevImagesRef.current.find((img) => img.file === file)
      const preserved = preservedData[index] || {}

      return {
        file,
        preview: existingImage?.preview || URL.createObjectURL(file),
        id: generateId(file, index),
        ...preserved,
      } as T
    })

    // Update ref and state
    prevImagesRef.current = newImages
    setImages(newImages)
  }, [files, generateId, preserveData, cleanupUrls])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupUrls(prevImagesRef.current)
    }
  }, [cleanupUrls])

  return images
}
