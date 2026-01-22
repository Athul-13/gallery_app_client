import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  /**
   * Whether there are more items to load
   */
  hasMore: boolean
  /**
   * Whether currently loading more items
   */
  isLoadingMore: boolean
  /**
   * Whether currently loading (initial load)
   */
  isLoading: boolean
  /**
   * Callback to load more items
   */
  onLoadMore: () => void
  /**
   * Root margin for Intersection Observer (default: '100px')
   */
  rootMargin?: string
  /**
   * Threshold for Intersection Observer (default: 0.1)
   */
  threshold?: number
}

/**
 * Custom hook for infinite scroll using Intersection Observer
 */
export const useInfiniteScroll = ({
  hasMore,
  isLoadingMore,
  isLoading,
  onLoadMore,
  rootMargin = '100px',
  threshold = 0.1,
}: UseInfiniteScrollOptions) => {
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Memoize the load more callback to prevent unnecessary re-renders
  const loadMoreCallback = useCallback(() => {
    if (!isLoadingMore && !isLoading && hasMore) {
      onLoadMore()
    }
  }, [isLoadingMore, isLoading, hasMore, onLoadMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          loadMoreCallback()
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoadingMore, isLoading, loadMoreCallback, rootMargin, threshold])

  return sentinelRef
}
