import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './config/wagmi';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CreatorDashboard } from './pages/CreatorDashboard';
import { Portfolio } from './pages/Portfolio';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<CreatorDashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
          </Layout>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
