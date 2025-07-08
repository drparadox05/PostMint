import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, PieChart } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Explore', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BookOpen },
    { path: '/portfolio', label: 'Portfolio', icon: PieChart },
  ];

  return (
    <nav className="hidden md:flex space-x-8">
      {navItems.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            location.pathname === path
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
          }`}
        >
          <Icon size={18} />
          <span className="font-medium">{label}</span>
        </Link>
      ))}
    </nav>
  );
};
