import React from 'react';

interface Creator {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  userName: string;
}

interface CreatorCardProps {
  creator: Creator;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{creator.name}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{creator.bio}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={`https://zora.co/@${creator.userName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
          >
            View Profile
          </a>
        </div>
      </div>
    </div>
  );
};
