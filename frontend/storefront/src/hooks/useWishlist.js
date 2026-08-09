import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as wishlistApi from '../api/wishlistApi.js';
import { useAuth } from './useAuth.js';

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getWishlist,
    enabled: isAuthenticated,
    staleTime: 15_000,
  });

  function writeWishlist(wishlist) {
    queryClient.setQueryData(['wishlist'], wishlist);
  }

  const addItem = useMutation({
    mutationFn: wishlistApi.addToWishlist,
    onSuccess: writeWishlist,
  });

  const removeItem = useMutation({
    mutationFn: wishlistApi.removeFromWishlist,
    onSuccess: writeWishlist,
  });

  const items = wishlistQuery.data ?? [];

  return {
    items,
    productIds: new Set(items.map((item) => item.product.id)),
    isLoading: isAuthenticated && wishlistQuery.isLoading,
    isError: wishlistQuery.isError,
    error: wishlistQuery.error,
    refetch: wishlistQuery.refetch,
    addItem: addItem.mutateAsync,
    removeItem: removeItem.mutateAsync,
  };
}
