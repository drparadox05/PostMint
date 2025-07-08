import React from 'react';
import { useAccount } from 'wagmi';
import { StatsCard } from '../components/StatsCard';
import { CreateArticleForm } from '../components/CreateArticleForm';
import { BarChart3, Coins, Users, TrendingUp } from 'lucide-react';



export const CreatorDashboard: React.FC = () => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-xl p-8 shadow-sm max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to access the creator dashboard.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Articles', value: '3', icon: BarChart3},
    { label: 'Coin Holders', value: '234', icon: Users},
    { label: 'Coin Price', value: '0.005 ETH', icon: Coins},
    { label: 'Total Volume', value: '0.1 ETH', icon: TrendingUp},
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>
      <CreateArticleForm />
    </div>
  );
};
