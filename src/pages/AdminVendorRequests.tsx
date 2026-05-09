import { useEffect, useState } from 'react';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';
import { Store, Loader2, RefreshCw, Plus, Clock, CheckCircle2, XCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { getRestockRequests, getVendors, createRestockRequest, updateRequestStatus } from '../services/vendorService';
import { getIngredients } from '../services/ingredientService';
import type { RestockRequest } from '../types';

const STATUSES = ['Pending', 'Accepted', 'Rejected', 'Fulfilled'] as const;

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  Pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  Accepted: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
  Rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  Fulfilled: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const AdminVendorRequests = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [vendors, setVendors] = useState<{ _id: string, name: string, email: string }[]>([]);
  const [allIngredients, setAllIngredients] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ vendorId: '', notes: '' });
  const [requestItems, setRequestItems] = useState<{ ingredientId: string, requestedQuantity: string, unit: string }[]>([
    { ingredientId: '', requestedQuantity: '', unit: '' }
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqData, vendorData, ingData] = await Promise.all([
        getRestockRequests(),
        getVendors(),
        getIngredients()
      ]);

      setRequests(reqData);
      setAllIngredients(ingData);
      setVendors(vendorData);

    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);


  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.vendorId) return showToast('Select a vendor', 'error');
    if (requestItems.some(i => !i.ingredientId || !i.requestedQuantity || !i.unit)) {
      return showToast('Please fill all item fields', 'error');
    }

    try {
      const payload = {
        vendorId: newRequest.vendorId,
        notes: newRequest.notes,
        items: requestItems.map(item => ({
          ingredientId: item.ingredientId,
          requestedQuantity: Number(item.requestedQuantity),
          unit: item.unit
        }))
      };
      await createRestockRequest(payload);
      showToast('Restock request sent', 'success');
      setShowAddModal(false);
      setNewRequest({ vendorId: '', notes: '' });
      setRequestItems([{ ingredientId: '', requestedQuantity: '', unit: '' }]);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create request', 'error');
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      await updateRequestStatus(requestId, newStatus);
      showToast(`Request marked as ${newStatus}`, 'success');
      setRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: newStatus as any } : r));
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update request', 'error');
    }
  };

  const addItemRow = () => setRequestItems([...requestItems, { ingredientId: '', requestedQuantity: '', unit: '' }]);
  const removeItemRow = (idx: number) => setRequestItems(requestItems.filter((_, i) => i !== idx));

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Store className="h-8 w-8 text-brand" /> Vendor Requests
          </h1>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white font-bold rounded-xl hover:bg-brand-dark transition">
            <Plus className="h-4 w-4" /> New Request
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50">
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-5 py-3.5 font-semibold">Date</th>
              <th className="px-5 py-3.5 font-semibold">Vendor</th>
              <th className="px-5 py-3.5 font-semibold">Items Requested</th>
              <th className="px-5 py-3.5 font-semibold">Notes</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map(req => {
              const cfg = statusConfig[req.status] || statusConfig.Pending;
              const StatusIcon = cfg.icon;
              return (
                <tr key={req._id} className="hover:bg-brand-light/30/30">
                  <td className="px-5 py-3 text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{req.vendorId?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{req.vendorId?.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <ul className="list-disc list-inside text-gray-700">
                      {req.items.map((item, idx) => (
                        <li key={idx}>{item.ingredientId?.name || 'Unknown'} - {item.requestedQuantity} {item.unit}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-5 py-3 text-gray-500 max-w-[200px] truncate" title={req.notes}>{req.notes || '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" /> {req.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <select
                      value={req.status}
                      onChange={(e) => handleStatusChange(req._id, e.target.value)}
                      className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-brand focus:border-brand cursor-pointer"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400 font-medium">No restock requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Create Restock Request</h2>
            <form onSubmit={handleAddRequest} className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor</label>
                <select required value={newRequest.vendorId} onChange={e => setNewRequest({ ...newRequest, vendorId: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:ring-brand">
                  <option value="">-- Choose a Vendor --</option>
                  {vendors.map(v => <option key={v._id} value={v._id}>{v.name} ({v.email})</option>)}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Requested Items</label>
                  <button type="button" onClick={addItemRow} className="text-sm font-bold text-brand hover:text-brand-dark">
                    + Add Row
                  </button>
                </div>

                <div className="space-y-3">
                  {requestItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <select required value={item.ingredientId} onChange={e => {
                        const newItems = [...requestItems];
                        newItems[idx].ingredientId = e.target.value;
                        setRequestItems(newItems);
                      }} className="flex-1 px-3 py-2 border rounded-xl bg-gray-50">
                        <option value="">Ingredient</option>
                        {allIngredients.map(ing => <option key={ing._id} value={ing._id}>{ing.name}</option>)}
                      </select>

                      <input type="number" required placeholder="Qty" value={item.requestedQuantity} onChange={e => {
                        const newItems = [...requestItems];
                        newItems[idx].requestedQuantity = e.target.value;
                        setRequestItems(newItems);
                      }} className="w-24 px-3 py-2 border rounded-xl bg-gray-50" />

                      <input type="text" required placeholder="Unit" value={item.unit} onChange={e => {
                        const newItems = [...requestItems];
                        newItems[idx].unit = e.target.value;
                        setRequestItems(newItems);
                      }} className="w-24 px-3 py-2 border rounded-xl bg-gray-50" />

                      {requestItems.length > 1 && (
                        <button type="button" onClick={() => removeItemRow(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Instructions (Optional)</label>
                <textarea value={newRequest.notes} onChange={e => setNewRequest({ ...newRequest, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:ring-brand"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-500 font-medium hover:text-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-dark text-white font-bold rounded-xl hover:bg-brand-dark">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorRequests;
