import React from 'react';
import { TrendingUp, TrendingDown, ExternalLink, Loader2 } from 'lucide-react';
import { getProfile } from "@zoralabs/coins-sdk";
import { useAccount } from 'wagmi';

// Updated interfaces to match the actual API response
interface CoinData {
  id: string;
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
  creator?: {
    handle?: string;
    displayName?: string;
    avatar?: {
      previewImage?: string;
    };
  };
}

interface CoinBalance {
  id: string;
  balance: string;
  coin: CoinData;
}

interface HoldingsTableProps {
  coinBalances: CoinBalance[];
  loading: boolean;
  error: string | null;
}

async function fetchUserProfile(address?: string) {
  if (!address) {
    console.log("No address found, cannot fetch profile");
    return;
  }

  const response = await getProfile({
    identifier: address,
  });

  return response;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  coinBalances,
  loading,
  error
}) => {
  const { address } = useAccount();

  React.useEffect(() => {
    fetchUserProfile(address);
  }, [address]);

  console.log('HoldingsTable received coinBalances:', coinBalances);
  if (error) {
    console.log('HoldingsTable error:', error);
  }

  const handleDetailsClick = (tokenAddress: string | undefined) => {
    if (!tokenAddress) return;
    window.open(`https://zora.co/coin/base:${tokenAddress}`, '_blank', 'noopener,noreferrer');
  };

  const convertRawBalance = (rawBalance: string): number => {
    try {
      const balance = BigInt(rawBalance);
      const divisor = BigInt(10 ** 18);
      const integerPart = balance / divisor;
      const fractionalPart = balance % divisor;
      const decimal = Number(integerPart) + Number(fractionalPart) / Number(divisor);
      return decimal;
    } catch (error) {
      console.error('Error converting balance:', error);
      return 0;
    }
  };

  const formatBalance = (balance: number): string => {
    if (!balance) return '0';
    if (balance < 1) return balance.toFixed(4);
    if (balance < 1000) return balance.toFixed(2);
    if (balance < 1000000) return `${(balance / 1000).toFixed(1)}K`;
    return `${(balance / 1000000).toFixed(1)}M`;
  };

  const getTokenDisplayName = (coin: CoinData): string => {
    return coin?.name ?? coin?.symbol ?? coin?.creator?.handle ?? 'Unknown Token';
  };

  const getTokenSymbol = (coin: CoinData): string => {
    return coin?.symbol ?? coin?.name?.substring(0, 4)?.toUpperCase() ?? 'UNK';
  };

  const getCoinImageUrl = (coin: any): string | undefined => {
    const getCoinImageUrl  = coin?.mediaContent?.previewImage?.small;
    if (getCoinImageUrl) {
      return coin.mediaContent.previewImage.small;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Creator Coins</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Loading coin balances...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Creator Coins</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">{error}</div>
          <div className="text-gray-500 text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  if (!coinBalances || coinBalances.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Creator Coins</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No creator coins found</div>
          <div className="text-gray-400 text-sm">
            Start investing in creator coins to see them here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg border border-purple-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Articles Published</h3>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Total Holdings</div>
          <div className="text-2xl font-bold text-purple-600">
            {coinBalances.length} coin{coinBalances.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {coinBalances
          .filter((balance) => getTokenSymbol(balance.coin).startsWith('PM-'))
          .map((balance, index) => {
            const coin = balance.coin;
            const decimalBalance = convertRawBalance(balance.balance);
            const tokenSymbol = getTokenSymbol(coin);
            const tokenName = getTokenDisplayName(coin);
            const coinImageUrl = getCoinImageUrl(coin);

            return (
              <div
                key={balance.id || index}
                className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        
                        {coinImageUrl ? (
                          <img
                          src={coinImageUrl}
                          alt={tokenName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {tokenSymbol.charAt(0)}
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                      </div>

                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900">{tokenSymbol}</div>
                      </div>
                    </div>
                    <button
                      className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200 group-hover:scale-110"
                      onClick={() => {
                        if (coin?.address) {
                          const etherscanUrl = `https://basescan.org/address/${coin.address}`;
                          window.open(etherscanUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>

                  {coin?.creator?.handle && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span className="text-sm text-gray-700">Creator: <span className="font-medium">@{coin.creator.handle}</span></span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Your Balance</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatBalance(decimalBalance)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                      onClick={() => handleDetailsClick(coin.address)}
                    >
                    Details
                    </button>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-200 transition-colors duration-300" />
              </div>
            );
          })}
      </div>

      {coinBalances.filter((balance) => getTokenSymbol(balance.coin).startsWith('PM-')).length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Creator Coins Yet</h3>
          <p className="text-gray-500">Start investing in your favorite creators to see them here.</p>
        </div>
      )}
    </div>
  );
};
