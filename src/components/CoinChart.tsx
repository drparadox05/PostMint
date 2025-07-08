import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CoinChartProps {
  symbol: string;
}

export const CoinChart: React.FC<CoinChartProps> = ({ symbol }) => {
  // Mock chart data - in a real app, this would come from an API
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
    price: 0.03 + Math.random() * 0.04 + Math.sin(i / 5) * 0.01,
  }));

  const currentPrice = chartData[chartData.length - 1].price;
  const previousPrice = chartData[chartData.length - 2].price;
  const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
  const isPositive = priceChange > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-gray-900">
            {currentPrice.toFixed(4)} ETH
          </div>
          <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span className="font-medium">{priceChange.toFixed(2)}%</span>
          </div>
        </div>
        <div className="text-sm text-gray-600">Last 30 days</div>
      </div>

      {/* Simple SVG Chart */}
      <div className="h-64 w-full bg-gray-50 rounded-lg p-4">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Chart line */}
          <polyline
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="2"
            points={chartData
              .map((point, index) => {
                const x = (index / (chartData.length - 1)) * 400;
                const y = 200 - ((point.price - 0.02) / 0.06) * 200;
                return `${x},${y}`;
              })
              .join(' ')}
          />
          
          {/* Chart area */}
          <polygon
            fill="url(#priceGradient)"
            points={[
              '0,200',
              ...chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 400;
                const y = 200 - ((point.price - 0.02) / 0.06) * 200;
                return `${x},${y}`;
              }),
              '400,200',
            ].join(' ')}
          />
        </svg>
      </div>

      {/* Chart controls */}
      <div className="flex justify-center space-x-4">
        {['1D', '7D', '30D', '90D', '1Y'].map((period) => (
          <button
            key={period}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
              period === '30D'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
};