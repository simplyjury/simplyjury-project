import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useJuryRequestCount() {
  const { data, error } = useSWR('/api/jury-requests/count', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds as fallback
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const updateRequestCount = () => {
    // Immediately revalidate the request count
    mutate('/api/jury-requests/count');
  };

  const incrementRequestCount = (currentCount?: number) => {
    if (typeof currentCount === 'number') {
      // Optimistically update the cache with incremented count
      mutate('/api/jury-requests/count', 
        { count: currentCount + 1 }, 
        false // Don't revalidate immediately
      );
      // Then revalidate to get the actual count from server
      setTimeout(() => mutate('/api/jury-requests/count'), 100);
    } else {
      // If we don't have current count, just refresh
      updateRequestCount();
    }
  };

  const decrementRequestCount = (currentCount?: number) => {
    if (currentCount && currentCount > 0) {
      // Optimistically update the cache with decremented count
      mutate('/api/jury-requests/count', 
        { count: currentCount - 1 }, 
        false // Don't revalidate immediately
      );
      // Then revalidate to get the actual count from server
      setTimeout(() => mutate('/api/jury-requests/count'), 100);
    } else {
      // If we don't have current count, just refresh
      updateRequestCount();
    }
  };

  return {
    count: data?.count || 0,
    isLoading: !data && !error,
    error,
    updateRequestCount,
    incrementRequestCount,
    decrementRequestCount,
  };
}
