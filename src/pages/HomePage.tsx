import React, { useEffect, useState } from 'react';
import { CreatorCard } from '../components/CreatorCard';
import { TrendingUp, Star, Users, Zap } from 'lucide-react';
import { getProfile } from '@zoralabs/coins-sdk';
import { useNavigate } from 'react-router-dom';


interface Creator {
  id: string;
  name: string;
  bio?: string;
  avatar: string;
  userName: string;
}


const CREATOR_ADDRESSES = [
  '0xd211b9417f28d128435cd8d022aeaebbc8a28f17',
  '0xdde8346b13d089cca8c0c70c370a84e83e9ecb14',
  '0x34a8d0bd36223f15aee9f8640e485b96e5494c44',
];


export const HomePage: React.FC = () => { 
  
  const [featuredCreators, setFeaturedCreators] = useState<Creator[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCreators = async () => {
      setLoadingCreators(true);
      try {
        const profiles = await Promise.all(
          CREATOR_ADDRESSES.map(async (address) => {
            const res = await getProfile({ identifier: address });
            console.log("RES:" ,res);
            const profile = res?.data?.profile;

            return {
              id: address,
              name: profile?.displayName || profile?.handle || address.slice(0, 6) + '...' + address.slice(-4),
              bio: profile?.bio,
              avatar: profile?.avatar?.medium,
              userName: profile?.username
            };
          })
        );
        setFeaturedCreators(profiles);
      } catch (error) {
        console.error('Failed to fetch creator profiles:', error);
      } finally {
        setLoadingCreators(false);
      }
    };

    fetchCreators();
  }, []);

  const stats = [
    { label: 'Total Creators', value: '1024', icon: Users, color: 'from-purple-500 to-pink-500' },
    { label: 'Articles Minted', value: '5120', icon: Zap, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Volume', value: '128 ETH', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Coin Holders', value: '12,345', icon: Star, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="space-y-6">
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
            Own Your Favorite Creators
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Invest in creators through their personal coins, collect exclusive newsletter articles as coins,
            and access premium content by holding tokens.
          </p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Create New
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Featured Creators</h2>
        </div>
        {loadingCreators ? (
          <p className="text-gray-500">Loading creators...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCreators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        )}
      </section>    
    </div>
  );
};
