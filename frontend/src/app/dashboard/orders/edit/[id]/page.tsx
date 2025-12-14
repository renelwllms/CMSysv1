'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MenuItem, MenuCategory, Order } from '@/types';
import { ordersService } from '@/services/orders.service';
import { formatCurrency } from '@/lib/currency';

interface Table {
  id: string;
  tableNumber: string;
  seats: number;
  isActive: boolean;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  sizeLabel?: string;
  unitPrice: number;
}

export default function EditOrderPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  // Order data
  const [order, setOrder] = useState<Order | null>(null);

  // Tables
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Menu items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<string>('IDR');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user && user.role === 'KITCHEN') {
      router.push('/dashboard/kitchen');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (orderId) {
      loadSettings();
      loadOrder();
      loadTables();
      loadMenuItems();
    }
  }, [orderId]);

  useEffect(() => {
    filterMenuItems();
  }, [menuItems, selectedCategory, searchTerm]);

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

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await ordersService.getById(orderId);
      setOrder(orderData);
      setCustomerName(orderData.customerName);
      setCustomerPhone(orderData.customerPhone);
      setOrderNotes(orderData.notes || '');

      // Convert order items to cart items
      const cartItems: CartItem[] = orderData.orderItems
        .filter(item => item.menuItem)
        .map(item => ({
          menuItem: item.menuItem!,
          quantity: item.quantity,
          notes: item.notes || '',
          sizeLabel: item.sizeLabel || undefined,
          unitPrice: Number(item.unitPrice),
        }));
      setCart(cartItems);
    } catch (error) {
      console.error('Failed to load order:', error);
      alert('Failed to load order');
      router.push('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/tables`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTables(data.filter((t: Table) => t.isActive));
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
    }
  };

  const loadMenuItems = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/menu`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.filter((m: MenuItem) => m.isAvailable));
      }
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  useEffect(() => {
    if (order && tables.length > 0 && order.tableId) {
      const table = tables.find(t => t.id === order.tableId);
      setSelectedTable(table || null);
    }
  }, [order, tables]);

  const filterMenuItems = () => {
    let filtered = menuItems;

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMenuItems(filtered);
  };

  const addToCart = (menuItem: MenuItem, sizeLabel?: string) => {
    const unitPrice = sizeLabel && menuItem.sizes
      ? Number(menuItem.sizes.find(s => s.label === sizeLabel)?.price ?? menuItem.price)
      : Number(menuItem.price);
    const existingItem = cart.find(item => item.menuItem.id === menuItem.id && item.sizeLabel === sizeLabel);
    if (existingItem) {
      setCart(cart.map(item =>
        item.menuItem.id === menuItem.id && item.sizeLabel === sizeLabel
          ? { ...item, quantity: item.quantity + 1, unitPrice }
          : item
      ));
    } else {
      setCart([...cart, { menuItem, quantity: 1, notes: '', sizeLabel, unitPrice }]);
    }
  };

  const updateQuantity = (menuItemId: string, quantity: number, sizeLabel?: string) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => !(item.menuItem.id === menuItemId && item.sizeLabel === sizeLabel)));
    } else {
      setCart(cart.map(item =>
        item.menuItem.id === menuItemId && item.sizeLabel === sizeLabel ? { ...item, quantity } : item
      ));
    }
  };

  const updateNotes = (menuItemId: string, notes: string, sizeLabel?: string) => {
    setCart(cart.map(item =>
      item.menuItem.id === menuItemId && item.sizeLabel === sizeLabel ? { ...item, notes } : item
    ));
  };

  const removeFromCart = (menuItemId: string, sizeLabel?: string) => {
    setCart(cart.filter(item => !(item.menuItem.id === menuItemId && item.sizeLabel === sizeLabel)));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (Number(item.unitPrice ?? item.menuItem.price) * item.quantity);
    }, 0);
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    if (!customerPhone.trim()) {
      alert('Please enter customer phone');
      return;
    }

    try {
      setSubmitting(true);

      const updateData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        notes: orderNotes.trim() || undefined,
        tableId: selectedTable?.id,
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes || undefined,
          sizeLabel: item.sizeLabel,
        })),
      };

      await ordersService.update(orderId, updateData);
      alert('Order updated successfully!');
      router.push('/dashboard/orders');
    } catch (error: any) {
      console.error('Failed to update order:', error);
      alert(error.response?.data?.message || 'Failed to update order');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role === 'KITCHEN') {
    return null;
  }

  const categories = [
    { value: 'ALL', label: 'All Items' },
    { value: MenuCategory.DRINKS, label: 'Drinks' },
    { value: MenuCategory.CABINET_FOOD, label: 'Cabinet Food' },
    { value: MenuCategory.CAKES, label: 'Cakes' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/orders')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Edit Order - {order.orderNumber}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{user.fullName}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Table Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Table</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setSelectedTable(null)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !selectedTable
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">No Table</div>
                    <div className="text-xs text-gray-500">Takeaway</div>
                  </div>
                </button>
                {tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTable?.id === table.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">Table {table.tableNumber}</div>
                      <div className="text-xs text-gray-500">{table.seats} seats</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu Items</h2>

              {/* Category Filter */}
              <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value as MenuCategory | 'ALL')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                      selectedCategory === cat.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                {filteredMenuItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all text-left">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                        <div className="text-sm font-semibold text-indigo-600 mt-2">
                          {item.sizes && item.sizes.length > 0
                            ? `${item.sizes[0].label}: ${formatCurrency(Number(item.sizes[0].price), currency)}`
                            : formatCurrency(Number(item.price), currency)}
                        </div>
                      </div>
                      {cart.find(cartItem => cartItem.menuItem.id === item.id) && (
                        <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full">
                          {cart
                            .filter(cartItem => cartItem.menuItem.id === item.id)
                            .reduce((sum, ci) => sum + ci.quantity, 0)}
                        </span>
                      )}
                    </div>
                    {item.sizes && item.sizes.length > 0 ? (
                      <div className="space-y-2">
                        {item.sizes.map((size) => (
                          <button
                            key={size.label}
                            onClick={() => addToCart(item, size.label)}
                            className="w-full mt-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-colors flex justify-between"
                          >
                            <span>{size.label}</span>
                            <span className="font-semibold">{formatCurrency(Number(size.price), currency)}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Add to Order
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart and Customer Info - Right Side */}
          <div className="space-y-6">
            {/* Cart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items in order</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={`${item.menuItem.id}-${item.sizeLabel || 'base'}`} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.menuItem.name}</div>
                          {item.sizeLabel && (
                            <div className="text-xs text-gray-500">Size: {item.sizeLabel}</div>
                          )}
                          <div className="text-sm text-gray-500">
                            {formatCurrency(Number(item.unitPrice ?? item.menuItem.price), currency)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.menuItem.id, item.sizeLabel)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1, item.sizeLabel)}
                          className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.menuItem.id, parseInt(e.target.value) || 0, item.sizeLabel)}
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                          min="1"
                        />
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1, item.sizeLabel)}
                          className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={item.notes}
                        onChange={(e) => updateNotes(item.menuItem.id, e.target.value, item.sizeLabel)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                      />

                      <div className="text-right mt-2 font-semibold text-gray-900">
                        {formatCurrency(Number(item.unitPrice ?? item.menuItem.price) * item.quantity, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-indigo-600">{formatCurrency(calculateTotal(), currency)}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Customer name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Notes
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Additional notes (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || cart.length === 0}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Updating...' : 'Update Order'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
