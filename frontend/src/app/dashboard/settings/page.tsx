'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { menuService } from '@/services/menu.service';
import { MenuItem } from '@/types';
import { tenantHeaders } from '@/lib/tenant';

interface Settings {
  id?: string;
  businessName: string;
  businessNameId?: string;
  businessAddress: string;
  businessPhone: string;
  businessWhatsApp?: string;
  businessEmail: string;
  logoUrl?: string;
  appIconUrl?: string;
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
  upsellItemIds: string[];
  staffModuleEnabled: boolean;
  payTypeOptionsEnabled: string[];
  defaultPayType: string;
  weekStartDay: string;
  shiftTimeGranularity: number;
  overlapRule: string;
  rosterVisibility: string;
}

interface WhatsAppSettings {
  enabled: boolean;
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  accessTokenMasked: string | null;
  webhookVerifyToken: string;
  defaultCountryCode: string;
}

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'business' | 'orders' | 'system' | 'users' | 'staff'>('business');
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
    upsellItemIds: [],
    staffModuleEnabled: true,
    payTypeOptionsEnabled: ['HOURLY', 'DAILY', 'SALARY'],
    defaultPayType: 'HOURLY',
    weekStartDay: 'MON',
    shiftTimeGranularity: 30,
    overlapRule: 'BLOCK',
    rosterVisibility: 'OWN',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [appIconPreview, setAppIconPreview] = useState<string | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>({
    enabled: false,
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
    accessTokenMasked: null,
    webhookVerifyToken: '',
    defaultCountryCode: '',
  });
  const [whatsappStatus, setWhatsappStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Test message from Della Cafe WhatsApp integration.');
  const restoreInputRef = useRef<HTMLInputElement | null>(null);
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [backupWarning, setBackupWarning] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupDownloadProgress, setBackupDownloadProgress] = useState<number | null>(null);
  const [backupRestoreProgress, setBackupRestoreProgress] = useState<number | null>(null);

  const MAX_BACKUP_BYTES = 50 * 1024 * 1024;
  const LARGE_BACKUP_BYTES = 25 * 1024 * 1024;

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }
    const precision = value >= 10 || index === 0 ? 0 : 1;
    return `${value.toFixed(precision)} ${units[index]}`;
  };

  const payTypeOptions = [
    { value: 'HOURLY', label: 'Hourly' },
    { value: 'DAILY', label: 'Daily' },
    { value: 'SALARY', label: 'Salary' },
  ];

  const togglePayType = (value: string) => {
    setSettings((prev) => {
      const current = prev.payTypeOptionsEnabled;
      const exists = current.includes(value);
      const next = exists ? current.filter((item) => item !== value) : [...current, value];
      if (next.length === 0) {
        return prev;
      }
      const nextDefault = next.includes(prev.defaultPayType) ? prev.defaultPayType : next[0];
      return { ...prev, payTypeOptionsEnabled: next, defaultPayType: nextDefault };
    });
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user && !['ADMIN', 'MANAGER'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user?.role === 'MANAGER') {
      setActiveTab('staff');
    }
  }, [user, isLoading]);

  useEffect(() => {
    // Load settings from API
    const fetchSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const response = await fetch(`${apiUrl}/settings`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            ...tenantHeaders(),
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
            appIconUrl: data.appIconUrl,
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
            upsellItemIds: data.upsellItemIds || [],
            staffModuleEnabled: data.staffModuleEnabled ?? settings.staffModuleEnabled,
            payTypeOptionsEnabled: data.payTypeOptionsEnabled ?? settings.payTypeOptionsEnabled,
            defaultPayType: data.defaultPayType ?? settings.defaultPayType,
            weekStartDay: data.weekStartDay ?? settings.weekStartDay,
            shiftTimeGranularity: data.shiftTimeGranularity ?? settings.shiftTimeGranularity,
            overlapRule: data.overlapRule ?? settings.overlapRule,
            rosterVisibility: data.rosterVisibility ?? settings.rosterVisibility,
          });
          if (data.logoUrl) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
            setLogoPreview(`${baseUrl}${data.logoUrl}`);
          }
          if (data.appIconUrl) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
            setAppIconPreview(`${baseUrl}${data.appIconUrl}`);
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

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const items = await menuService.getAll(undefined, true);
        setMenuItems(items);
      } catch (error) {
        console.error('Failed to load menu items for settings:', error);
      }
    };
    loadMenuItems();
  }, []);

  useEffect(() => {
    const fetchWhatsappSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const response = await fetch(`${apiUrl}/admin/whatsapp-settings`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            ...tenantHeaders(),
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWhatsappSettings((prev) => ({
            ...prev,
            enabled: data.enabled ?? false,
            phoneNumberId: data.phoneNumberId || '',
            businessAccountId: data.businessAccountId || '',
            webhookVerifyToken: data.webhookVerifyToken || '',
            defaultCountryCode: data.defaultCountryCode || '',
            accessTokenMasked: data.accessTokenMasked || null,
            accessToken: '',
          }));
        } else if (response.status !== 404) {
          console.error('Failed to fetch WhatsApp settings', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch WhatsApp settings:', error);
      }
    };

    fetchWhatsappSettings();
  }, []);

  const handleSave = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

      const staffSettingsPayload = {
        staffModuleEnabled: settings.staffModuleEnabled,
        payTypeOptionsEnabled: settings.payTypeOptionsEnabled,
        defaultPayType: settings.defaultPayType,
        weekStartDay: settings.weekStartDay,
        shiftTimeGranularity: settings.shiftTimeGranularity,
        overlapRule: settings.overlapRule,
        rosterVisibility: settings.rosterVisibility,
      };

      // Transform nested frontend structure to flat backend structure
      const backendData = {
        businessName: settings.businessName,
        businessNameId: settings.businessNameId,
        businessAddress: settings.businessAddress,
        businessPhone: settings.businessPhone,
        businessWhatsApp: settings.businessWhatsApp,
        businessEmail: settings.businessEmail,
        logoUrl: settings.logoUrl,
        appIconUrl: settings.appIconUrl,
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
        upsellItemIds: settings.upsellItemIds,
        ...staffSettingsPayload,
      };

      const endpoint = user?.role === 'MANAGER' ? 'settings/staff' : 'settings';
      const payload = user?.role === 'MANAGER' ? staffSettingsPayload : backendData;

      const response = await fetch(`${apiUrl}/${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          ...tenantHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      console.log('Uploading logo to:', `${apiUrl}/settings/upload-logo`);

      const response = await fetch(`${apiUrl}/settings/upload-logo`, {
        method: 'POST',
        credentials: 'include',
        headers: tenantHeaders(),
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

  const handleAppIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('appIcon', file);

    setIsUploading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      console.log('Uploading app icon to:', `${apiUrl}/settings/upload-app-icon`);

      const response = await fetch(`${apiUrl}/settings/upload-app-icon`, {
        method: 'POST',
        credentials: 'include',
        headers: tenantHeaders(),
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Upload success:', data);
        setSettings({ ...settings, appIconUrl: data.appIconUrl });
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
        setAppIconPreview(`${baseUrl}${data.appIconUrl}`);
        alert('App icon uploaded successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Upload failed:', errorData);
        alert(`Failed to upload app icon: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to upload app icon:', error);
      alert(`Failed to upload app icon: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      console.log('Uploading OG image to:', `${apiUrl}/settings/upload-og-image`);

      const response = await fetch(`${apiUrl}/settings/upload-og-image`, {
        method: 'POST',
        credentials: 'include',
        headers: tenantHeaders(),
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

  const handleWhatsappChange = (field: keyof WhatsAppSettings, value: any) => {
    setWhatsappSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWhatsappSave = async () => {
    setWhatsappStatus(null);
    setIsSavingWhatsapp(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const payload: Record<string, any> = {
        enabled: whatsappSettings.enabled,
        phoneNumberId: whatsappSettings.phoneNumberId || undefined,
        businessAccountId: whatsappSettings.businessAccountId || undefined,
        webhookVerifyToken: whatsappSettings.webhookVerifyToken || undefined,
        defaultCountryCode: whatsappSettings.defaultCountryCode || undefined,
      };
      if (whatsappSettings.accessToken) {
        payload.accessToken = whatsappSettings.accessToken;
      }
      const response = await fetch(`${apiUrl}/admin/whatsapp-settings`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...tenantHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setWhatsappSettings((prev) => ({
          ...prev,
          enabled: data.enabled ?? prev.enabled,
          phoneNumberId: data.phoneNumberId || '',
          businessAccountId: data.businessAccountId || '',
          webhookVerifyToken: data.webhookVerifyToken || '',
          defaultCountryCode: data.defaultCountryCode || '',
          accessTokenMasked: data.accessTokenMasked || null,
          accessToken: '',
        }));
        setWhatsappStatus({ type: 'success', message: 'WhatsApp settings saved successfully.' });
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save WhatsApp settings.' }));
        setWhatsappStatus({ type: 'error', message: errorData.message || 'Failed to save WhatsApp settings.' });
      }
    } catch (error) {
      console.error('Failed to save WhatsApp settings', error);
      setWhatsappStatus({ type: 'error', message: 'Failed to save WhatsApp settings.' });
    } finally {
      setIsSavingWhatsapp(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhone) {
      setWhatsappStatus({ type: 'error', message: 'Enter a phone number for the test message.' });
      return;
    }
    setWhatsappStatus(null);
    setIsSendingTest(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/admin/whatsapp-settings/test`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...tenantHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testPhone,
          message: testMessage || undefined,
        }),
      });
      if (response.ok) {
        setWhatsappStatus({ type: 'success', message: 'Test message sent successfully.' });
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send test message.' }));
        setWhatsappStatus({ type: 'error', message: errorData.message || 'Failed to send test message.' });
      }
    } catch (error) {
      console.error('Failed to send test WhatsApp message', error);
      setWhatsappStatus({ type: 'error', message: 'Failed to send test message.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleDownloadBackup = async () => {
    setBackupStatus(null);
    setBackupWarning(null);
    setBackupDownloadProgress(0);
    setIsBackingUp(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/admin/backup`, {
        method: 'GET',
        credentials: 'include',
        headers: tenantHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to download backup.' }));
        setBackupStatus({ type: 'error', message: errorData.message || 'Failed to download backup.' });
        return;
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      if (contentLength >= LARGE_BACKUP_BYTES) {
        setBackupWarning(`Large backup (${formatBytes(contentLength)}). Download may take a while.`);
      }

      const disposition = response.headers.get('content-disposition');
      const match = disposition?.match(/filename=\"?([^\";]+)\"?/);
      const filename = match?.[1] || 'cms-backup.json';

      let blob: Blob;
      if (response.body && contentLength) {
        const reader = response.body.getReader();
        const chunks: BlobPart[] = [];
        let received = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value as BlobPart);
            received += value.length;
            setBackupDownloadProgress(Math.min(100, Math.round((received / contentLength) * 100)));
          }
        }
        blob = new Blob(chunks, { type: 'application/json' });
      } else {
        blob = await response.blob();
        setBackupDownloadProgress(100);
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setBackupStatus({ type: 'success', message: 'Backup downloaded successfully.' });
    } catch (error) {
      console.error('Failed to download backup:', error);
      setBackupStatus({ type: 'error', message: 'Failed to download backup.' });
    } finally {
      setIsBackingUp(false);
      setBackupDownloadProgress(null);
    }
  };

  const handleRestoreBackup = async (file: File) => {
    setBackupStatus(null);
    setBackupWarning(null);
    setBackupRestoreProgress(0);
    if (!window.confirm('Restoring from backup will overwrite your current data. Continue?')) {
      setBackupRestoreProgress(null);
      return;
    }

    if (file.size > MAX_BACKUP_BYTES) {
      setBackupStatus({ type: 'error', message: `Backup file exceeds ${formatBytes(MAX_BACKUP_BYTES)} limit.` });
      setBackupRestoreProgress(null);
      return;
    }

    if (file.size >= LARGE_BACKUP_BYTES) {
      setBackupWarning(`Large backup (${formatBytes(file.size)}). Restore may take a few minutes.`);
    }

    setIsRestoring(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const formData = new FormData();
      formData.append('backup', file);

      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${apiUrl}/admin/backup/restore`);
        xhr.withCredentials = true;
        const headers = tenantHeaders();
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setBackupRestoreProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setBackupStatus({ type: 'success', message: 'Backup restored. Refresh the app to see the changes.' });
          } else {
            const errorData = (() => {
              try {
                return JSON.parse(xhr.responseText);
              } catch {
                return { message: 'Failed to restore backup.' };
              }
            })();
            setBackupStatus({ type: 'error', message: errorData.message || 'Failed to restore backup.' });
          }
          resolve();
        };

        xhr.onerror = () => {
          setBackupStatus({ type: 'error', message: 'Failed to restore backup.' });
          resolve();
        };

        xhr.send(formData);
      });
    } catch (error) {
      console.error('Failed to restore backup:', error);
      setBackupStatus({ type: 'error', message: 'Failed to restore backup.' });
    } finally {
      setIsRestoring(false);
      setBackupRestoreProgress(null);
    }
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
            {user.role === 'ADMIN' && (
              <>
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
              </>
            )}
            {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
              <button
                onClick={() => setActiveTab('staff')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'staff'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Staff & Rostering</span>
                </div>
              </button>
            )}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* App Icon Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App Icon (PWA Splash)
                  </label>
                  <div className="mt-2">
                    {appIconPreview && (
                      <div className="mb-4">
                        <img
                          src={appIconPreview}
                          alt="App icon preview"
                          className="h-32 w-32 object-contain border border-gray-300 rounded-lg p-2"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAppIconUpload}
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
                      Recommended: 512x512px PNG with safe padding, max 5MB
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

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">WhatsApp Business Integration</h2>
                <label className="inline-flex items-center cursor-pointer">
                  <span className="mr-3 text-sm text-gray-600">Enable WhatsApp Messaging</span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={whatsappSettings.enabled}
                    onChange={(e) => handleWhatsappChange('enabled', e.target.checked)}
                  />
                  <div
                    className={`w-11 h-6 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${
                      whatsappSettings.enabled ? 'bg-green-500' : ''
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                        whatsappSettings.enabled ? 'translate-x-5' : ''
                      }`}
                    ></div>
                  </div>
                </label>
              </div>

              {whatsappStatus && (
                <div
                  className={`mb-4 rounded-lg px-4 py-3 text-sm ${
                    whatsappStatus.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {whatsappStatus.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={whatsappSettings.phoneNumberId}
                    onChange={(e) => handleWhatsappChange('phoneNumberId', e.target.value)}
                    disabled={!whatsappSettings.enabled}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter WhatsApp Phone Number ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Account ID
                  </label>
                  <input
                    type="text"
                    value={whatsappSettings.businessAccountId}
                    onChange={(e) => handleWhatsappChange('businessAccountId', e.target.value)}
                    disabled={!whatsappSettings.enabled}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter Business Account ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={whatsappSettings.accessToken}
                    onChange={(e) => handleWhatsappChange('accessToken', e.target.value)}
                    disabled={!whatsappSettings.enabled}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter WhatsApp access token"
                  />
                  {whatsappSettings.accessTokenMasked && (
                    <p className="mt-1 text-xs text-gray-500">
                      Current token: {whatsappSettings.accessTokenMasked}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Verify Token
                  </label>
                  <input
                    type="text"
                    value={whatsappSettings.webhookVerifyToken}
                    onChange={(e) => handleWhatsappChange('webhookVerifyToken', e.target.value)}
                    disabled={!whatsappSettings.enabled}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Used for WhatsApp webhook verification"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Country Code
                  </label>
                  <input
                    type="text"
                    value={whatsappSettings.defaultCountryCode}
                    onChange={(e) => handleWhatsappChange('defaultCountryCode', e.target.value)}
                    disabled={!whatsappSettings.enabled}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="+62"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Used when sending to numbers without a country prefix.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  onClick={handleWhatsappSave}
                  disabled={isSavingWhatsapp}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingWhatsapp ? 'Saving...' : 'Save WhatsApp Settings'}
                </button>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-base font-semibold text-gray-900">Send Test Message</div>
                    <p className="text-sm text-gray-500">
                      Confirm the integration works before going live.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Phone Number
                    </label>
                    <input
                      type="tel"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      disabled={!whatsappSettings.enabled}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="+628123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      rows={3}
                      disabled={!whatsappSettings.enabled}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleSendTestMessage}
                    disabled={!whatsappSettings.enabled || isSendingTest}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingTest ? 'Sending...' : 'Send Test Message'}
                  </button>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Upsell Items</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select menu items to always feature in the cart upsell strip. Cabinet foods and drinks are included automatically.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
                {menuItems.map((item) => {
                  const checked = settings.upsellItemIds.includes(item.id);
                  return (
                    <label key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:border-indigo-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? settings.upsellItemIds.filter((id) => id !== item.id)
                            : [...settings.upsellItemIds, item.id];
                          setSettings({ ...settings, upsellItemIds: next });
                        }}
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.category}</div>
                      </div>
                    </label>
                  );
                })}
                {menuItems.length === 0 && (
                  <div className="text-sm text-gray-500">No menu items loaded.</div>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Backup & Restore</h2>
              <p className="text-sm text-gray-600">
                Download a full backup (business info, menu data, images, orders, and users) and restore it on a new PC.
              </p>

              {backupStatus && (
                <div
                  className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                    backupStatus.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {backupStatus.message}
                </div>
              )}

              {backupWarning && (
                <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {backupWarning}
                </div>
              )}

              {backupDownloadProgress !== null && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Downloading backup</span>
                    <span>{backupDownloadProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${backupDownloadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {backupRestoreProgress !== null && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Uploading backup</span>
                    <span>{backupRestoreProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-amber-500 transition-all"
                      style={{ width: `${backupRestoreProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadBackup}
                  disabled={isBackingUp}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBackingUp ? 'Preparing Backup...' : 'Download Backup'}
                </button>
                <button
                  onClick={() => restoreInputRef.current?.click()}
                  disabled={isRestoring}
                  className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRestoring ? 'Restoring...' : 'Restore Backup'}
                </button>
                <input
                  ref={restoreInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleRestoreBackup(file);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Restoring replaces the current data for this business. Max file size: {formatBytes(MAX_BACKUP_BYTES)}.
              </p>
            </div>
          </div>
        )}

        {/* Staff & Rostering Tab */}
        {activeTab === 'staff' && (user.role === 'ADMIN' || user.role === 'MANAGER') && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Module</h2>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.staffModuleEnabled}
                  onChange={(e) => setSettings({ ...settings, staffModuleEnabled: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Enable staff management & rostering</label>
              </div>
              <p className="text-sm text-gray-500 ml-6 mt-2">
                Disable this module to hide staff and roster tools across the system.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pay Types</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {payTypeOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={settings.payTypeOptionsEnabled.includes(option.value)}
                      onChange={() => togglePayType(option.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Pay Type
                </label>
                <select
                  value={settings.defaultPayType}
                  onChange={(e) => setSettings({ ...settings, defaultPayType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {payTypeOptions
                    .filter((option) => settings.payTypeOptionsEnabled.includes(option.value))
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Roster Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Week Start Day</label>
                  <select
                    value={settings.weekStartDay}
                    onChange={(e) => setSettings({ ...settings, weekStartDay: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="MON">Monday</option>
                    <option value="SUN">Sunday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Time Granularity
                  </label>
                  <select
                    value={settings.shiftTimeGranularity}
                    onChange={(e) => setSettings({ ...settings, shiftTimeGranularity: parseInt(e.target.value, 10) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overlap Rule</label>
                  <select
                    value={settings.overlapRule}
                    onChange={(e) => setSettings({ ...settings, overlapRule: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ALLOW">Allow overlap</option>
                    <option value="WARN">Warn only</option>
                    <option value="BLOCK">Block overlap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roster Visibility</label>
                  <select
                    value={settings.rosterVisibility}
                    onChange={(e) => setSettings({ ...settings, rosterVisibility: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="OWN">Only their own shifts</option>
                    <option value="ALL">All shifts</option>
                  </select>
                </div>
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
