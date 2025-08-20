'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const adminMenuItems = [
  {
    name: 'Dashboard',
    href: '/admin/admindashboard',
    icon: '📊',
    description: 'Overview and statistics'
  },
  {
    name: 'Users',
    href: '/admin/adminusers',
    icon: '👥',
    description: 'Manage user accounts'
  },
  {
    name: 'Partners',
    href: '/admin/adminpartners',
    icon: '🤝',
    description: 'Manage partner companies'
  },
  {
    name: 'Orders',
    href: '/admin/adminorders',
    icon: '📝',
    description: 'View and manage orders'
  },
  {
    name: 'Routes',
    href: '/admin/adminroutes',
    icon: '🛣️',
    description: 'Manage travel routes'
  },
  {
    name: 'Reviews',
    href: '/admin/adminreviews',
    icon: '⭐',
    description: 'View and moderate reviews'
  }
];

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      router.push('/admin/adminlogin');
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin/admindashboard" className="flex items-center space-x-2">
                <span className="text-white text-xl font-bold">🚌 Admin Panel</span>
              </Link>
              
              {/* Admin Status Indicator */}
              <div className="ml-4 hidden sm:block">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                  Admin Active
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {adminMenuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  title={item.description}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-red-700 hover:text-white transition-colors duration-200"
                title="Logout from admin panel"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-700">
              {adminMenuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/admin/admindashboard" className="text-gray-500 hover:text-gray-700">
                    Admin
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <span className="text-gray-900 font-medium">
                    {adminMenuItems.find(item => item.href === pathname)?.name || 'Page'}
                  </span>
                </li>
              </ol>
            </nav>
            
            {/* Current Page Description */}
            <div className="mt-1">
              <p className="text-sm text-gray-600">
                {adminMenuItems.find(item => item.href === pathname)?.description || ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
