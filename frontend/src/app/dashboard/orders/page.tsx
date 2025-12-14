'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { ordersService } from '@/services/orders.service';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { formatCurrency } from '@/lib/currency';

function OrdersManagementPageContent() {
  const { user, isLoading } = useAuth();
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currency, setCurrency] = useState<string>('IDR');

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
    loadSettings();
    loadOrders();
    // Check if we have a customer query parameter
    const customerPhone = searchParams.get('customer');
    if (customerPhone) {
      setSearchTerm(customerPhone);
    }
  }, [searchParams]);

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
    filterOrders();
  }, [orders, selectedStatus, selectedPaymentStatus, searchTerm]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for order created events
    socket.on('order:created', (newOrder: Order) => {
      console.log('New order received:', newOrder);
      setOrders(prevOrders => [newOrder, ...prevOrders]);
    });

    // Listen for order status changes
    socket.on('order:statusChanged', (updatedOrder: Order) => {
      console.log('Order status changed:', updatedOrder);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      if (selectedOrder?.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      }
    });

    // Listen for order payment updates
    socket.on('order:paymentUpdated', (updatedOrder: Order) => {
      console.log('Order payment updated:', updatedOrder);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      if (selectedOrder?.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      }
    });

    return () => {
      socket.off('order:created');
      socket.off('order:statusChanged');
      socket.off('order:paymentUpdated');
    };
  }, [socket, selectedOrder]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    if (selectedPaymentStatus !== 'ALL') {
      filtered = filtered.filter(order => order.paymentStatus === selectedPaymentStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm)
      );
    }

    setFilteredOrders(filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await ordersService.updateStatus(orderId, status);
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        const updated = await ordersService.getById(orderId);
        setSelectedOrder(updated);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      await ordersService.markAsPaid(orderId);
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        const updated = await ordersService.getById(orderId);
        setSelectedOrder(updated);
      }
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      await ordersService.approve(orderId);
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        const updated = await ordersService.getById(orderId);
        setSelectedOrder(updated);
      }
    } catch (error) {
      console.error('Failed to approve order:', error);
      alert('Failed to approve order');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this order? This action cannot be undone.')) {
      return;
    }
    try {
      await ordersService.reject(orderId);
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        setShowDetails(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to reject order:', error);
      alert('Failed to reject order');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      [OrderStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [OrderStatus.PAID]: 'bg-blue-100 text-blue-800',
      [OrderStatus.PENDING_APPROVAL]: 'bg-purple-100 text-purple-800',
      [OrderStatus.APPROVED]: 'bg-teal-100 text-teal-800',
      [OrderStatus.REJECTED]: 'bg-red-100 text-red-800',
      [OrderStatus.WAITING]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.COOKING]: 'bg-orange-100 text-orange-800',
      [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    const colors = {
      [PaymentStatus.PENDING]: 'bg-gray-100 text-gray-800',
      [PaymentStatus.PARTIAL]: 'bg-yellow-100 text-yellow-800',
      [PaymentStatus.PAID]: 'bg-green-100 text-green-800',
      [PaymentStatus.FAILED]: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Orders Management</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{user.fullName}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Order Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/orders/new')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Order</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Total Orders</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{orders.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Pending Payment</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">
              {orders.filter(o => o.paymentStatus === PaymentStatus.PENDING).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Active Orders</div>
            <div className="text-3xl font-bold text-orange-600 mt-2">
              {orders.filter(o => [OrderStatus.WAITING, OrderStatus.COOKING].includes(o.status)).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Completed Today</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {orders.filter(o => o.status === OrderStatus.COMPLETED &&
                new Date(o.createdAt).toDateString() === new Date().toDateString()).length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Status and Payment Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Status</option>
                <option value={OrderStatus.PENDING}>Pending</option>
                <option value={OrderStatus.PAID}>Paid</option>
                <option value={OrderStatus.PENDING_APPROVAL}>Pending Approval</option>
                <option value={OrderStatus.APPROVED}>Approved</option>
                <option value={OrderStatus.REJECTED}>Rejected</option>
                <option value={OrderStatus.WAITING}>Waiting</option>
                <option value={OrderStatus.COOKING}>Cooking</option>
                <option value={OrderStatus.COMPLETED}>Completed</option>
                <option value={OrderStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Payment Status</option>
                <option value={PaymentStatus.PENDING}>Pending</option>
                <option value={PaymentStatus.PARTIAL}>Partial</option>
                <option value={PaymentStatus.PAID}>Paid</option>
                <option value={PaymentStatus.FAILED}>Failed</option>
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by order number, customer name, or phone..."
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

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">No orders match your current filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderItems.length} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.totalAmount, currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetails(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                        {order.status === OrderStatus.PENDING_APPROVAL && (
                          <>
                            <button
                              onClick={() => handleApproveOrder(order.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectOrder(order.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {order.status !== OrderStatus.COMPLETED &&
                         order.status !== OrderStatus.CANCELLED &&
                         order.status !== OrderStatus.REJECTED &&
                         order.status !== OrderStatus.COOKING && (
                          <button
                            onClick={() => router.push(`/dashboard/orders/edit/${order.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                        )}
                        {order.paymentStatus !== PaymentStatus.PAID && (
                          <button
                            onClick={() => handleMarkAsPaid(order.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Order Info */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Order Number</div>
                  <div className="font-semibold">{selectedOrder.orderNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Date</div>
                  <div className="font-semibold">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Customer Name</div>
                  <div className="font-semibold">{selectedOrder.customerName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-semibold">{selectedOrder.customerPhone}</div>
                </div>
              </div>

              {selectedOrder.table && (
                <div>
                  <div className="text-sm text-gray-600">Table</div>
                  <div className="font-semibold">Table {selectedOrder.table.tableNumber}</div>
                </div>
              )}

              {selectedOrder.notes && (
                <div>
                  <div className="text-sm text-gray-600">Notes</div>
                  <div className="font-semibold">{selectedOrder.notes}</div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Order Items</h4>
              <div className="space-y-2">
                {selectedOrder.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{item.menuItem?.name || 'Unknown Item'}</div>
                      {item.sizeLabel && (
                        <div className="text-xs text-gray-600">Size: {item.sizeLabel}</div>
                      )}
                      <div className="text-sm text-gray-600">Qty: {item.quantity} × {formatCurrency(item.unitPrice, currency)}</div>
                      {item.notes && <div className="text-xs text-gray-500 mt-1">{item.notes}</div>}
                    </div>
                    <div className="font-semibold">{formatCurrency(item.subtotal, currency)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-indigo-600">{formatCurrency(selectedOrder.totalAmount, currency)}</span>
              </div>
            </div>

            {/* Status Update */}
            <div className="space-y-4">
              {selectedOrder.status === OrderStatus.PENDING_APPROVAL && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={() => handleApproveOrder(selectedOrder.id)}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Approve Order
                  </button>
                  <button
                    onClick={() => handleRejectOrder(selectedOrder.id)}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Reject Order
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Order Status</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={OrderStatus.PENDING}>Pending</option>
                  <option value={OrderStatus.PAID}>Paid</option>
                  <option value={OrderStatus.PENDING_APPROVAL}>Pending Approval</option>
                  <option value={OrderStatus.APPROVED}>Approved</option>
                  <option value={OrderStatus.REJECTED}>Rejected</option>
                  <option value={OrderStatus.WAITING}>Waiting</option>
                  <option value={OrderStatus.COOKING}>Cooking</option>
                  <option value={OrderStatus.COMPLETED}>Completed</option>
                  <option value={OrderStatus.CANCELLED}>Cancelled</option>
                </select>
              </div>

              {selectedOrder.paymentStatus !== PaymentStatus.PAID && (
                <button
                  onClick={() => handleMarkAsPaid(selectedOrder.id)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersManagementPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    }>
      <OrdersManagementPageContent />
    </Suspense>
  );
}
