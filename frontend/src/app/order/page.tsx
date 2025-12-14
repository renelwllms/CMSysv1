'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { menuService } from '@/services/menu.service';
import { tenantHeaders } from '@/lib/tenant';
import { ordersService, CreateOrderData } from '@/services/orders.service';
import { MenuItem, MenuCategory, Order } from '@/types';
import { formatCurrency } from '@/lib/currency';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
  addedAt: number;
  sizeLabel?: string;
  unitPrice: number;
}

function PublicOrderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');
  const { language, setLanguage, t } = useLanguage();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [enableCabinetFoods, setEnableCabinetFoods] = useState(true);
  const [currency, setCurrency] = useState<string>('IDR');
  const [showSummary, setShowSummary] = useState(false);
  const [upsellItemIds, setUpsellItemIds] = useState<string[]>([]);
  const [statusOrderNumber, setStatusOrderNumber] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `ORD-${yyyy}${mm}${dd}-`;
  });
  const [statusPhone, setStatusPhone] = useState('');
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [detailSize, setDetailSize] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadMenu();
  }, []);

  useEffect(() => {
    filterItems();
  }, [menuItems, selectedCategory, enableCabinetFoods]);

  const loadSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/settings`, {
        method: 'GET',
        headers: tenantHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setEnableCabinetFoods(data.enableCabinetFoods ?? true);
        setCurrency(data.currency || 'IDR');
        setUpsellItemIds(data.upsellItemIds || []);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadMenu = async () => {
    try {
      setLoading(true);
      const items = await menuService.getAll(undefined, true); // Only available items
      setMenuItems(items);
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    // Cabinet food categories that should be filtered based on settings
    const cabinetCategories = ['CABINET_FOOD', 'CAKES', 'DRINKS', 'GIFTS'];

    let items = menuItems;

    // Filter out cabinet food categories if disabled
    if (!enableCabinetFoods) {
      items = items.filter(item => !cabinetCategories.includes(item.category));
    }

    // Apply category filter
    if (selectedCategory === 'ALL') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category === selectedCategory));
    }
  };

  const openDetail = (menuItem: MenuItem) => {
    setDetailItem(menuItem);
    setDetailSize(menuItem.sizes && menuItem.sizes.length > 0 ? menuItem.sizes[0].label : null);
  };

  const addToCart = (menuItem: MenuItem, sizeLabel?: string) => {
    const unitPrice = sizeLabel && menuItem.sizes
      ? Number(menuItem.sizes.find(s => s.label === sizeLabel)?.price ?? menuItem.price)
      : Number(menuItem.price);

    setCart(prev => {
      const existingItem = prev.find(item =>
        item.menuItem.id === menuItem.id && item.sizeLabel === sizeLabel,
      );
      if (existingItem) {
        const updated = prev.map(item =>
          item.menuItem.id === menuItem.id && item.sizeLabel === sizeLabel
            ? { ...item, quantity: item.quantity + 1, addedAt: Date.now(), unitPrice }
            : item
        );
        return updated.sort((a, b) => b.addedAt - a.addedAt);
      }
      return [{ menuItem, quantity: 1, notes: '', addedAt: Date.now(), sizeLabel, unitPrice }, ...prev];
    });
    setShowCart(true);
    setDetailItem(null);
  };

  const updateQuantity = (menuItemId: string, quantity: number, sizeLabel?: string) => {
    setCart(prev => {
      if (quantity <= 0) {
        return prev.filter(item => !(item.menuItem.id === menuItemId && item.sizeLabel === sizeLabel));
      }
      const updated = prev.map(item =>
        item.menuItem.id === menuItemId && item.sizeLabel === sizeLabel
          ? { ...item, quantity, addedAt: Date.now() }
          : item
      );
      return updated.sort((a, b) => b.addedAt - a.addedAt);
    });
  };

  const updateNotes = (menuItemId: string, notes: string, sizeLabel?: string) => {
    setCart(prev =>
      prev.map(item =>
        item.menuItem.id === menuItemId && item.sizeLabel === sizeLabel
          ? { ...item, notes }
          : item
      ),
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  const handleProceedToSummary = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your name and phone number');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setShowCart(false);
    setShowSummary(true);
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your name and phone number');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      setSubmitting(true);
      // Convert frontend language format ('en'/'id') to backend format ('ENGLISH'/'INDONESIAN')
      const backendLanguage = language === 'en' ? 'ENGLISH' : 'INDONESIAN';

      const orderData: CreateOrderData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        language: backendLanguage,
        tableId: tableId || undefined,
        notes: orderNotes.trim() || undefined,
        items: cart.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes.trim() || undefined,
          sizeLabel: item.sizeLabel,
        })),
      };

      const order = await ordersService.create(orderData);
      setOrderNumber(order.orderNumber);
      setOrderSuccess(true);
      setCart([]);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusLookup = async () => {
    setStatusError(null);
    setStatusOrder(null);
    if (!statusOrderNumber.trim() || !statusPhone.trim()) {
      setStatusError('Please enter both order number and phone number used for the order.');
      return;
    }
    try {
      setStatusLoading(true);
      const order = await ordersService.lookupStatus(statusOrderNumber.trim(), statusPhone.trim());
      setStatusOrder(order);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'No order found for this table/phone.';
      setStatusError(message);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleClearTable = async () => {
    if (!statusOrderNumber.trim() || !statusPhone.trim()) {
      setStatusError('Please enter order number and phone number first.');
      return;
    }
    try {
      setStatusLoading(true);
      const order = await ordersService.clearTable(statusOrderNumber.trim(), statusPhone.trim());
      setStatusOrder(order);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to clear this table right now.';
      setStatusError(message);
    } finally {
      setStatusLoading(false);
    }
  };

  const categories = [
    { value: 'ALL', label: 'All Items', color: 'bg-gray-500' },
    { value: MenuCategory.DRINKS, label: 'Drinks', color: 'bg-blue-500' },
    { value: MenuCategory.MAIN_FOODS, label: 'Main Foods', color: 'bg-orange-500' },
    { value: MenuCategory.SNACKS, label: 'Snacks', color: 'bg-yellow-500' },
    { value: MenuCategory.CABINET_FOOD, label: 'Cabinet Food', color: 'bg-purple-500' },
    { value: MenuCategory.CAKES, label: 'Cakes', color: 'bg-pink-500' },
  ];

  const getCategoryColor = (category: MenuCategory) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.order.orderSuccess}</h2>
          <p className="text-gray-600 mb-4">{t.order.orderNumber}:</p>
          <div className="text-4xl font-bold text-indigo-600 mb-6">{orderNumber}</div>
          <p className="text-sm text-gray-500 mb-6">
            {t.order.trackOrder}
          </p>
          <button
            onClick={() => {
              setOrderSuccess(false);
              setCustomerName('');
              setCustomerPhone('');
              setOrderNotes('');
              setOrderNumber('');
            }}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            {t.order.placeAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.order.browseMenu}</h1>
              {tableId && <p className="text-sm text-gray-600">Table Order</p>}
            </div>
            <div className="flex items-center space-x-3">
              {/* Language Switcher */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    language === 'en'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('id')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    language === 'id'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ID
                </button>
              </div>
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <svg className="h-6 w-6 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t.order.cart} ({cart.length})
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Lookup */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-3 md:space-y-0">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
              <input
                type="text"
                value={statusOrderNumber}
                onChange={(e) => setStatusOrderNumber(e.target.value)}
                placeholder="e.g. ORD-20250101-001"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={statusPhone}
                onChange={(e) => setStatusPhone(e.target.value)}
                placeholder="Phone used for the order"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <button
                onClick={handleStatusLookup}
                disabled={statusLoading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {statusLoading ? 'Checking...' : 'Check Status'}
              </button>
            </div>
          </div>
          {statusError && <p className="mt-3 text-sm text-red-600">{statusError}</p>}
          {statusOrder && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order #{statusOrder.orderNumber}</p>
                  <p className="text-lg font-semibold text-gray-900">Status: {statusOrder.status}</p>
                  {statusOrder.table && (
                    <p className="text-sm text-gray-600">Table {statusOrder.table.tableNumber}</p>
                  )}
                </div>
                <div className="mt-3 md:mt-0 text-right">
                  <p className="text-sm text-gray-600">Placed: {new Date(statusOrder.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">
                    Items: {statusOrder.orderItems.reduce((sum, i) => sum + i.quantity, 0)}
                  </p>
                  <p className="text-sm text-gray-900 font-semibold">
                    Total: {formatCurrency(Number(statusOrder.totalAmount), currency)}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <p className="font-medium">Items</p>
                {statusOrder.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.menuItem?.name || 'Item'}
                      {item.sizeLabel ? ` (${item.sizeLabel})` : ''}
                    </span>
                    <span>x{item.quantity}</span>
                  </div>
                ))}
              </div>
              {statusOrder.status === 'COMPLETED' && !statusOrder.tableCleared && (
                <div className="mt-4">
                  <button
                    onClick={handleClearTable}
                    disabled={statusLoading}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {statusLoading ? 'Clearing...' : 'Clear Table for Next Guest'}
                  </button>
                  <p className="mt-1 text-xs text-gray-500">
                    This detaches the completed order from the table so it can be used by the next guest.
                  </p>
                </div>
              )}
              {statusOrder.tableCleared && (
                <p className="mt-2 text-sm text-green-600">
                  Table cleared at {statusOrder.tableClearedAt ? new Date(statusOrder.tableClearedAt).toLocaleString() : 'just now'}.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? `${cat.color} text-white`
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items available in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                onClick={() => openDetail(item)}
              >
                <div className="relative h-40 bg-gray-200">
                  {item.imageUrl ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${item.imageUrl}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600">
                      {item.sizes && item.sizes.length > 0
                        ? formatCurrency(Number(item.sizes[0].price), currency)
                        : formatCurrency(Number(item.price), currency)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.sizes && item.sizes.length > 0) {
                          openDetail(item);
                          return;
                        }
                        addToCart(item);
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b z-10">
              <div className="flex items-center justify-between p-4">
                <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-4 text-gray-500">Your cart is empty</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <>
                  {/* Continue Shopping Button */}
                  <div className="sticky top-4 z-10">
                    <button
                      onClick={() => setShowCart(false)}
                      className="w-full mb-4 px-4 py-3 bg-amber-500 text-white rounded-lg shadow-md hover:bg-amber-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span>Add More Items / Continue Shopping</span>
                    </button>
                  </div>

                  {/* Upsell */}
                  {menuItems.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Recommended for you</h3>
                      <div className="flex space-x-3 overflow-x-auto pb-2">
                        {menuItems
                          .filter(item =>
                            (item.category === MenuCategory.CABINET_FOOD || item.category === MenuCategory.DRINKS || upsellItemIds.includes(item.id)) &&
                            !cart.some(cartItem => cartItem.menuItem.id === item.id && (!item.sizes || item.sizes.length === 0)),
                          )
                          .slice(0, 12)
                          .map(item => (
                            <div key={item.id} className="min-w-[200px] bg-white border rounded-lg shadow-sm p-3 flex flex-col">
                              <div className="h-28 w-full rounded-md overflow-hidden bg-gray-100 mb-2">
                                {item.imageUrl ? (
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${item.imageUrl}`}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div className="font-semibold text-gray-900 line-clamp-2">{item.name}</div>
                              <div className="text-xs text-gray-500 mb-2 capitalize">{item.category.toLowerCase().replace(/_/g, ' ')}</div>
                              <div className="text-sm text-gray-700 mb-2 font-medium">
                                {item.sizes && item.sizes.length > 0
                                  ? formatCurrency(Number(item.sizes[0].price), currency)
                                  : formatCurrency(Number(item.price), currency)}
                              </div>
                              <button
                                onClick={() => {
                                  if (item.sizes && item.sizes.length > 0) {
                                    openDetail(item);
                                    return;
                                  }
                                  addToCart(item);
                                }}
                                className="mt-auto px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={`${item.menuItem.id}-${item.sizeLabel || 'base'}`} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.menuItem.name}</h4>
                            {item.sizeLabel && (
                              <p className="text-xs text-gray-500">Size: {item.sizeLabel}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {formatCurrency(Number(item.unitPrice), currency)}
                            </p>
                          </div>
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, 0, item.sizeLabel)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center space-x-3 mb-2">
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1, item.sizeLabel)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1, item.sizeLabel)}
                            className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
                          >
                            +
                          </button>
                          <span className="flex-1 text-right font-semibold text-indigo-600">
                            {formatCurrency(Number(item.unitPrice) * item.quantity, currency)}
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="Special notes (optional)"
                          value={item.notes}
                          onChange={(e) => updateNotes(item.menuItem.id, e.target.value, item.sizeLabel)}
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-gray-900">Your Information</h3>
                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <textarea
                      placeholder="Special notes for your order (optional)"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-indigo-600">
                        {formatCurrency(getTotalAmount(), currency)}
                      </span>
                    </div>
                  </div>

                  {/* Review Order Button */}
                  <button
                    onClick={handleProceedToSummary}
                    disabled={cart.length === 0}
                    className="w-full py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Customer Info */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{customerPhone}</span>
                  </div>
                  {tableId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Table:</span>
                      <span className="font-medium">Table Order</span>
                    </div>
                  )}
                  {orderNotes && (
                    <div>
                      <div className="text-gray-600 mb-1">Notes:</div>
                      <div className="font-medium">{orderNotes}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={`${item.menuItem.id}-${item.sizeLabel || 'base'}`} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.menuItem.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.sizeLabel && <span className="mr-2">Size: {item.sizeLabel}</span>}
                          Qty: {item.quantity} × {formatCurrency(Number(item.unitPrice), currency)}
                        </div>
                        {item.notes && (
                          <div className="text-xs text-gray-500 mt-1">Note: {item.notes}</div>
                        )}
                      </div>
                      <div className="font-semibold text-indigo-600">
                        {formatCurrency(Number(item.unitPrice) * item.quantity, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="text-indigo-600">
                    {formatCurrency(getTotalAmount(), currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setShowSummary(false);
                    setShowCart(true);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Edit Order
                </button>
                <button
                  onClick={async () => {
                    setShowSummary(false);
                    await handleSubmitOrder();
                  }}
                  disabled={submitting}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{detailItem.name}</h3>
                  {detailItem.category && (
                    <p className="text-xs uppercase text-gray-500">{detailItem.category.replace(/_/g, ' ')}</p>
                  )}
                </div>
                <button
                  onClick={() => setDetailItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="h-56 w-full rounded-lg overflow-hidden bg-gray-100 mb-4">
                {detailItem.imageUrl ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000'}${detailItem.imageUrl}`}
                    alt={detailItem.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No image
                  </div>
                )}
              </div>

              {detailItem.description && (
                <p className="text-sm text-gray-700 mb-4">{detailItem.description}</p>
              )}

              {detailItem.sizes && detailItem.sizes.length > 0 ? (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-800 mb-2">Choose a size</p>
                  <div className="space-y-2">
                    {detailItem.sizes.map((size) => (
                      <label key={size.label} className="flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer hover:border-indigo-500">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="size"
                            className="mr-3"
                            checked={detailSize === size.label}
                            onChange={() => setDetailSize(size.label)}
                          />
                          <span className="font-medium text-gray-900">{size.label}</span>
                        </div>
                        <span className="text-sm text-gray-700">{formatCurrency(Number(size.price), currency)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 mb-4">
                  Price: <span className="font-semibold text-gray-900">{formatCurrency(Number(detailItem.price), currency)}</span>
                </p>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDetailItem(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (detailItem.sizes && detailItem.sizes.length > 0 && !detailSize) {
                      alert('Please choose a size');
                      return;
                    }
                    addToCart(detailItem, detailSize || undefined);
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicOrderPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    }>
      <PublicOrderPageContent />
    </Suspense>
  );
}
