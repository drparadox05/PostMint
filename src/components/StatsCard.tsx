import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface StatsCardProps {
  stat: Stat;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stat }) => {  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-600">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
        <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
          <stat.icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};
