import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as cartApi from '../api/cartApi.js';
import { useAuth } from './useAuth.js';

// Cart state lives entirely in React Query's cache (query key ['cart'])
// rather than a separate Context — every mutation here writes the
// server's returned cart straight back into that cache, so the Navbar's
// item count, the Cart page, and Checkout all stay in sync for free.
export function useCart() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    staleTime: 15_000,
  });

  function writeCart(cart) {
    queryClient.setQueryData(['cart'], cart);
  }

  const addItem = useMutation({
    mutationFn: cartApi.addCartItem,
    onSuccess: writeCart,
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }) => cartApi.updateCartItem(itemId, quantity),
    onSuccess: writeCart,
  });

  const removeItem = useMutation({
    mutationFn: (itemId) => cartApi.removeCartItem(itemId),
    onSuccess: writeCart,
  });

  const clear = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: writeCart,
  });

  const cart = cartQuery.data;

  return {
    cart,
    items: cart?.items ?? [],
    itemCount: cart?.itemCount ?? 0,
    subtotal: cart?.subtotal ?? 0,
    hasUnavailableItems: cart?.hasUnavailableItems ?? false,
    isLoading: isAuthenticated && cartQuery.isLoading,
    isError: cartQuery.isError,
    error: cartQuery.error,
    refetch: cartQuery.refetch,
    addItem: addItem.mutateAsync,
    isAdding: addItem.isPending,
    updateItem: updateItem.mutateAsync,
    isUpdating: updateItem.isPending,
    removeItem: removeItem.mutateAsync,
    isRemoving: removeItem.isPending,
    clearCart: clear.mutateAsync,
  };
}
