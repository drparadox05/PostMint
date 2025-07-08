import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, User, Lock, Coins, ExternalLink, Check } from 'lucide-react';

export const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hasMinted, setHasMinted] = useState(false);

  const article = {
    id: '1',
    title: 'The Future of Creator Economics in Web3',
    content: `
      <p>The creator economy is undergoing a fundamental transformation. With the advent of blockchain technology and decentralized platforms, creators now have unprecedented opportunities to monetize their content and build direct relationships with their audience.</p>
      
      <h2>The Current State</h2>
      <p>Traditional platforms take significant cuts from creator earnings, often ranging from 30-50% of revenue. This leaves creators with limited control over their income and audience relationships.</p>
      
      <h2>The Web3 Solution</h2>
      <p>Blockchain technology enables creators to:</p>
      <ul>
        <li>Mint their content as Coins, creating scarcity and collectibility</li>
        <li>Article personal tokens that give fans ownership stakes</li>
        <li>Create token-gated communities for exclusive content</li>
        <li>Directly monetize without platform intermediaries</li>
      </ul>
      
      <h2>Looking Forward</h2>
      <p>The next evolution will see creators becoming mini-economies, with their own currencies, governance tokens, and decentralized autonomous organizations (DAOs) managing their brand and content.</p>
    `,
    author: 'Sarah Chen',
    publishedAt: '2024-01-15T10:00:00Z',
    image: 'https://images.pexels.com/photos/5473955/pexels-photo-5473955.jpeg?auto=compress&cs=tinysrgb&w=800',
    mintPrice: 0.01,
    totalMinted: 45,
    maxSupply: 100,
    contractAddress: '0x123...abc',
  };

  const handleMint = () => {
    // Implement minting logic here
    setHasMinted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Article Header */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User size={16} />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900">{article.title}</h1>

          <img
            src={article.image}
            alt={article.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Minting Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Collect this Article</h3>
            <p className="text-sm text-gray-600">
              Own a piece of creator history. {article.totalMinted} of {article.maxSupply} minted.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Coins size={16} />
                <span>{article.mintPrice} ETH</span>
              </div>
              <div className="flex items-center space-x-1">
                <ExternalLink size={16} />
                <span>View on Zora</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-lg font-semibold">
                {article.totalMinted}/{article.maxSupply}
              </div>
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                style={{ width: `${(article.totalMinted / article.maxSupply) * 100}%` }}
              ></div>
            </div>
            <button
              onClick={handleMint}
              disabled={hasMinted}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${hasMinted
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                }`}
            >
              {hasMinted ? (
                <div className="flex items-center space-x-2">
                  <Check size={18} />
                  <span>Minted</span>
                </div>
              ) : (
                'Mint Now'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      {/* Contract Info */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Contract Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Contract Address:</span>
            <span className="font-mono">{article.contractAddress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Token Standard:</span>
            <span>ERC-1155</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Blockchain:</span>
            <span>Base</span>
          </div>
        </div>
      </div>
    </div>
  );
};