import { useEffect, useState } from 'react';
import { adminGetAllCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../services/adminService';
import type { CreateCategoryPayload, UpdateCategoryPayload } from '../services/adminService';
import { useToast } from '../components/Toast';
import type { Category } from '../types';
import {
  FolderOpen, Plus, Pencil, Trash2, Loader2, X, Save, Eye, EyeOff, ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const empty: CreateCategoryPayload = { name: '', description: '', imageUrl: '', displayOrder: 0 };

const AdminCategories = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<(Category & { isActive?: boolean; displayOrder?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateCategoryPayload & { isActive?: boolean }>(empty);

  const fetchCategories = async () => {
    try {
      const data = await adminGetAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...empty });
    setShowForm(true);
  };

  const openEdit = (cat: Category & { isActive?: boolean; displayOrder?: number }) => {
    setEditId(cat._id);
    setForm({
      name: cat.name,
      description: cat.description || '',
      imageUrl: (cat as any).imageUrl || '',
      displayOrder: cat.displayOrder ?? 0,
      isActive: cat.isActive ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const payload: UpdateCategoryPayload = { ...form };
        await adminUpdateCategory(editId, payload);
        showToast('Category updated!', 'success');
      } else {
        await adminCreateCategory(form);
        showToast('Category created!', 'success');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ ...empty });
      await fetchCategories();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    try {
      await adminDeleteCategory(id);
      showToast('Category deleted', 'info');
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const handleToggleActive = async (cat: Category & { isActive?: boolean }) => {
    try {
      await adminUpdateCategory(cat._id, { isActive: !(cat.isActive ?? true) });
      showToast(`Category ${cat.isActive ? 'deactivated' : 'activated'}`, 'info');
      await fetchCategories();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Admin Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-brand" /> Manage Categories
          </h1>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark hover:bg-brand-dark text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-dark/20">
          <Plus className="h-4 w-4" /> New Category
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 animate-[fadeInUp_0.2s_ease]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Category' : 'Create Category'}</h2>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors"
                placeholder="e.g. Sri Lankan Curries" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="url" value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors"
                placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors resize-none"
                placeholder="Short description..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input type="number" value={form.displayOrder ?? 0} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors" />
            </div>
            {editId && (
              <div className="flex items-center gap-3 pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.isActive ?? true}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            )}
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-dark hover:bg-brand-dark text-white font-bold rounded-xl transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="h-14 w-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">No categories yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first category to organise recipes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3.5 font-semibold">#</th>
                  <th className="px-5 py-3.5 font-semibold">Name</th>
                  <th className="px-5 py-3.5 font-semibold">Slug</th>
                  <th className="px-5 py-3.5 font-semibold">Recipes</th>
                  <th className="px-5 py-3.5 font-semibold text-center">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((cat, idx) => (
                  <tr key={cat._id} className="hover:bg-brand-light/30 transition-colors">
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {(cat as any).imageUrl && (
                          <img src={(cat as any).imageUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                        )}
                        <span className="font-bold text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{cat.slug}</td>
                    <td className="px-5 py-3 font-medium text-gray-700">{(cat as any).recipeCount ?? '-'}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${(cat.isActive ?? true) ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {(cat.isActive ?? true) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleToggleActive(cat)} title={cat.isActive ? 'Deactivate' : 'Activate'}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          {(cat.isActive ?? true) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button onClick={() => openEdit(cat)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(cat._id, cat.name)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
