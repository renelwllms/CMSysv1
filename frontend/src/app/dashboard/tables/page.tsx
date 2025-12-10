'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { tablesService } from '@/services/tables.service';
import { Table } from '@/types';

export default function TablesManagementPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await tablesService.getAll();
      setTables(data.sort((a, b) =>
        parseInt(a.tableNumber) - parseInt(b.tableNumber)
      ));
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async () => {
    if (!newTableNumber.trim()) return;
    try {
      await tablesService.create({ tableNumber: newTableNumber });
      await loadTables();
      setShowAddModal(false);
      setNewTableNumber('');
    } catch (error) {
      console.error('Failed to create table:', error);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await tablesService.toggleActive(id);
      await loadTables();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  const handleRegenerateQR = async (id: string) => {
    try {
      await tablesService.regenerateQR(id);
      await loadTables();
    } catch (error) {
      console.error('Failed to regenerate QR:', error);
    }
  };

  const handleDownloadQR = async (table: Table) => {
    try {
      const blob = await tablesService.downloadQRCode(table.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `table-${table.tableNumber}-qr.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download QR:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tablesService.delete(id);
      await loadTables();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete table:', error);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tables...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Table Management</h1>
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
                Add Table
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Total Tables</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{tables.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Active Tables</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {tables.filter(t => t.isActive).length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">Inactive Tables</div>
            <div className="text-3xl font-bold text-gray-400 mt-2">
              {tables.filter(t => !t.isActive).length}
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        {tables.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tables</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new table.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map((table) => (
              <div
                key={table.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                {/* Table Number */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Table {table.tableNumber}</h3>
                  <button
                    onClick={() => handleToggleActive(table.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      table.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {table.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* QR Code Preview */}
                {table.qrCode && (
                  <div className="mb-4 flex justify-center">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/tables/${table.id}/qr-code`}
                        alt={`QR Code for Table ${table.tableNumber}`}
                        className="w-32 h-32"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedTable(table);
                      setShowQRModal(true);
                    }}
                    className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                  >
                    View QR Code
                  </button>
                  <button
                    onClick={() => handleDownloadQR(table)}
                    className="w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    Download QR
                  </button>
                  <button
                    onClick={() => handleRegenerateQR(table.id)}
                    className="w-full px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                  >
                    Regenerate QR
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(table.id)}
                    className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    Delete Table
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  Created: {new Date(table.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Table</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Number
              </label>
              <input
                type="text"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                placeholder="e.g., 1, 2, 3..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTable()}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTableNumber('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTable}
                disabled={!newTableNumber.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Table {selectedTable.tableNumber} QR Code
              </h3>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedTable(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedTable.qrCode && (
              <div className="flex flex-col items-center">
                <div className="bg-white p-8 rounded-lg border-4 border-gray-200">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/tables/${selectedTable.id}/qr-code`}
                    alt={`QR Code for Table ${selectedTable.tableNumber}`}
                    className="w-64 h-64"
                    onError={(e) => {
                      console.error('Failed to load QR code');
                    }}
                  />
                </div>
                <p className="mt-4 text-sm text-gray-600 text-center">
                  Scan this QR code to place an order for Table {selectedTable.tableNumber}
                </p>
                <button
                  onClick={() => handleDownloadQR(selectedTable)}
                  className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Download QR Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Table?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this table? This action cannot be undone.
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
    </div>
  );
}
