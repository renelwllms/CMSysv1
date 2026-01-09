'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { menuService } from '@/services/menu.service';
import { ordersService } from '@/services/orders.service';
import { tablesService } from '@/services/tables.service';
import {
  MenuCategory,
  MenuItem,
  Order,
  OrderStatus,
  PaymentStatus,
  Table,
  UserRole,
} from '@/types';
import { formatCurrency } from '@/lib/currency';
import { tenantHeaders } from '@/lib/tenant';

type CategoryFilter = MenuCategory | 'ALL';
type LookupMode = 'PHONE' | 'ORDER';
type MobilePanel = 'MENU' | 'CART' | 'SUMMARY';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
  sizeLabel?: string;
  unitPrice: number;
  addedAt: number;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const statusClasses: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-slate-200 text-slate-800',
  [OrderStatus.PAID]: 'bg-emerald-100 text-emerald-800',
  [OrderStatus.PENDING_APPROVAL]: 'bg-amber-100 text-amber-800',
  [OrderStatus.APPROVED]: 'bg-teal-100 text-teal-800',
  [OrderStatus.REJECTED]: 'bg-rose-100 text-rose-800',
  [OrderStatus.WAITING]: 'bg-blue-100 text-blue-800',
  [OrderStatus.COOKING]: 'bg-sky-100 text-sky-800',
  [OrderStatus.COMPLETED]: 'bg-emerald-200 text-emerald-900',
  [OrderStatus.CANCELLED]: 'bg-slate-300 text-slate-800',
};

const paymentClasses: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'bg-slate-200 text-slate-800',
  [PaymentStatus.PARTIAL]: 'bg-amber-100 text-amber-800',
  [PaymentStatus.PAID]: 'bg-emerald-200 text-emerald-900',
  [PaymentStatus.FAILED]: 'bg-rose-100 text-rose-800',
};

const categoryLabel = (category: string) => {
  const map: Record<string, string> = {
    ALL: 'All',
    DRINKS: 'Drinks',
    MAIN_FOODS: 'Mains',
    SNACKS: 'Snacks',
    CABINET_FOOD: 'Cabinet',
    CAKES: 'Cakes',
    GIFTS: 'Gifts',
  };
  return map[category] || category.replace(/_/g, ' ');
};

const getStatusLabel = (status?: string) =>
  status ? status.replace(/_/g, ' ') : '';

export default function PosPage() {
  const { user, isLoading, logout } = useAuth();
  const { isConnected } = useSocket();
  const router = useRouter();
  const baseMediaUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000',
    [],
  );

  const [businessName, setBusinessName] = useState('BrewPoint');
  const [businessLocation, setBusinessLocation] = useState<string | null>(null);
  const [currency, setCurrency] = useState('IDR');
  const [orderApprovalMode, setOrderApprovalMode] = useState<'DIRECT' | 'REQUIRES_APPROVAL' | string>('DIRECT');
  const [taxRate, setTaxRate] = useState(0);
  const [enableCabinetFoods, setEnableCabinetFoods] = useState(true);

  const [menuCategories, setMenuCategories] = useState<string[]>(['ALL']);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('MENU');

  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [showTableModal, setShowTableModal] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNote, setOrderNote] = useState('');
  const [serviceMode, setServiceMode] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteTarget, setNoteTarget] = useState<{
    menuItemId: string;
    sizeLabel?: string;
  } | null>(null);

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [lookupMode, setLookupMode] = useState<LookupMode>('PHONE');
  const [lookupValue, setLookupValue] = useState('');
  const [lookupResults, setLookupResults] = useState<Order[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [orderAction, setOrderAction] = useState<string | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const mobilePanels: { id: MobilePanel; label: string }[] = [
    { id: 'MENU', label: 'Menu' },
    { id: 'CART', label: 'Cart' },
    { id: 'SUMMARY', label: 'Summary' },
  ];

  const customerPanelTotal = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const taxAmount = taxRate > 0 ? (subtotal * taxRate) / 100 : 0;
    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    };
  }, [cart, taxRate]);
  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) || null,
    [tables, selectedTableId],
  );

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === UserRole.KITCHEN) {
        router.push('/dashboard/kitchen');
      } else if (![UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF].includes(user.role)) {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    loadSettings();
    loadCategories();
    loadMenu();
    loadTables();
  }, [user]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (user) {
        loadMenu();
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [selectedCategory, menuSearch, enableCabinetFoods]);

  const pushToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const loadSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/settings`, {
        method: 'GET',
        headers: tenantHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setBusinessName(data.businessName || 'BrewPoint');
        setBusinessLocation(data.businessAddress || null);
        setCurrency(data.currency || 'IDR');
        setOrderApprovalMode(data.orderApprovalMode || 'DIRECT');
        setEnableCabinetFoods(data.enableCabinetFoods ?? true);
        setTaxRate(Number(data.taxRate) || 0);
      }
    } catch (error) {
      pushToast('Could not load settings', 'error');
    }
  };

  const loadCategories = async () => {
    try {
      const categories = await menuService.getCategories();
      setMenuCategories(['ALL', ...categories]);
    } catch (error) {
      pushToast('Failed to load categories', 'error');
    }
  };

  const loadMenu = async () => {
    try {
      setMenuLoading(true);
      const categoryFilter = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const searchTerm = menuSearch.trim() || undefined;
      const items = await menuService.getItems(categoryFilter as MenuCategory | undefined, searchTerm, true);
      const filtered = enableCabinetFoods
        ? items
        : items.filter(
            (item) => !['CABINET_FOOD', 'CAKES', 'GIFTS', 'DRINKS'].includes(item.category),
          );
      setMenuItems(filtered);
    } catch (error) {
      pushToast('Failed to load menu items', 'error');
    } finally {
      setMenuLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      const data = await tablesService.getAll();
      setTables(data.filter((table) => table.isActive !== false));
    } catch (error) {
      // Tables are optional in POS
      console.warn('Tables not available', error);
    }
  };

  const resolveMenuPrice = (menuItem: MenuItem, sizeLabel?: string) => {
    if (sizeLabel && menuItem.sizes) {
      const sized = menuItem.sizes.find((s) => s.label === sizeLabel)?.price;
      if (sized !== undefined && sized !== null) {
        return Number(sized);
      }
    }
    const base = menuItem.price ?? menuItem.sizes?.[0]?.price ?? 0;
    return Number(base);
  };

  const addToCart = (menuItem: MenuItem, sizeLabel?: string) => {
    const unitPrice = resolveMenuPrice(menuItem, sizeLabel);

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.menuItem.id === menuItem.id && item.sizeLabel === sizeLabel,
      );
      if (existing) {
        return prev
          .map((item) =>
            item.menuItem.id === menuItem.id && item.sizeLabel === sizeLabel
              ? { ...item, quantity: item.quantity + 1, addedAt: Date.now(), unitPrice }
              : item,
          )
          .sort((a, b) => b.addedAt - a.addedAt);
      }
      return [
        { menuItem, quantity: 1, notes: '', sizeLabel, unitPrice, addedAt: Date.now() },
        ...prev,
      ];
    });
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobilePanel('CART');
    }
  };

  const updateQuantity = (menuItemId: string, quantity: number, sizeLabel?: string) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => !(item.menuItem.id === menuItemId && item.sizeLabel === sizeLabel));
      }
      return prev.map((item) =>
        item.menuItem.id === menuItemId && item.sizeLabel === sizeLabel
          ? { ...item, quantity }
          : item,
      );
    });
  };

  const updateNotes = (menuItemId: string, notes: string, sizeLabel?: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId && item.sizeLabel === sizeLabel
          ? { ...item, notes }
          : item,
      ),
    );
  };

  const openNoteModal = (item: CartItem) => {
    setNoteDraft(item.notes || '');
    setNoteTarget({ menuItemId: item.menuItem.id, sizeLabel: item.sizeLabel });
    setShowNoteModal(true);
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setNoteTarget(null);
    setNoteDraft('');
  };

  const saveNoteModal = () => {
    if (!noteTarget) {
      closeNoteModal();
      return;
    }
    updateNotes(noteTarget.menuItemId, noteDraft.trim(), noteTarget.sizeLabel);
    closeNoteModal();
  };

  const clearCart = () => {
    setCart([]);
    setOrderNote('');
    setCustomerName('');
    setCustomerPhone('');
    setSelectedTableId('');
    setServiceMode('DINE_IN');
    setShowTableModal(false);
  };

  const handleServiceModeChange = (mode: 'DINE_IN' | 'TAKEAWAY') => {
    if (mode === serviceMode) {
      if (mode === 'DINE_IN') {
        setShowTableModal(true);
      }
      return;
    }
    setServiceMode(mode);
    if (mode === 'TAKEAWAY') {
      setSelectedTableId('');
      setShowTableModal(false);
      return;
    }
    setShowTableModal(true);
  };

  const handleTableSelect = (tableId: string) => {
    setSelectedTableId(tableId);
    setShowTableModal(false);
  };

  const handleCreateOrder = async () => {
    if (submitting) return;
    if (cart.length === 0) {
      pushToast('Add at least one item to the cart', 'error');
      return;
    }
    if (!customerPhone.trim()) {
      pushToast('Enter a phone number to attach the customer', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim() || 'Walk-in customer',
        customerPhone: customerPhone.trim(),
        language: 'ENGLISH' as const,
        tableId: selectedTableId || undefined,
        notes:
          serviceMode === 'TAKEAWAY'
            ? `[TAKEAWAY] ${orderNote || ''}`.trim()
            : orderNote || undefined,
        items: cart.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes || undefined,
          sizeLabel: item.sizeLabel,
        })),
      };

      const order = await ordersService.create(payload);
      setActiveOrder(order);
      clearCart();
      pushToast(`Order ${order.orderNumber} created`, 'success');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create order';
      pushToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupSearch = async () => {
    if (!lookupValue.trim()) {
      setLookupError('Enter a phone number or order number');
      return;
    }
    setLookupLoading(true);
    setLookupError('');
    try {
      const results = await ordersService.search(
        lookupMode === 'PHONE'
          ? { phone: lookupValue.trim() }
          : { orderNumber: lookupValue.trim() },
      );
      setLookupResults(results);
      if (results.length === 0) {
        setLookupError(
          lookupMode === 'PHONE'
            ? 'No orders found for that phone number'
            : 'Order not found',
        );
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Lookup failed';
      setLookupError(message);
      pushToast(message, 'error');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSelectOrder = async (order: Order) => {
    try {
      const hydrated = await ordersService.getById(order.id);
      setActiveOrder(hydrated);
      setCustomerName(hydrated.customerName);
      setCustomerPhone(hydrated.customerPhone);
      setSelectedTableId(hydrated.tableId || '');
      setOrderNote(hydrated.notes || '');
      setCart([]);
      pushToast('Order loaded', 'success');
    } catch (error: any) {
      pushToast('Failed to load order', 'error');
    }
  };

  const handleApproveOrder = async () => {
    if (!activeOrder) return;
    setOrderAction('approve');
    try {
      const updated = await ordersService.approve(activeOrder.id);
      setActiveOrder(updated);
      setLookupResults((prev) =>
        prev.map((order) => (order.id === updated.id ? updated : order)),
      );
      pushToast('Order approved', 'success');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to approve order';
      pushToast(message, 'error');
    } finally {
      setOrderAction(null);
    }
  };

  const handleSendToKitchen = async () => {
    if (!activeOrder) return;
    setOrderAction('send');
    try {
      const updated = await ordersService.updateStatus(activeOrder.id, OrderStatus.WAITING);
      setActiveOrder(updated);
      setLookupResults((prev) =>
        prev.map((order) => (order.id === updated.id ? updated : order)),
      );
      pushToast('Sent to kitchen', 'success');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to send to kitchen';
      pushToast(message, 'error');
    } finally {
      setOrderAction(null);
    }
  };

  const handleCompleteOrder = async () => {
    if (!activeOrder) return;
    setOrderAction('complete');
    try {
      const updated = await ordersService.updateStatus(activeOrder.id, OrderStatus.COMPLETED);
      setActiveOrder(updated);
      setLookupResults((prev) =>
        prev.map((order) => (order.id === updated.id ? updated : order)),
      );
      pushToast('Order marked completed', 'success');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to complete order';
      pushToast(message, 'error');
    } finally {
      setOrderAction(null);
    }
  };

  const handleMarkPaid = async () => {
    if (!activeOrder) return;
    setOrderAction('paid');
    try {
      const updated = await ordersService.markAsPaid(activeOrder.id);
      setActiveOrder(updated);
      setLookupResults((prev) =>
        prev.map((order) => (order.id === updated.id ? updated : order)),
      );
      pushToast('Payment recorded', 'success');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to mark as paid';
      pushToast(message, 'error');
    } finally {
      setOrderAction(null);
    }
  };

  const canApprove = activeOrder?.status === OrderStatus.PENDING_APPROVAL;
  const canSendToKitchen =
    activeOrder &&
    [OrderStatus.APPROVED, OrderStatus.PAID, OrderStatus.PENDING].includes(activeOrder.status);
  const canComplete =
    activeOrder && [OrderStatus.WAITING, OrderStatus.COOKING].includes(activeOrder.status);
  const canMarkPaid =
    activeOrder &&
    activeOrder.paymentStatus !== PaymentStatus.PAID &&
    ![OrderStatus.CANCELLED, OrderStatus.REJECTED].includes(activeOrder.status);

  const isCreatingNew = !activeOrder;

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center text-slate-200">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-slate-700 border-t-sky-500" />
          <p className="text-sm tracking-wide text-slate-400">Loading POS…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-xl font-bold text-white shadow-lg shadow-sky-500/30">
                POS
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  {businessLocation ? `${businessName} · ${businessLocation}` : businessName}
                </p>
                <p className="text-lg font-semibold text-white">Touchscreen Order Console</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300">Signed in as</span>
              <span className="rounded-full bg-slate-800/80 px-3 py-1 text-sm font-semibold text-white">
                {user.fullName}
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  isConnected ? 'bg-emerald-500/20 text-emerald-100' : 'bg-rose-500/20 text-rose-100'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-300' : 'bg-rose-300'}`}
                />
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-3">
            <button
              onClick={() => {
                setActiveOrder(null);
                clearCart();
                setMobilePanel('MENU');
              }}
              className="min-h-[48px] rounded-xl bg-slate-800/70 px-4 text-sm font-semibold text-white shadow-inner shadow-black/40 transition hover:bg-slate-700/80"
            >
              New Order
            </button>
            <button
              onClick={() => router.push('/dashboard/orders')}
              className="min-h-[48px] rounded-xl bg-slate-800/70 px-4 text-sm font-semibold text-white shadow-inner shadow-black/40 transition hover:bg-slate-700/80"
            >
              Open Orders
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="min-h-[48px] rounded-xl bg-sky-400 px-4 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/30 transition hover:scale-[1.01]"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="min-h-[48px] rounded-xl border border-slate-600/70 px-4 text-sm font-semibold text-white transition hover:border-slate-300"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="mb-4 flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-900/70 p-1 lg:hidden">
          {mobilePanels.map((panel) => (
            <button
              key={panel.id}
              onClick={() => setMobilePanel(panel.id)}
              aria-pressed={mobilePanel === panel.id}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                mobilePanel === panel.id
                  ? 'bg-sky-400 text-slate-900 shadow shadow-sky-500/30'
                  : 'text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              {panel.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          {/* Categories + Lookup */}
          <section className={`lg:col-span-3 ${mobilePanel === 'MENU' ? 'block' : 'hidden lg:block'}`}>
            <div className="flex h-full flex-col gap-4">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Categories</p>
                <div className="mt-3 flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
                  {menuCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as CategoryFilter)}
                      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                        selectedCategory === cat
                          ? 'bg-sky-400 text-slate-900 shadow-lg shadow-sky-500/30'
                          : 'bg-slate-800/70 text-slate-200 hover:bg-slate-800/90'
                      }`}
                    >
                      {categoryLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Customer Lookup</p>
                    <h3 className="text-lg font-semibold text-white">QR & Phone Orders</h3>
                  </div>
                  <div className="flex rounded-full bg-slate-800/70 p-1">
                    {(['PHONE', 'ORDER'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setLookupMode(mode)}
                        className={`min-w-[96px] rounded-full px-3 py-2 text-xs font-semibold ${
                          lookupMode === mode
                            ? 'bg-sky-400 text-slate-900 shadow-lg shadow-sky-500/20'
                            : 'text-white'
                        }`}
                      >
                        {mode === 'PHONE' ? 'Phone' : 'Order #'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={lookupValue}
                    onChange={(e) => setLookupValue(e.target.value)}
                    placeholder={lookupMode === 'PHONE' ? 'Phone number' : 'Order number'}
                    className="w-full rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                  />
                  <button
                    onClick={handleLookupSearch}
                    disabled={lookupLoading}
                    className="min-h-[48px] rounded-xl bg-sky-400 px-4 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/30 hover:scale-[1.01] disabled:opacity-60"
                  >
                    {lookupLoading ? 'Searching' : 'Search'}
                  </button>
                </div>
                {lookupError && <p className="mt-2 text-sm text-rose-200">{lookupError}</p>}
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                  {lookupResults.length === 0 && !lookupLoading && !lookupError && (
                    <p className="text-sm text-slate-300">No results yet.</p>
                  )}
                  {lookupResults.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => handleSelectOrder(order)}
                      className="w-full rounded-xl border border-slate-800/70 bg-slate-900/60 p-3 text-left transition hover:border-sky-400/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{order.orderNumber}</p>
                          <p className="text-xs text-slate-300">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                            · {formatCurrency(order.totalAmount, currency)}
                          </p>
                          <p className="text-xs text-slate-300">
                            {order.customerName} · {order.customerPhone}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[order.status]}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Menu / Products */}
          <section className={`lg:col-span-6 ${mobilePanel === 'MENU' ? 'block' : 'hidden lg:block'}`}>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur">
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z" />
                </svg>
                <input
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search menu items..."
                  className="w-full bg-transparent text-base text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {menuLoading ? (
                  <div className="col-span-full flex items-center justify-center py-10 text-slate-300">
                    Loading menu...
                  </div>
                ) : menuItems.length === 0 ? (
                  <div className="col-span-full rounded-xl border border-dashed border-slate-700/70 px-4 py-8 text-center text-slate-300">
                    No items match this filter.
                  </div>
                ) : (
                  menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="group relative flex min-h-[120px] flex-col overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/70 p-3 text-left shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-sky-400/60 hover:shadow-sky-500/20"
                    >
                      {item.imageUrl && (
                        <div className="absolute inset-0 opacity-10 transition duration-300 group-hover:opacity-20">
                          <img
                            src={`${baseMediaUrl}${item.imageUrl}`}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              {categoryLabel(item.category)}
                            </p>
                            <p className="text-lg font-semibold text-white">{item.name}</p>
                          </div>
                          <span className="rounded-full bg-slate-800/80 px-3 py-1 text-sm font-semibold text-white shadow-inner shadow-black/40">
                            {formatCurrency(resolveMenuPrice(item), currency)}
                          </span>
                        </div>
                        {item.sizes && item.sizes.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.sizes.map((size) => (
                              <span
                                key={size.label}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item, size.label);
                                }}
                                className="cursor-pointer rounded-full bg-slate-800/70 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800/90"
                              >
                                {size.label} · {formatCurrency(Number(size.price), currency)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Cart + Summary */}
          <section className={`lg:col-span-3 ${mobilePanel === 'MENU' ? 'hidden lg:block' : 'block'}`}>
            <div className={`${mobilePanel === 'CART' ? 'block' : 'hidden lg:block'}`}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur">
                {!isCreatingNew && activeOrder && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Loaded Order</p>
                      <h2 className="text-2xl font-semibold text-white">
                        {activeOrder.orderNumber}
                      </h2>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[activeOrder.status]}`}>
                      {getStatusLabel(activeOrder.status)}
                    </span>
                  </div>
                )}

                {isCreatingNew ? (
                  <>
                    <div className="space-y-3 overflow-auto rounded-xl bg-slate-900/50 p-3">
                      {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-300">
                        <span className="text-lg font-semibold">Cart is Empty</span>
                      </div>
                      ) : (
                        cart.map((item) => (
                          <div
                            key={`${item.menuItem.id}-${item.sizeLabel || 'default'}`}
                            className="flex items-start gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 p-3"
                          >
                            <div className="flex-1">
                              <p className="text-base font-semibold text-white">{item.menuItem.name}</p>
                              {item.sizeLabel && (
                                <p className="text-xs uppercase tracking-wide text-slate-300">
                                  {item.sizeLabel}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-slate-300">Note: {item.notes}</p>
                              )}
                              <p className="mt-1 text-sm text-slate-100">
                                {formatCurrency(item.unitPrice * item.quantity, currency)}
                              </p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1, item.sizeLabel)}
                                  className="h-10 w-10 rounded-xl bg-slate-800/80 text-xl font-bold text-white hover:bg-slate-700/80"
                                >
                                  –
                                </button>
                                <span className="min-w-[36px] text-center text-lg font-semibold text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1, item.sizeLabel)}
                                  className="h-10 w-10 rounded-xl bg-sky-500 text-xl font-bold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => openNoteModal(item)}
                                className="w-full rounded-lg bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800/90"
                              >
                                {item.notes ? 'Edit Notes' : 'Add Notes'}
                              </button>
                              <button
                                onClick={() => updateQuantity(item.menuItem.id, 0, item.sizeLabel)}
                                className="w-full rounded-lg bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/30"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="grid gap-3 rounded-xl bg-slate-900/50 p-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">Customer Name</label>
                        <input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                          placeholder="Walk-in"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-200">Phone Number</label>
                        <input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                          placeholder="0812..."
                        />
                      </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm text-slate-200">Dine in / Takeaway</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['DINE_IN', 'TAKEAWAY'] as const).map((mode) => (
                          <button
                              key={mode}
                              onClick={() => handleServiceModeChange(mode)}
                              className={`min-h-[44px] rounded-xl border px-3 py-2 text-sm font-semibold ${
                                serviceMode === mode
                                  ? 'border-sky-400 bg-sky-400/20 text-white'
                                  : 'border-slate-800/70 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80'
                              }`}
                            >
                            {mode === 'DINE_IN' ? 'Dine-In' : 'Takeaway'}
                          </button>
                        ))}
                      </div>
                      {serviceMode === 'DINE_IN' && selectedTable && (
                        <p className="mt-2 text-xs text-slate-300">
                          Table {selectedTable.tableNumber}
                        </p>
                      )}
                    </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-sm text-slate-200">Order Notes</label>
                        <textarea
                          value={orderNote}
                          onChange={(e) => setOrderNote(e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                          placeholder="Allergy, special request..."
                        />
                      </div>
                    </div>

                    <div className="lg:hidden">
                      <button
                        onClick={() => setMobilePanel('SUMMARY')}
                        className="w-full min-h-[48px] rounded-xl bg-sky-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
                      >
                        Review totals & submit
                      </button>
                    </div>
                  </>
                ) : (
                  activeOrder && (
                    <div className="flex flex-col gap-3">
                      <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Customer</p>
                            <p className="text-sm font-semibold text-white">{activeOrder.customerName}</p>
                            <p className="text-xs text-slate-300">{activeOrder.customerPhone}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Table</p>
                            <p className="text-sm font-semibold text-white">
                              {activeOrder.table ? `Table ${activeOrder.table.tableNumber}` : 'No table'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Payment</p>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentClasses[activeOrder.paymentStatus]}`}
                            >
                              {getStatusLabel(activeOrder.paymentStatus)}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Created</p>
                            <p className="text-sm text-slate-200">
                              {new Date(activeOrder.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {activeOrder.notes && (
                          <p className="mt-2 text-sm text-slate-200">Notes: {activeOrder.notes}</p>
                        )}
                      </div>

                      <div className="space-y-2 rounded-xl border border-slate-800/70 bg-slate-900/60 p-3">
                        {activeOrder.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {item.menuItem?.name || 'Item'}
                              </p>
                              <p className="text-xs text-slate-300">
                                {item.quantity} × {formatCurrency(item.unitPrice, currency)}
                                {item.sizeLabel ? ` · ${item.sizeLabel}` : ''}
                              </p>
                              {item.notes && <p className="text-xs text-slate-400">Note: {item.notes}</p>}
                            </div>
                            <p className="text-sm font-semibold text-slate-100">
                              {formatCurrency(item.subtotal, currency)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="lg:hidden">
                        <button
                          onClick={() => setMobilePanel('SUMMARY')}
                          className="w-full min-h-[48px] rounded-xl bg-sky-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
                        >
                          View order actions
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className={`mt-4 ${mobilePanel === 'SUMMARY' ? 'block' : 'hidden lg:block'}`}>
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Summary</p>
                <h3 className="text-lg font-semibold text-white">Totals</h3>
                <p className="mt-1 text-xs text-slate-300">
                  Workflow: {orderApprovalMode === 'REQUIRES_APPROVAL' ? 'Staff approval before kitchen' : 'Direct to kitchen'}
                </p>
                <div className="mt-3 space-y-2 rounded-xl bg-slate-900/60 p-3">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>Subtotal</span>
                    <span>
                      {isCreatingNew
                        ? formatCurrency(customerPanelTotal.subtotal, currency)
                        : formatCurrency(activeOrder?.totalAmount || 0, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>Tax</span>
                    <span>
                      {taxRate > 0
                        ? `${formatCurrency(customerPanelTotal.taxAmount, currency)} (${taxRate}%)`
                        : 'Included / N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold text-white">
                    <span>Total</span>
                    <span>
                      {isCreatingNew
                        ? formatCurrency(customerPanelTotal.total, currency)
                        : formatCurrency(activeOrder?.totalAmount || 0, currency)}
                    </span>
                  </div>
                </div>
                {isCreatingNew ? (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={handleCreateOrder}
                      disabled={submitting}
                      className="w-full min-h-[52px] rounded-xl bg-sky-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:opacity-60"
                    >
                      {submitting ? 'Submitting...' : 'Confirm / Accept Order'}
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="w-full min-h-[48px] rounded-xl border border-slate-700/70 bg-slate-900/60 text-sm font-semibold text-white hover:bg-slate-800/80"
                    >
                      Clear Cart
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {canApprove && (
                      <button
                        onClick={handleApproveOrder}
                        disabled={orderAction !== null}
                        className="w-full min-h-[52px] rounded-xl bg-emerald-500 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 disabled:opacity-60"
                      >
                        {orderAction === 'approve' ? 'Approving...' : 'Approve & Send'}
                      </button>
                    )}
                    {canSendToKitchen && (
                      <button
                        onClick={handleSendToKitchen}
                        disabled={orderAction !== null}
                        className="w-full min-h-[52px] rounded-xl bg-sky-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:opacity-60"
                      >
                        {orderAction === 'send' ? 'Sending...' : 'Send to Kitchen'}
                      </button>
                    )}
                    {canComplete && (
                      <button
                        onClick={handleCompleteOrder}
                        disabled={orderAction !== null}
                        className="w-full min-h-[52px] rounded-xl bg-sky-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-600 disabled:opacity-60"
                      >
                        {orderAction === 'complete' ? 'Updating...' : 'Mark Completed'}
                      </button>
                    )}
                    {canMarkPaid && (
                      <button
                        onClick={handleMarkPaid}
                        disabled={orderAction !== null}
                        className="w-full min-h-[52px] rounded-xl bg-amber-500 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 disabled:opacity-60"
                      >
                        {orderAction === 'paid' ? 'Updating...' : 'Mark Paid'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveOrder(null);
                        pushToast('Detached order', 'info');
                        setMobilePanel('MENU');
                      }}
                      className="w-full min-h-[48px] rounded-xl border border-slate-700/70 bg-slate-900/60 text-sm font-semibold text-white hover:bg-slate-800/80"
                    >
                      Close Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800/70 bg-slate-900 p-6 text-white shadow-2xl">
            <h4 className="text-lg font-semibold">Item notes</h4>
            <p className="mt-2 text-sm text-slate-300">
              Add special requests or prep instructions.
            </p>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={4}
              className="mt-4 w-full rounded-xl border border-slate-800/70 bg-slate-900/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              placeholder="No dairy, extra hot, cut in half..."
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={closeNoteModal}
                className="min-h-[48px] rounded-xl border border-slate-700/70 bg-slate-900/60 text-sm font-semibold text-white hover:bg-slate-800/80"
              >
                Cancel
              </button>
              <button
                onClick={saveNoteModal}
                className="min-h-[48px] rounded-xl bg-sky-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {showTableModal && serviceMode === 'DINE_IN' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800/70 bg-slate-900 p-6 text-white shadow-2xl">
            <h4 className="text-lg font-semibold">Select table</h4>
            <p className="mt-2 text-sm text-slate-300">
              Assign a table to this dine-in order.
            </p>
            {tables.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => handleTableSelect(table.id)}
                    className={`min-h-[48px] rounded-xl border px-3 py-2 text-sm font-semibold ${
                      selectedTableId === table.id
                        ? 'border-sky-400 bg-sky-400/20 text-white'
                        : 'border-slate-700/70 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    Table {table.tableNumber}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-300">No tables available.</p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTableSelect('')}
                className="min-h-[48px] rounded-xl border border-slate-700/70 bg-slate-900/60 text-sm font-semibold text-white hover:bg-slate-800/80"
              >
                No table
              </button>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="min-h-[48px] rounded-xl bg-sky-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800/70 bg-slate-900 p-6 text-white shadow-2xl">
            <h4 className="text-lg font-semibold">Clear cart?</h4>
            <p className="mt-2 text-sm text-slate-300">
              This removes all items and resets customer details.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="min-h-[48px] rounded-xl border border-slate-700/70 bg-slate-900/60 text-sm font-semibold text-white hover:bg-slate-800/80"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="min-h-[48px] rounded-xl bg-rose-500 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600"
              >
                Clear Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[260px] rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : toast.type === 'error'
                  ? 'bg-rose-500 text-white shadow-rose-500/30'
                  : 'bg-slate-800 text-white shadow-slate-900'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
