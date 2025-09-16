'use client';

import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUnreadCount() {
  const { data: unreadData, error } = useSWR('/api/unread-messages-count', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds as fallback
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const updateUnreadCount = () => {
    // Immediately revalidate the unread count
    mutate('/api/unread-messages-count');
  };

  const decrementUnreadCount = (currentCount?: number) => {
    if (currentCount && currentCount > 0) {
      // Optimistically update the cache with decremented count
      mutate('/api/unread-messages-count', 
        { unreadCount: currentCount - 1 }, 
        false // Don't revalidate immediately
      );
      // Then revalidate to get the actual count from server
      setTimeout(() => mutate('/api/unread-messages-count'), 100);
    } else {
      // If we don't have current count, just refresh
      updateUnreadCount();
    }
  };

  const incrementUnreadCount = (currentCount?: number) => {
    if (typeof currentCount === 'number') {
      // Optimistically update the cache with incremented count
      mutate('/api/unread-messages-count', 
        { unreadCount: currentCount + 1 }, 
        false // Don't revalidate immediately
      );
      // Then revalidate to get the actual count from server
      setTimeout(() => mutate('/api/unread-messages-count'), 100);
    } else {
      // If we don't have current count, just refresh
      updateUnreadCount();
    }
  };

  return {
    unreadCount: unreadData?.unreadCount || 0,
    isLoading: !unreadData && !error,
    error,
    updateUnreadCount,
    decrementUnreadCount,
    incrementUnreadCount,
  };
}
