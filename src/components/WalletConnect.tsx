import React, { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { Wallet, ChevronDown } from 'lucide-react';
import { base } from 'wagmi/chains';

export const WalletConnect: React.FC = () => {
  const { address, isConnected, chainId: currentChainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const BASE_CHAIN_ID = base.id;

  useEffect(() => {
    if (isConnected && currentChainId && currentChainId !== BASE_CHAIN_ID) {
      console.log(`Connected to chain ${currentChainId}. Switching to Base (${BASE_CHAIN_ID}).`);
      switchChain({ chainId: BASE_CHAIN_ID });
    }
  }, [isConnected, currentChainId, switchChain, BASE_CHAIN_ID]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="relative group">
        <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
          <Wallet size={18} />
          <span className="font-medium">{formatAddress(address)}</span>
          <ChevronDown size={16} />
        </button>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 
          opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          transition-all duration-200 z-10"
        >
          <button
            onClick={() => disconnect()}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0], chainId: BASE_CHAIN_ID })}
      className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
    >
      <Wallet size={18} />
      <span className="font-medium">Connect Wallet</span>
    </button>
  );
};
