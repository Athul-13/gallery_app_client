/**
 * File validation constants and utilities for UploadModal
 */

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_FILES = 10
export const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

/**
 * Validate a file against size and type constraints
 * @param file - File to validate
 * @returns Error message if invalid, null if valid
 */
export const validateFile = (file: File): string | null => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `File "${file.name}" is not a valid image type. Allowed types: JPEG, PNG, GIF, WebP`
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File "${file.name}" exceeds the maximum size of 5MB`
  }

  return null
}

/**
 * Validate a title string
 * @param title - Title to validate
 * @returns Error message if invalid, null if valid
 */
export const validateTitle = (title: string): string | null => {
  const trimmed = title.trim()
  if (!trimmed) {
    return 'Title cannot be empty or whitespace only'
  }
  if (trimmed.length > 200) {
    return 'Title cannot exceed 200 characters'
  }
  return null
}
