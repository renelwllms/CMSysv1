'use client';

import { useState, useEffect } from 'react';
import { MenuItem, MenuCategory } from '@/types';
import { tenantHeaders } from '@/lib/tenant';
import { menuService } from '@/services/menu.service';

interface MenuItemFormProps {
  item?: MenuItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

type MenuItemFormState = {
  name: string;
  nameId: string;
  category: string;
  price: string;
  description: string;
  imageUrl: string;
  stockQty: string;
  isAvailable: boolean;
  sizes: { label: string; price: string }[];
};

const DEFAULT_CATEGORIES = Object.values(MenuCategory) as string[];

const normalizeCategory = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

const formatCategoryLabel = (value: string) =>
  value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const buildCategoryList = (incoming: string[], extra?: string) => {
  const merged = new Set<string>(DEFAULT_CATEGORIES);
  incoming.forEach((category) => {
    if (category) merged.add(category);
  });
  if (extra) merged.add(extra);
  const extras = Array.from(merged).filter((category) => !DEFAULT_CATEGORIES.includes(category)).sort();
  return [...DEFAULT_CATEGORIES, ...extras];
};

export default function MenuItemForm({ item, onClose, onSuccess }: MenuItemFormProps) {
  const [formData, setFormData] = useState<MenuItemFormState>({
    name: '',
    nameId: '',
    category: MenuCategory.DRINKS,
    price: '',
    description: '',
    imageUrl: '',
    stockQty: '',
    isAvailable: true,
    sizes: [] as { label: string; price: string }[],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState<string>('IDR');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    loadSettings();
    loadCategories();
    if (item) {
      setFormData({
        name: item.name,
        nameId: item.nameId || '',
        category: item.category,
        price: item.price.toString(),
        description: item.description || '',
        imageUrl: item.imageUrl || '',
        stockQty: item.stockQty?.toString() || '',
        isAvailable: item.isAvailable,
        sizes: (item.sizes || []).map((s) => ({ label: s.label, price: s.price.toString() })),
      });
      // Set existing image as preview
      if (item.imageUrl) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const baseUrl = apiUrl.replace('/api', '');
        setImagePreview(`${baseUrl}${item.imageUrl}`);
      }
    }
  }, [item]);

  const loadSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/settings`, { headers: tenantHeaders() });
      if (response.ok) {
        const data = await response.json();
        setCurrency(data.currency || 'IDR');
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await menuService.getCategories();
      setCategories(buildCategoryList(data, item?.category));
    } catch (err) {
      setCategories(buildCategoryList([], item?.category));
    }
  };

  const handleAddCategory = () => {
    const normalized = normalizeCategory(newCategoryName);
    if (!normalized) {
      setError('Please enter a category name.');
      return;
    }
    setError('');
    setCategories((prev) => buildCategoryList(prev, normalized));
    setFormData((prev) => ({ ...prev, category: normalized }));
    setNewCategoryName('');
    setAddingCategory(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanedSizes = formData.sizes
        .filter(s => s.label && s.price)
        .map(s => ({ label: s.label, price: Number(s.price) }));

      if (cleanedSizes.length === 0 && formData.price === '') {
        setError('Base price is required when no sizes are added.');
        setLoading(false);
        return;
      }

      if (formData.sizes.length > 0 && cleanedSizes.length === 0) {
        setError('Please provide both label and price for at least one size.');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.nameId) formDataToSend.append('nameId', formData.nameId);
      formDataToSend.append('category', formData.category);
      if (formData.price !== '') formDataToSend.append('price', formData.price);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.stockQty) formDataToSend.append('stockQty', formData.stockQty);
      formDataToSend.append('isAvailable', String(formData.isAvailable));
      if (cleanedSizes.length > 0) {
        formDataToSend.append('sizes', JSON.stringify(cleanedSizes));
      }

      // Append image file if selected
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      if (item) {
        await menuService.update(item.id, formDataToSend);
      } else {
        await menuService.create(formDataToSend);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (English) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Cappuccino"
            />
          </div>

          {/* Name (Indonesian) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name (Indonesian)
            </label>
            <input
              type="text"
              name="nameId"
              value={formData.nameId}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Kopi Cappuccino"
            />
          </div>

          {/* Category and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAddingCategory(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  + Add category
                </button>
              </div>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {formatCategoryLabel(category)}
                  </option>
                ))}
              </select>
              {addingCategory && (
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Iced Tea"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingCategory(false);
                        setNewCategoryName('');
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price ({currency})
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 3.50"
              />
              <p className="text-xs text-gray-500 mt-1">Used if no sizes are set.</p>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Sizes (optional)
              </label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  sizes: [...prev.sizes, { label: '', price: '' }],
                }))}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                + Add Size
              </button>
            </div>
            {formData.sizes.length === 0 && (
              <p className="text-xs text-gray-500">If sizes are added, customers must pick one and the price will come from the selected size.</p>
            )}
            <div className="space-y-2">
              {formData.sizes.map((size, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Label (e.g., Small)"
                    value={size.label}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => {
                        const sizes = [...prev.sizes];
                        sizes[idx] = { ...sizes[idx], label: value };
                        return { ...prev, sizes };
                      });
                    }}
                    className="col-span-2 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    value={size.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => {
                        const sizes = [...prev.sizes];
                        sizes[idx] = { ...sizes[idx], price: value };
                        return { ...prev, sizes };
                      });
                    }}
                    className="col-span-2 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      sizes: prev.sizes.filter((_, i) => i !== idx),
                    }))}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Brief description of the item..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Image
            </label>

            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Click the X button to remove and upload a different image
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stockQty"
              value={formData.stockQty}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Leave empty for unlimited stock"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty if stock is not tracked
            </p>
          </div>

          {/* Availability */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Item is available for ordering
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
