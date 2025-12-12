import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';

export type SubscriptionTier = 'VISITOR' | 'PREMIUM' | 'PRO' | 'ENTERPRISE';

interface EntitlementsResponse {
  role: SubscriptionTier;
  source: string;
  flags: {
    premium: boolean;
    analytics: boolean;
  };
}

export function useSubscriptionTier() {
  const { address } = useAccount();
  const router = useRouter();
  
  // Get wallet address from query param or connected wallet
  const walletAddress = router.isReady && typeof router.query.wallet === 'string' 
    ? router.query.wallet 
    : address ?? undefined;

  const { data, isLoading, error } = useQuery<EntitlementsResponse>({
    queryKey: ['entitlements', walletAddress],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (walletAddress) {
        params.set('wallet', walletAddress);
      }
      const url = `/api/entitlements${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch entitlements');
      }
      return response.json();
    },
    staleTime: 60_000, // 1 minute
    retry: 1,
    enabled: router.isReady, // Wait for router to be ready
  });

  return {
    subscriptionTier: data?.role ?? 'VISITOR',
    isLoading,
    error,
    flags: data?.flags ?? { premium: false, analytics: false },
  };
}

