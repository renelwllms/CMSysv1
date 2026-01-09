'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function TenantsPage() {
  const { isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace('/dashboard');
    }
  }, [isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">Tenants are disabled</h1>
        <p className="mt-2 text-sm text-gray-600">
          Multi-tenant management is turned off for this deployment.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
