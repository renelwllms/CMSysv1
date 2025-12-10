'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MenuItem, MenuCategory, Order } from '@/types';
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
}

export default function NewOrderPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Step state
  const [step, setStep] = useState(1); // 1: Table, 2: Menu Items, 3: Customer Info

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
  const [submitting, setSubmitting] = useState(false);
  const [currency, setCurrency] = useState<string>('IDR');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user && user.role === 'KITCHEN') {
      router.push('/dashboard/kitchen');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    loadSettings();
    loadTables();
    loadMenuItems();
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

  useEffect(() => {
    filterMenuItems();
  }, [menuItems, selectedCategory, searchTerm]);

  const loadTables = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/tables`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTables(data.filter((t: Table) => t.isActive));
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/menu`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.filter((m: MenuItem) => m.isAvailable));
      }
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

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

  const addToCart = (menuItem: MenuItem) => {
    const existing = cart.find(item => item.menuItem.id === menuItem.id);
    if (existing) {
      setCart(cart.map(item =>
        item.menuItem.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { menuItem, quantity: 1 }]);
    }
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(menuItemId);
    } else {
      setCart(cart.map(item =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter(item => item.menuItem.id !== menuItemId));
  };

  const updateItemNotes = (menuItemId: string, notes: string) => {
    setCart(cart.map(item =>
      item.menuItem.id === menuItemId
        ? { ...item, notes }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + Number(item.menuItem.price) * item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (!selectedTable || cart.length === 0 || !customerName || !customerPhone) {
      alert('Please complete all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

      const orderData = {
        tableId: selectedTable.id,
        customerName,
        customerPhone,
        notes: orderNotes,
        language: 'ENGLISH',
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };

      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        alert(`Order ${order.orderNumber} created successfully!`);
        router.push('/dashboard/orders');
      } else {
        const error = await response.json();
        alert(`Failed to create order: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
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

  const categories = [
    { value: 'ALL', label: 'All Items' },
    { value: MenuCategory.DRINKS, label: 'Drinks' },
    { value: MenuCategory.MAIN_FOODS, label: 'Main Foods' },
    { value: MenuCategory.SNACKS, label: 'Snacks' },
    { value: MenuCategory.CABINET_FOOD, label: 'Cabinet Food' },
    { value: MenuCategory.CAKES, label: 'Cakes' },
    { value: MenuCategory.GIFTS, label: 'Gifts' },
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
              <h1 className="text-xl font-bold text-gray-900">Create New Order</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{user.fullName}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {/* Step 1 */}
              <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">Select Table</span>
              </div>

              <div className="w-16 h-1 bg-gray-300"></div>

              {/* Step 2 */}
              <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Add Items</span>
              </div>

              <div className="w-16 h-1 bg-gray-300"></div>

              {/* Step 3 */}
              <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">Customer Info</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Select Table */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Table</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => {
                    setSelectedTable(table);
                    setStep(2);
                  }}
                  className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border-2 border-gray-200 hover:border-indigo-600"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      Table {table.tableNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      {table.seats} seats
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {tables.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No active tables available</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Add Menu Items */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Items Section */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Select Items</h2>
                {selectedTable && (
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Change Table (Table {selectedTable.tableNumber})
                  </button>
                )}
              </div>

              {/* Category Filters */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value as MenuCategory | 'ALL')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === cat.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenuItems.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-lg font-bold text-indigo-600 mt-2">
                          {formatCurrency(item.price, currency)}
                        </p>
                        {item.category === MenuCategory.CABINET_FOOD && item.stockQty !== null && (
                          <p className="text-xs text-gray-500">Stock: {item.stockQty}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Add to Order
                    </button>
                  </div>
                ))}
              </div>

              {filteredMenuItems.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-500">No menu items found</p>
                </div>
              )}
            </div>

            {/* Cart Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Order Items ({cart.length})
                </h3>

                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.menuItem.id} className="border-b border-gray-200 pb-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.menuItem.name}</h4>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(item.menuItem.price, currency)} each
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.menuItem.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <div className="flex items-center space-x-2 mb-2">
                            <button
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="px-4 py-1 bg-gray-100 rounded font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Special notes..."
                            value={item.notes || ''}
                            onChange={(e) => updateItemNotes(item.menuItem.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                          />

                          <p className="text-right font-semibold text-gray-900 mt-2">
                            {formatCurrency(Number(item.menuItem.price) * item.quantity, currency)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-300 pt-4 mb-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-indigo-600">{formatCurrency(calculateTotal(), currency)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep(3)}
                      disabled={cart.length === 0}
                      className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Customer Info
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Customer Info */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Information</h2>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Any special requests or notes..."
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Table:</span>
                  <span className="font-medium">Table {selectedTable?.tableNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{cart.length} items</span>
                </div>
                {cart.map((item) => (
                  <div key={item.menuItem.id} className="flex justify-between text-sm pl-4">
                    <span className="text-gray-600">
                      {item.menuItem.name} × {item.quantity}
                    </span>
                    <span>{formatCurrency(Number(item.menuItem.price) * item.quantity, currency)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Amount:</span>
                  <span className="text-indigo-600">{formatCurrency(calculateTotal(), currency)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Back to Menu
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={submitting || !customerName || !customerPhone}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Order to Kitchen'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
