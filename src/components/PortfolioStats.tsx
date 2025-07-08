import React from 'react';
import { TrendingUp, Coins, Award, DollarSign } from 'lucide-react';


export const PortfolioStats: React.FC<{
  className?: string;
  totalEarningsUsd: number;
  articlesMintedCount: number;
  totalHoldingsCount: number;
  bestPerformer: string;
}> = ({ className, totalEarningsUsd, articlesMintedCount, totalHoldingsCount, bestPerformer }) => {
  const stats = [
    {
      label: 'Total Portfolio Value',
      value: `$${totalEarningsUsd.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Creator Coins',
      value: `${totalHoldingsCount}`,
      icon: Coins,
      color: 'from-purple-500 to-blue-500',
    },
    {
      label: 'Articles Minted',
      value: `${articlesMintedCount}`,
      icon: Award,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Best Performer',
      value: bestPerformer ?? 'NA',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className || ''}`}>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
