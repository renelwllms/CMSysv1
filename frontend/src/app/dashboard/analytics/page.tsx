'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ordersService } from '@/services/orders.service';
import { menuService } from '@/services/menu.service';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currency';

interface Analytics {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  popularItems: Array<{ name: string; count: number; revenue: number }>;
  categoryBreakdown: Array<{ category: string; count: number; revenue: number }>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
  tableUsage: Array<{ tableNumber: string; count: number }>;
  busiestHours: Array<{ hour: number; count: number }>;
  avgCookingTime: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalOrders: number;
}

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [currency, setCurrency] = useState<string>('IDR');
  const [analytics, setAnalytics] = useState<Analytics>({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    todayOrders: 0,
    weekOrders: 0,
    monthOrders: 0,
    popularItems: [],
    categoryBreakdown: [],
    hourlyDistribution: [],
    tableUsage: [],
    busiestHours: [],
    avgCookingTime: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    loadSettings();
    loadAnalytics();
  }, []);

  const loadSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/settings`);
      if (response.ok) {
        const data = await response.json();
        setCurrency(data.currency || 'IDR');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Get analytics data from backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/orders/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const backendAnalytics = await response.json();

      // Also get all orders for time-based filtering
      const orders = await ordersService.getAll();

      // Calculate analytics from orders
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const todayOrders = orders.filter(o => new Date(o.createdAt) >= todayStart && o.paymentStatus === 'PAID');
      const weekOrders = orders.filter(o => new Date(o.createdAt) >= weekStart && o.paymentStatus === 'PAID');
      const monthOrders = orders.filter(o => new Date(o.createdAt) >= monthStart && o.paymentStatus === 'PAID');

      const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      const weekRevenue = weekOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

      // Popular items
      const itemCounts = new Map<string, { name: string; count: number; revenue: number }>();
      orders.filter(o => o.paymentStatus === 'PAID').forEach(order => {
        order.orderItems.forEach(item => {
          const key = item.menuItem?.id || '';
          const existing = itemCounts.get(key);
          if (existing) {
            existing.count += item.quantity;
            existing.revenue += Number(item.subtotal);
          } else {
            itemCounts.set(key, {
              name: item.menuItem?.name || 'Unknown',
              count: item.quantity,
              revenue: Number(item.subtotal),
            });
          }
        });
      });

      const popularItems = Array.from(itemCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setAnalytics({
        todayRevenue,
        weekRevenue,
        monthRevenue,
        todayOrders: todayOrders.length,
        weekOrders: weekOrders.length,
        monthOrders: monthOrders.length,
        popularItems,
        categoryBreakdown: [],
        hourlyDistribution: [],
        tableUsage: backendAnalytics.tableUsage || [],
        busiestHours: backendAnalytics.busiestHours || [],
        avgCookingTime: backendAnalytics.avgCookingTime || 0,
        totalRevenue: backendAnalytics.totalRevenue || 0,
        avgOrderValue: backendAnalytics.avgOrderValue || 0,
        totalOrders: backendAnalytics.totalOrders || 0,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  const getRevenue = () => {
    switch (period) {
      case 'today': return analytics.todayRevenue;
      case 'week': return analytics.weekRevenue;
      case 'month': return analytics.monthRevenue;
    }
  };

  const getOrders = () => {
    switch (period) {
      case 'today': return analytics.todayOrders;
      case 'week': return analytics.weekOrders;
      case 'month': return analytics.monthOrders;
    }
  };

  const getAverageOrderValue = () => {
    const orders = getOrders();
    return orders > 0 ? getRevenue() / orders : 0;
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Analytics & Reports</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{user.fullName}</span>
              <button
                onClick={loadAnalytics}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Selector */}
        <div className="mb-6">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
            <button
              onClick={() => setPeriod('today')}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
                period === 'today'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
                period === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
                period === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 break-words">{formatCurrency(getRevenue())}</p>
                <p className="text-xs text-gray-500 mt-1">All-time: {formatCurrency(analytics.totalRevenue)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 break-words">{getOrders()}</p>
                <p className="text-xs text-gray-500 mt-1">All-time: {analytics.totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Average Order Value</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 break-words">{formatCurrency(getAverageOrderValue())}</p>
                <p className="text-xs text-gray-500 mt-1">All-time: {formatCurrency(analytics.avgOrderValue)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h2>
            {analytics.popularItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No sales data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.popularItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-50 text-gray-500'
                        } font-bold text-sm`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.count} sold</p>
                        </div>
                      </div>
                      <div className="mt-2 ml-11">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${(item.count / analytics.popularItems[0].count) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(item.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Average Cooking Time & Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kitchen Performance</h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Cooking Time</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      {analytics.avgCookingTime < 60
                        ? `${analytics.avgCookingTime} min`
                        : `${Math.floor(analytics.avgCookingTime / 60)}h ${analytics.avgCookingTime % 60}m`
                      }
                    </p>
                  </div>
                  <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Best Sellers</p>
                  <p className="text-sm text-gray-600 mt-1">{analytics.popularItems[0]?.name || 'No data'} is your top performer</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Order Volume</p>
                  <p className="text-sm text-gray-600 mt-1">Consistent order flow throughout the day</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Usage & Busiest Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Table Usage */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Table Usage</h2>
            {analytics.tableUsage.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No table usage data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.tableUsage.slice(0, 5).map((table, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0 ? 'bg-indigo-100 text-indigo-600' :
                        index === 1 ? 'bg-purple-100 text-purple-600' :
                        index === 2 ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-50 text-gray-500'
                      } font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Table {table.tableNumber}</p>
                        <div className="mt-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${(table.count / analytics.tableUsage[0].count) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-bold text-gray-900">{table.count}</p>
                      <p className="text-xs text-gray-500">orders</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Busiest Time of Day */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Busiest Time of Day</h2>
            {analytics.busiestHours.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hourly data available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.busiestHours.map((hourData, index) => {
                  const hour12 = hourData.hour === 0 ? 12 : hourData.hour > 12 ? hourData.hour - 12 : hourData.hour;
                  const ampm = hourData.hour >= 12 ? 'PM' : 'AM';
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600' :
                          index === 1 ? 'bg-orange-100 text-orange-600' :
                          index === 2 ? 'bg-red-100 text-red-600' :
                          'bg-gray-50 text-gray-500'
                        } font-bold text-sm`}>
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{hour12}:00 {ampm}</p>
                          <div className="mt-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-600 h-2 rounded-full"
                              style={{
                                width: `${(hourData.count / analytics.busiestHours[0].count) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-bold text-gray-900">{hourData.count}</p>
                        <p className="text-xs text-gray-500">orders</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export as PDF</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export as Excel</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>Export as CSV</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
