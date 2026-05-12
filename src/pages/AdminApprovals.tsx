import { useEffect, useState } from 'react';
import { getPendingInventory, reviewInventoryItem, bulkReviewInventory } from '../services/vendorService';
import type { VendorInventoryItem } from '../types';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';
import {
  CheckSquare, Loader2, ArrowLeft, RefreshCw, Check, X, MessageSquare
} from 'lucide-react';

const AdminApprovals = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<VendorInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await getPendingInventory();
      setItems(Array.isArray(data) ? data : []);
      setSelectedIds([]);
    } catch {
      showToast('Failed to load pending inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleReviewSingle = async (id: string, status: 'Approved' | 'Rejected') => {
    const notes = rejectNotes[id];
    if (status === 'Rejected' && (!notes || !notes.trim())) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    setUpdatingId(id);
    try {
      await reviewInventoryItem(id, { status, adminNotes: notes });
      showToast(`Item ${status.toLowerCase()} successfully`, 'success');
      setItems(prev => prev.filter(item => item._id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      setRejectNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[id];
        return newNotes;
      });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update item', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkReview = async (status: 'Approved' | 'Rejected') => {
    if (selectedIds.length === 0) return;
    
    // For bulk rejection, we need a single note or we enforce notes for all.
    // To keep it simple, we use a single prompt for bulk rejection reason
    let notes = '';
    if (status === 'Rejected') {
      const reason = prompt('Please provide a reason for bulk rejection:');
      if (reason === null) return; // cancelled
      if (!reason.trim()) {
        showToast('Please provide a reason for rejection', 'error');
        return;
      }
      notes = reason;
    }

    setUpdatingId('bulk');
    try {
      await bulkReviewInventory({ itemIds: selectedIds, status, adminNotes: notes });
      showToast(`Bulk ${status.toLowerCase()} successful`, 'success');
      fetchPending(); // refresh to get updated list
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to bulk update items', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-brand" /> Inventory Approvals
          </h1>
        </div>
        <button onClick={fetchPending} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-brand-light/20 border border-brand/20 rounded-xl p-4 mb-6 flex items-center justify-between animate-[fadeInUp_0.2s_ease]">
          <span className="text-sm font-bold text-brand-dark">
            {selectedIds.length} items selected
          </span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkReview('Approved')} disabled={updatingId === 'bulk'}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
              <Check className="h-4 w-4" /> Bulk Approve
            </button>
            <button onClick={() => handleBulkReview('Rejected')} disabled={updatingId === 'bulk'}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
              <X className="h-4 w-4" /> Bulk Reject
            </button>
          </div>
        </div>
      )}

      {/* Pending Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <CheckSquare className="h-14 w-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">No pending approvals</p>
            <p className="text-gray-400 text-sm mt-1">All vendor inventory submissions have been reviewed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3.5">
                    <input type="checkbox" 
                      checked={selectedIds.length === items.length && items.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-brand focus:ring-brand"
                    />
                  </th>
                  <th className="px-5 py-3.5 font-semibold">Vendor</th>
                  <th className="px-5 py-3.5 font-semibold">Ingredient</th>
                  <th className="px-5 py-3.5 font-semibold">Package Size</th>
                  <th className="px-5 py-3.5 font-semibold">Stock Qty</th>
                  <th className="px-5 py-3.5 font-semibold">Price</th>
                  <th className="px-5 py-3.5 font-semibold">Submitted</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => {
                  const isUpdating = updatingId === item._id;
                  const isSelected = selectedIds.includes(item._id);
                  const isReadyToCook = item.isReadyToCook;

                  return (
                    <tr key={item._id} className={`hover:bg-brand-light/30 transition-colors ${isSelected ? 'bg-brand-light/20' : ''}`}>
                      <td className="px-5 py-3">
                        <input type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item._id)}
                          className="rounded border-gray-300 text-brand focus:ring-brand"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{item.vendorId.name}</p>
                        <p className="text-xs text-gray-400">{item.vendorId.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-bold text-gray-900">{item.ingredientId.name}</p>
                        {isReadyToCook && <span className="inline-flex px-2 py-0.5 mt-1 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wide">Ready to Cook</span>}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-700">
                        {item.packageWeight} {item.unit}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-700">
                        {item.stockQuantity}
                      </td>
                      <td className="px-5 py-3 font-bold text-emerald-600">
                        Rs. {item.price.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">
                        {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : 'New'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleReviewSingle(item._id, 'Approved')} disabled={isUpdating}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded transition-colors disabled:opacity-50" title="Approve">
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleReviewSingle(item._id, 'Rejected')} disabled={isUpdating}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors disabled:opacity-50" title="Reject">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="relative w-full max-w-[200px]">
                            <MessageSquare className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder="Reason for rejection..." 
                              value={rejectNotes[item._id] || ''}
                              onChange={(e) => setRejectNotes({ ...rejectNotes, [item._id]: e.target.value })}
                              className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <p className="text-xs text-gray-400 mt-4 text-right">
        {items.length} item{items.length !== 1 ? 's' : ''} pending approval
      </p>
    </div>
  );
};

export default AdminApprovals;
