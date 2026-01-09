'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { menuService } from '@/services/menu.service';
import { MenuItem, MenuCategory } from '@/types';
import MenuItemForm from '@/components/MenuItemForm';
import { formatCurrency } from '@/lib/currency';
import { tenantHeaders } from '@/lib/tenant';

export default function MenuManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('IDR');
  const [categories, setCategories] = useState<Array<{ value: string; label: string; color: string }>>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    loadSettings();
    loadMenuItems();
    loadCategories();
  }, []);

  const loadSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/settings`, { headers: tenantHeaders() });
      if (response.ok) {
        const data = await response.json();
        setCurrency(data.currency || 'IDR');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  useEffect(() => {
    filterItems();
  }, [menuItems, selectedCategory, searchTerm]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await menuService.getAll();
      setMenuItems(items);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCategoryLabel = (value: string) =>
    value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const loadCategories = async () => {
    try {
      const data = await menuService.getCategories();
      const defaults = Object.values(MenuCategory) as string[];
      const merged = new Set<string>([...defaults, ...data]);
      const ordered = [
        ...defaults.filter((category) => merged.has(category)),
        ...Array.from(merged).filter((category) => !defaults.includes(category)).sort(),
      ];
      const palette = [
        'bg-blue-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-green-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-rose-500',
      ];
      const options = ordered.map((value, index) => ({
        value,
        label: formatCategoryLabel(value),
        color: palette[index % palette.length],
      }));
      setCategories([{ value: 'ALL', label: 'All Items', color: 'bg-gray-500' }, ...options]);
    } catch (error) {
      console.error('Failed to load categories:', error);
      const defaults = Object.values(MenuCategory) as string[];
      setCategories([
        { value: 'ALL', label: 'All Items', color: 'bg-gray-500' },
        ...defaults.map((value, index) => ({
          value,
          label: formatCategoryLabel(value),
          color: ['bg-blue-500', 'bg-orange-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500'][index % 6],
        })),
      ]);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nameId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      await menuService.toggleAvailability(id);
      await loadMenuItems();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await menuService.delete(id);
      await loadMenuItems();
      await loadCategories();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const getCategoryColor = (category: MenuCategory) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'bg-gray-500';
  };

  const getCategoryLabel = (category: MenuCategory) => {
    const cat = categories.find(c => c.value === category);
    return cat?.label || formatCategoryLabel(category);
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Menu Management</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{user.fullName}</span>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? `${cat.color} text-white`
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat.label}
                {cat.value === 'ALL' && <span className="ml-2 text-sm">({menuItems.length})</span>}
                {cat.value !== 'ALL' && (
                  <span className="ml-2 text-sm">
                    ({menuItems.filter(item => item.category === cat.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No menu items found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new menu item.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {item.imageUrl ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${item.imageUrl}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg
                        className="h-16 w-16 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Availability Badge */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(item.category)}`}>
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                  {item.nameId && (
                    <p className="text-sm text-gray-600 mb-2">{item.nameId}</p>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(item.price ?? item.sizes?.[0]?.price ?? 0, currency)}
                    </span>
                    {item.stockQty !== null && item.stockQty !== undefined && (
                      <span className="text-sm text-gray-600">
                        Stock: {item.stockQty}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Menu Item?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <MenuItemForm
          item={editingItem}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSuccess={async () => {
            await loadMenuItems();
            await loadCategories();
          }}
        />
      )}
    </div>
  );
}
