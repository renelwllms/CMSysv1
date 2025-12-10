'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/currency';

interface OrderStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  activeOrders: number;
}

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [businessName, setBusinessName] = useState('BrewPoint');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [currency, setCurrency] = useState('IDR');
  const [stats, setStats] = useState<OrderStats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    activeOrders: 0,
  });
  const [menuItemsCount, setMenuItemsCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    // Redirect kitchen users to kitchen display only
    if (!isLoading && user && user.role === 'KITCHEN') {
      router.push('/dashboard/kitchen');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Fetch business name, logo, and currency from settings
    const fetchSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const response = await fetch(`${apiUrl}/settings`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.businessName) {
            setBusinessName(data.businessName);
          }
          if (data.logoUrl) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
            setLogoUrl(`${baseUrl}${data.logoUrl}`);
          }
          if (data.currency) {
            setCurrency(data.currency);
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const fetchStats = async () => {
    if (!user) return;

    try {
      setStatsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('token');

      const [orderStatsResponse, menuResponse] = await Promise.all([
        fetch(`${apiUrl}/orders/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${apiUrl}/menu`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
      ]);

      if (orderStatsResponse.ok) {
        const orderStats = await orderStatsResponse.json();
        setStats(orderStats);
      }

      if (menuResponse.ok) {
        const menuItems = await menuResponse.json();
        setMenuItemsCount(menuItems.length);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleOrderUpdate = () => {
      fetchStats(); // Reload stats when any order event occurs
    };

    socket.on('order:created', handleOrderUpdate);
    socket.on('order:statusChanged', handleOrderUpdate);
    socket.on('order:paymentUpdated', handleOrderUpdate);
    socket.on('order:deleted', handleOrderUpdate);

    return () => {
      socket.off('order:created', handleOrderUpdate);
      socket.off('order:statusChanged', handleOrderUpdate);
      socket.off('order:paymentUpdated', handleOrderUpdate);
      socket.off('order:deleted', handleOrderUpdate);
    };
  }, [socket, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const allDashboardStats = [
    {
      name: 'Today\'s Orders',
      value: statsLoading ? '...' : stats.todayOrders.toString(),
      change: '',
      changeType: 'neutral',
      roles: ['ADMIN', 'STAFF'], // Visible to both
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'Menu Items',
      value: statsLoading ? '...' : menuItemsCount.toString(),
      change: '',
      changeType: 'neutral',
      roles: ['ADMIN', 'STAFF'],
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      name: 'Pending Payment',
      value: statsLoading ? '...' : stats.pendingOrders.toString(),
      change: stats.pendingOrders > 0 ? 'Awaiting Payment' : '',
      changeType: stats.pendingOrders > 0 ? 'neutral' : 'neutral',
      roles: ['ADMIN', 'STAFF'],
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Today\'s Revenue',
      value: statsLoading ? '...' : formatCurrency(stats.todayRevenue, currency),
      change: '',
      changeType: 'increase',
      roles: ['ADMIN'], // Only visible to admin
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Filter stats based on user role
  const dashboardStats = allDashboardStats.filter(stat =>
    stat.roles.includes(user?.role || 'ADMIN')
  );

  const allQuickActions = [
    {
      name: 'New Order',
      description: 'Create a new customer order',
      href: '/dashboard/orders',
      roles: ['ADMIN', 'STAFF'],
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: 'bg-indigo-500',
    },
    {
      name: 'Manage Menu',
      description: 'Update menu items and prices',
      href: '/dashboard/menu',
      roles: ['ADMIN', 'STAFF'],
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'bg-green-500',
    },
    {
      name: 'View Tables',
      description: 'Manage table reservations',
      href: '/dashboard/tables',
      roles: ['ADMIN', 'STAFF'],
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'bg-purple-500',
    },
    {
      name: 'Kitchen View',
      description: 'Monitor kitchen orders',
      href: '/dashboard/kitchen',
      roles: ['ADMIN', 'STAFF'],
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'bg-orange-500',
    },
    {
      name: 'Customers',
      description: 'View customer directory',
      href: '/dashboard/customers',
      roles: ['ADMIN'],
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-teal-500',
    },
    {
      name: 'Settings',
      description: 'Configure business settings',
      href: '/dashboard/settings',
      roles: ['ADMIN'],
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-gray-500',
    },
    {
      name: 'Analytics',
      description: 'View sales reports',
      href: '/dashboard/analytics',
      roles: ['ADMIN'],
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-blue-500',
    },
  ];

  // Filter quick actions based on user role
  const quickActions = allQuickActions.filter(action =>
    action.roles.includes(user?.role || 'ADMIN')
  );

  const recentActivity = [
    { id: 1, action: 'System initialized', time: 'Just now', user: 'System' },
    { id: 2, action: 'Database seeded', time: '5 minutes ago', user: 'System' },
    { id: 3, action: 'Admin user logged in', time: 'Just now', user: user.fullName },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                {logoUrl ? (
                  <img src={logoUrl} alt={businessName} className="h-8 w-auto" />
                ) : (
                  <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                )}
                <span className="ml-2 text-xl font-bold text-gray-900">{businessName}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.fullName}!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Here's what's happening with your cafe today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${user?.role === 'STAFF' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} mb-8`}>
          {dashboardStats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-3 bg-indigo-100 rounded-lg">
                    <div className="text-indigo-600">{stat.icon}</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'increase'
                              ? 'text-green-600'
                              : stat.changeType === 'decrease'
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => router.push(action.href)}
                className="relative group bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left"
              >
                <div>
                  <span className={`${action.color} rounded-lg inline-flex p-3 ring-4 ring-white`}>
                    <div className="text-white">{action.icon}</div>
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {action.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-500">{activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">System Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Backend Server</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Database</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Authentication</span>
                  </div>
                  <span className="text-xs font-medium text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Payment Gateway</span>
                  </div>
                  <span className="text-xs font-medium text-yellow-600">Setup Required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
