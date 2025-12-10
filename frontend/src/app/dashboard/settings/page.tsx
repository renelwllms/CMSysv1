'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Settings {
  id?: string;
  businessName: string;
  businessNameId?: string;
  businessAddress: string;
  businessPhone: string;
  businessWhatsApp?: string;
  businessEmail: string;
  logoUrl?: string;
  ogImageUrl?: string;
  themeColor?: string;
  currency: string;
  taxRate: number;
  serviceChargeRate: number;
  orderApprovalMode: string;
  autoClearUnapprovedMinutes: number;
  autoClearing: {
    enabled: boolean;
    normalOrderHours: number;
    cakeOrderDays: number;
  };
  downPayment: {
    cakePercentage: number;
  };
  enableCabinetFoods: boolean;
}

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'business' | 'orders' | 'system' | 'users'>('business');
  const [settings, setSettings] = useState<Settings>({
    businessName: 'My Cafe',
    businessAddress: '123 Main Street, City',
    businessPhone: '+1234567890',
    businessEmail: 'info@mycafe.com',
    currency: 'IDR',
    taxRate: 10,
    serviceChargeRate: 5,
    orderApprovalMode: 'DIRECT',
    autoClearUnapprovedMinutes: 30,
    autoClearing: {
      enabled: true,
      normalOrderHours: 1,
      cakeOrderDays: 2,
    },
    downPayment: {
      cakePercentage: 50,
    },
    enableCabinetFoods: true,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Load settings from API
    const fetchSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const response = await fetch(`${apiUrl}/settings`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Map flat backend structure to nested frontend structure
          setSettings({
            ...settings,
            businessName: data.businessName || settings.businessName,
            businessNameId: data.businessNameId,
            businessAddress: data.businessAddress || settings.businessAddress,
            businessPhone: data.businessPhone || settings.businessPhone,
            businessEmail: data.businessEmail || settings.businessEmail,
            logoUrl: data.logoUrl,
            ogImageUrl: data.ogImageUrl,
            themeColor: data.themeColor,
            currency: data.currency || settings.currency,
            taxRate: data.taxRate || settings.taxRate,
            serviceChargeRate: data.serviceChargeRate || settings.serviceChargeRate,
            orderApprovalMode: data.orderApprovalMode || settings.orderApprovalMode,
            autoClearUnapprovedMinutes: data.autoClearUnapprovedMinutes || settings.autoClearUnapprovedMinutes,
            autoClearing: {
              enabled: data.autoClearingEnabled ?? settings.autoClearing.enabled,
              normalOrderHours: data.normalOrderClearHours || settings.autoClearing.normalOrderHours,
              cakeOrderDays: data.cakeOrderClearDays || settings.autoClearing.cakeOrderDays,
            },
            downPayment: {
              cakePercentage: data.cakeDownPaymentPercentage || settings.downPayment.cakePercentage,
            },
            enableCabinetFoods: data.enableCabinetFoods ?? settings.enableCabinetFoods,
          });
          if (data.logoUrl) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
            setLogoPreview(`${baseUrl}${data.logoUrl}`);
          }
          if (data.ogImageUrl) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
            setOgImagePreview(`${baseUrl}${data.ogImageUrl}`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

      // Transform nested frontend structure to flat backend structure
      const backendData = {
        businessName: settings.businessName,
        businessNameId: settings.businessNameId,
        businessAddress: settings.businessAddress,
        businessPhone: settings.businessPhone,
        businessWhatsApp: settings.businessWhatsApp,
        businessEmail: settings.businessEmail,
        logoUrl: settings.logoUrl,
        ogImageUrl: settings.ogImageUrl,
        themeColor: settings.themeColor,
        currency: settings.currency,
        taxRate: settings.taxRate,
        serviceChargeRate: settings.serviceChargeRate,
        orderApprovalMode: settings.orderApprovalMode,
        autoClearUnapprovedMinutes: settings.autoClearUnapprovedMinutes,
        autoClearingEnabled: settings.autoClearing.enabled,
        normalOrderClearHours: settings.autoClearing.normalOrderHours,
        cakeOrderClearDays: settings.autoClearing.cakeOrderDays,
        cakeDownPaymentPercentage: settings.downPayment.cakePercentage,
        enableCabinetFoods: settings.enableCabinetFoods,
      };

      const response = await fetch(`${apiUrl}/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backendData),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        console.error('Failed to save settings:', errorData);
        alert(`Failed to save settings: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      console.log('Uploading logo to:', `${apiUrl}/settings/upload-logo`);

      const response = await fetch(`${apiUrl}/settings/upload-logo`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Upload success:', data);
        setSettings({ ...settings, logoUrl: data.logoUrl });
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
        setLogoPreview(`${baseUrl}${data.logoUrl}`);
        alert('Logo uploaded successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Upload failed:', errorData);
        alert(`Failed to upload logo: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert(`Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('ogImage', file);

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      console.log('Uploading OG image to:', `${apiUrl}/settings/upload-og-image`);

      const response = await fetch(`${apiUrl}/settings/upload-og-image`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Upload success:', data);
        setSettings({ ...settings, ogImageUrl: data.ogImageUrl });
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
        setOgImagePreview(`${baseUrl}${data.ogImageUrl}`);
        alert('Open Graph image uploaded successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Upload failed:', errorData);
        alert(`Failed to upload Open Graph image: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to upload Open Graph image:', error);
      alert(`Failed to upload Open Graph image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section as keyof Settings] === 'object' && !Array.isArray(prev[section as keyof Settings])
        ? { ...(prev[section as keyof Settings] as object), [field]: value }
        : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
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
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{user.fullName}</span>
              {saveSuccess && (
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium">Settings saved!</span>
                </div>
              )}
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('business')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'business'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Business Info</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Order Settings</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'system'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>System</span>
              </div>
            </button>
            {user.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>User Management</span>
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* Business Info Tab */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            {/* Branding */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Branding</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Logo
                  </label>
                  <div className="mt-2">
                    {logoPreview && (
                      <div className="mb-4">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-32 w-auto object-contain border border-gray-300 rounded-lg p-2"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Recommended: Square image, max 5MB
                    </p>
                  </div>
                </div>

                {/* Open Graph Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Open Graph Image
                  </label>
                  <div className="mt-2">
                    {ogImagePreview && (
                      <div className="mb-4">
                        <img
                          src={ogImagePreview}
                          alt="OG image preview"
                          className="h-32 w-auto object-contain border border-gray-300 rounded-lg p-2"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOgImageUpload}
                      disabled={isUploading}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      For social media sharing. Recommended: 1200x630px, max 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.businessPhone}
                    onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.businessEmail}
                    onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={settings.businessAddress}
                    onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Currency</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="IDR">Indonesian Rupiah (Rp)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="NZD">New Zealand Dollar (NZ$)</option>
                    <option value="AUD">Australian Dollar (A$)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="SGD">Singapore Dollar (S$)</option>
                    <option value="MYR">Malaysian Ringgit (RM)</option>
                    <option value="THB">Thai Baht (฿)</option>
                    <option value="JPY">Japanese Yen (¥)</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    This currency will be used throughout the system for pricing and revenue display
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Charges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-2 text-sm text-gray-500">Applied to all orders</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Charge (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.serviceChargeRate}
                    onChange={(e) => setSettings({ ...settings, serviceChargeRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-2 text-sm text-gray-500">Applied to dine-in orders</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Settings Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Approval Flow</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Flow to Kitchen
                  </label>
                  <select
                    value={settings.orderApprovalMode}
                    onChange={(e) => setSettings({ ...settings, orderApprovalMode: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="DIRECT">Direct to Kitchen - Orders appear immediately on kitchen display</option>
                    <option value="REQUIRES_APPROVAL">Requires Staff Approval - Orders must be verified by staff before appearing on kitchen display</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Choose whether customer orders go directly to the kitchen or require staff approval first
                  </p>
                </div>

                {settings.orderApprovalMode === 'REQUIRES_APPROVAL' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-clear Unapproved Orders After (Minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={settings.autoClearUnapprovedMinutes}
                      onChange={(e) => setSettings({ ...settings, autoClearUnapprovedMinutes: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Orders waiting for approval will be automatically cancelled after this many minutes. Default: 30 minutes
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Auto-Clear Unpaid Orders</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoClearing.enabled}
                    onChange={(e) => handleInputChange('autoClearing', 'enabled', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable automatic clearing of unpaid orders
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Normal Orders - Clear After (Hours)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={settings.autoClearing.normalOrderHours}
                      onChange={(e) => handleInputChange('autoClearing', 'normalOrderHours', parseFloat(e.target.value))}
                      disabled={!settings.autoClearing.enabled}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="mt-2 text-sm text-gray-500">Default: 1 hour</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cake Orders - Clear After (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settings.autoClearing.cakeOrderDays}
                      onChange={(e) => handleInputChange('autoClearing', 'cakeOrderDays', parseInt(e.target.value))}
                      disabled={!settings.autoClearing.enabled}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="mt-2 text-sm text-gray-500">Default: 2 working days</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Cake Order Down Payment</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Down Payment (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.downPayment.cakePercentage}
                  onChange={(e) => handleInputChange('downPayment', 'cakePercentage', parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Customers must pay this percentage when ordering cakes. Default: 50%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Cabinet Foods</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.enableCabinetFoods}
                    onChange={(e) => setSettings({ ...settings, enableCabinetFoods: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Cabinet Foods Section
                  </label>
                </div>
                <p className="text-sm text-gray-500 ml-6">
                  When enabled, customers can order items from the Cabinet Foods, Drinks, Cakes, and other cabinet categories.
                  Menu items with these categories will be available for ordering on the customer-facing ordering page.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">System Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">Version</div>
                    <div className="text-sm text-gray-500">Current system version</div>
                  </div>
                  <div className="text-sm font-mono text-gray-700">v1.0.0</div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">Database Status</div>
                    <div className="text-sm text-gray-500">Connection status</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700">Connected</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <div>
                    <div className="font-medium text-gray-900">Real-time Updates</div>
                    <div className="text-sm text-gray-500">WebSocket connection</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Maintenance</h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left flex items-center justify-between">
                  <div>
                    <div className="font-medium">Clear Cache</div>
                    <div className="text-sm text-gray-500">Clear application cache</div>
                  </div>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left flex items-center justify-between">
                  <div>
                    <div className="font-medium">Export Data</div>
                    <div className="text-sm text-gray-500">Download all system data</div>
                  </div>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-left flex items-center justify-between">
                  <div>
                    <div className="font-medium">Reset Settings</div>
                    <div className="text-sm text-red-600">Reset all settings to default</div>
                  </div>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && user.role === 'ADMIN' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Add New User
                </button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="mt-4">User management interface coming soon</p>
                <p className="text-sm mt-2">This feature will allow you to manage staff accounts</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
