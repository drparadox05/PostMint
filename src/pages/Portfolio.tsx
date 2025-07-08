import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { PortfolioStats } from '../components/PortfolioStats';
import { HoldingsTable } from '../components/HoldingsTable';
import { getProfile, getProfileBalances } from '@zoralabs/coins-sdk';


interface CoinBalance {
  id?: string;
  token?: {
    id?: string;
    name?: string;
    symbol?: string;
    address?: string;
    chainId?: number;
    totalSupply?: string;
    marketCap?: string;
    volume24h?: string;
    createdAt?: string;
    uniqueHolders?: number;
    media?: {
      previewImage?: string;
      medium?: string;
      blurhash?: string;
    };
  };
  amount?: {
    amountRaw?: string;
    amountDecimal?: number;
  };
  valueUsd?: string;
  timestamp?: string;
}

export const Portfolio: React.FC = () => {
  const { isConnected, address } = useAccount();
  const [profile, setProfile] = useState<any>(null);
  const [coinBalances, setCoinBalances] = useState<CoinBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balancesError, setBalancesError] = useState<string | null>(null);
  const [totalEarningsUsd, setTotalEarningsUsd] = useState<number>(0);
  const [articlesMintedCount, setArticlesMintedCount] = useState<number>(0);
  const [totalHoldingsCount, setTotalHoldingsCount] = useState<number>(0);
  const [bestPerformer, setBestPerformer] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) return;
    
    setLoading(true);
    setError(null);
    
    getProfile({ identifier: address })
      .then((response: any) => {
        setProfile(response?.data?.profile ?? null);
      })
      .catch((err: any) => {
        console.error('Profile fetch error:', err);
        setError('Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, [isConnected, address]);


  useEffect(() => {
    if (!isConnected || !address) return;
    
    setBalancesLoading(true);
    setBalancesError(null);
    
    console.log('Fetching balances for address:', address);
    
    getProfileBalances({
      identifier: address,
      count: 50
    })
      .then((response: any) => {        
        const profileData = response?.data?.profile;
        console.log('Profile data:', profileData);
        if (profileData?.coinBalances?.edges) {
          const balances = profileData.coinBalances.edges.map((edge: any) => edge.node);
          console.log('Extracted balances:', balances);
          setCoinBalances(balances);
          setTotalHoldingsCount(balances.length);

          const total = balances.reduce((sum: number, balance: any) => {
            const amountUsd = parseFloat(balance?.coin?.creatorEarnings?.[0]?.amountUsd ?? '0');
            return sum + amountUsd;
          }, 0);
          setTotalEarningsUsd(total);

          const pmArticlesCount = balances.filter((balance: any) =>
            balance?.coin?.symbol?.startsWith('PM-')
          ).length;
          setArticlesMintedCount(pmArticlesCount);

          const pmBalances = balances.filter((balance: any) =>
            balance?.coin?.symbol?.startsWith('PM-')
          );

          let topCoin: any = null;
          let maxMarketCap = 0;

          for (const balance of pmBalances) {
            const marketCap = parseFloat(balance?.coin?.marketCap ?? '0');
            if (marketCap > maxMarketCap) {
              maxMarketCap = marketCap;
              topCoin = balance?.coin;
            }
          }
          setBestPerformer(topCoin?.symbol ?? null);

        } else if (profileData?.coinBalances) {
          console.log('Direct coinBalances:', profileData.coinBalances);
          setCoinBalances(profileData.coinBalances);
          setTotalEarningsUsd(0);
        } else {
          console.log('No coin balances found in response');
          setCoinBalances([]);
          setTotalEarningsUsd(0);
        }
      })
      .catch((err: any) => {
        console.error('Balances fetch error:', err);
        setBalancesError(`Failed to load coin balances: ${err.message ?? 'Unknown error'}`);
        setCoinBalances([]);
      })
      .finally(() => setBalancesLoading(false));
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-xl p-8 shadow-sm max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Connect your wallet to view your creator coins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
        
        {loading && <div className="mt-4 text-gray-500">Loading profile...</div>}
        {error && <div className="mt-4 text-red-500">{error}</div>}
        
        {profile && (
          <div className="flex items-center space-x-4 mt-6">
            {profile.avatar?.medium && (
              <img
                src={profile.avatar.medium}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border"
              />
            )}
            <div>
              <div className="font-semibold text-lg text-gray-900">
                {profile.displayName ?? profile.handle ?? profile.address}
              </div>
              {profile.handle && (
                <div className="text-gray-500 text-sm">@{profile.handle}</div>
              )}
              {profile.bio && (
                <div className="text-gray-600 text-sm mt-1">{profile.bio}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <PortfolioStats
        totalEarningsUsd={totalEarningsUsd}
        articlesMintedCount={articlesMintedCount}
        totalHoldingsCount={totalHoldingsCount}
        bestPerformer={bestPerformer}
      />

      <HoldingsTable 
        coinBalances={coinBalances}
        loading={balancesLoading}
        error={balancesError}
      />
    </div>
  );
};
