'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/currency';

interface Customer {
  name: string;
  phone: string;
  firstOrderDate: string;
  lastOrderDate: string;
  orderCount: number;
  totalSpent: number;
}

export default function CustomersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'orders' | 'spent'>('recent');
  const [currency, setCurrency] = useState<string>('IDR');
  const [exporting, setExporting] = useState(false);
  const [deletingPhone, setDeletingPhone] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    // Only admin can access
    if (!isLoading && user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadSettings();
      loadCustomers();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${apiUrl}/settings`);
      if (response.ok) {
        const data = await response.json();
        setCurrency(data.currency || 'IDR');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  useEffect(() => {
    filterAndSortCustomers();
  }, [customers, searchTerm, sortBy]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/orders/customers/all`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCustomers = () => {
    let filtered = customers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
      } else if (sortBy === 'orders') {
        return b.orderCount - a.orderCount;
      } else if (sortBy === 'spent') {
        return b.totalSpent - a.totalSpent;
      }
      return 0;
    });

    setFilteredCustomers(sorted);
  };

  const viewCustomerOrders = (phone: string) => {
    router.push(`/dashboard/orders?customer=${phone}`);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch(`${apiUrl}/orders/customers/export`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to export customers');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'customers.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export customers:', error);
      alert('Failed to export customers. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteCustomer = async (phone: string) => {
    if (!confirm('Delete this customer and all their orders? This cannot be undone.')) {
      return;
    }
    try {
      setDeletingPhone(phone);
      const response = await fetch(`${apiUrl}/orders/customers/${encodeURIComponent(phone)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      await loadCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Failed to delete customer. Please try again.');
    } finally {
      setDeletingPhone(null);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
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
              <h1 className="text-xl font-bold text-gray-900">Customer Directory</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{user.fullName}</span>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                {exporting ? 'Exporting…' : 'Export CSV'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Total Customers</div>
            <div className="mt-2 text-2xl md:text-3xl font-bold text-gray-900 leading-snug break-all">
              {customers.length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Total Orders</div>
            <div className="mt-2 text-2xl md:text-3xl font-bold text-indigo-600 leading-snug break-all">
              {customers.reduce((sum, c) => sum + c.orderCount, 0)}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort By */}
            <div className="w-full md:w-56">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'orders' | 'spent')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="recent">Most Recent</option>
                <option value="orders">Most Orders</option>
                <option value="spent">Highest Spending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">No customers match your search criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      First Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer, index) => (
                    <tr key={`${customer.phone}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.firstOrderDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.lastOrderDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {customer.orderCount} orders
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(customer.totalSpent, currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewCustomerOrders(customer.phone)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Orders
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.phone)}
                          className="ml-4 text-red-600 hover:text-red-800 disabled:opacity-60"
                          disabled={deletingPhone === customer.phone}
                        >
                          {deletingPhone === customer.phone ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
