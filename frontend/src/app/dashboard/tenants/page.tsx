'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { tenantService, Tenant } from '@/services/tenant.service';

export default function TenantsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    domain: '',
    customDomain: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadTenants();
    }
  }, [user]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantService.list();
      setTenants(data);
    } catch (error) {
      console.error('Failed to load tenants', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) return;
    try {
      setSubmitting(true);
      await tenantService.create({
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        domain: form.domain || undefined,
        customDomain: form.customDomain || undefined,
      });
      setForm({ name: '', slug: '', domain: '', customDomain: '' });
      await loadTenants();
    } catch (error: any) {
      console.error('Failed to create tenant', error);
      alert(error?.response?.data?.message || 'Failed to create tenant');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenants...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Tenants</h1>
            </div>
            <div className="text-sm text-gray-600">{user.fullName}</div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Create Tenant</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreate}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 lowercase"
                required
                placeholder="e.g. cafe-abc"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain (optional)</label>
              <input
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                placeholder="tenant.cms.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Domain (optional)</label>
              <input
                value={form.customDomain}
                onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                placeholder="orders.customer.com"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? 'Creating...' : 'Create Tenant'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Existing Tenants</h2>
            <span className="text-sm text-gray-500">{tenants.length} total</span>
          </div>
          {tenants.length === 0 ? (
            <div className="text-gray-500">No tenants found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custom Domain</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{tenant.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{tenant.slug}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{tenant.domain || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{tenant.customDomain || '-'}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {tenant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
