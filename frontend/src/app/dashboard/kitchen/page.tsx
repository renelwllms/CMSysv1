'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ordersService } from '@/services/orders.service';
import { Order, OrderStatus } from '@/types';

export default function KitchenDisplayPage() {
  const { user, isLoading } = useAuth();
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    loadOrders();
  }, []);

  // Socket.io real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for order created events
    socket.on('order:created', (newOrder: Order) => {
      console.log('New order received:', newOrder);
      loadOrders(); // Reload orders when new order is created
    });

    // Listen for order status changes
    socket.on('order:statusChanged', (updatedOrder: Order) => {
      console.log('Order status changed:', updatedOrder);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        ).filter(order =>
          order.status === OrderStatus.WAITING || order.status === OrderStatus.COOKING
        )
      );
    });

    // Listen for order payment updates
    socket.on('order:paymentUpdated', (updatedOrder: Order) => {
      console.log('Order payment updated:', updatedOrder);
      loadOrders(); // Reload to include newly paid orders
    });

    return () => {
      socket.off('order:created');
      socket.off('order:statusChanged');
      socket.off('order:paymentUpdated');
    };
  }, [socket]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getKitchenOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await ordersService.updateStatus(orderId, status);
      await loadOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  const getOrderColor = (order: Order) => {
    const minutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
    if (order.status === OrderStatus.COOKING) return 'bg-orange-100 border-orange-300';
    if (minutes > 30) return 'bg-red-100 border-red-300';
    if (minutes > 15) return 'bg-yellow-100 border-yellow-300';
    return 'bg-white border-gray-200';
  };

  const waitingOrders = orders.filter(o => o.status === OrderStatus.WAITING);
  const cookingOrders = orders.filter(o => o.status === OrderStatus.COOKING);

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white text-xl">Loading kitchen orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-800 text-white py-4 px-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-300 hover:text-white"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold">Kitchen Display</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-gray-400">Active Orders</div>
              <div className="text-4xl font-bold">{orders.length}</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-300">
                {isConnected ? 'Live Updates' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={loadOrders}
              className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium"
            >
              Refresh Now
            </button>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="text-center">
            <svg className="mx-auto h-24 w-24 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-2xl font-medium text-gray-300">No active orders</h3>
            <p className="mt-2 text-gray-500">All orders have been completed!</p>
          </div>
        </div>
      ) : (
        <div className="p-6">
          {/* Cooking Orders */}
          {cookingOrders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-orange-400 mb-4 flex items-center">
                <svg className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
                COOKING ({cookingOrders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cookingOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`border-4 rounded-xl p-6 shadow-lg ${getOrderColor(order)}`}
                  >
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-600 mt-1">{getTimeElapsed(order.createdAt)}</div>
                      </div>
                      {order.table && (
                        <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                          Table {order.table.tableNumber}
                        </div>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4 p-3 bg-white bg-opacity-50 rounded-lg">
                      <div className="font-semibold text-lg text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-700">{order.customerPhone}</div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 mb-4">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="bg-white bg-opacity-70 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-bold text-xl text-gray-900">{item.menuItem?.name}</div>
                              {item.notes && (
                                <div className="text-sm text-red-600 font-medium mt-1">
                                  Note: {item.notes}
                                </div>
                              )}
                            </div>
                            <div className="text-2xl font-bold text-indigo-600 ml-2">
                              ×{item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="mb-4 p-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
                        <div className="text-sm font-semibold text-gray-700">Special Notes:</div>
                        <div className="text-gray-900 font-medium">{order.notes}</div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleUpdateStatus(order.id, OrderStatus.COMPLETED)}
                      className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-lg transition-colors"
                    >
                      ✓ Mark as Completed
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Waiting Orders */}
          {waitingOrders.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center">
                <svg className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                WAITING TO COOK ({waitingOrders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {waitingOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`border-4 rounded-xl p-6 shadow-lg ${getOrderColor(order)}`}
                  >
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-600 mt-1">{getTimeElapsed(order.createdAt)}</div>
                      </div>
                      {order.table && (
                        <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                          Table {order.table.tableNumber}
                        </div>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4 p-3 bg-white bg-opacity-50 rounded-lg">
                      <div className="font-semibold text-lg text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-700">{order.customerPhone}</div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 mb-4">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="bg-white bg-opacity-70 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-bold text-xl text-gray-900">{item.menuItem?.name}</div>
                              {item.notes && (
                                <div className="text-sm text-red-600 font-medium mt-1">
                                  Note: {item.notes}
                                </div>
                              )}
                            </div>
                            <div className="text-2xl font-bold text-indigo-600 ml-2">
                              ×{item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="mb-4 p-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
                        <div className="text-sm font-semibold text-gray-700">Special Notes:</div>
                        <div className="text-gray-900 font-medium">{order.notes}</div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleUpdateStatus(order.id, OrderStatus.COOKING)}
                      className="w-full py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold text-lg transition-colors"
                    >
                      🔥 Start Cooking
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
