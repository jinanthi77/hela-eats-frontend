import { useEffect, useState } from 'react';
import { useToast } from '../components/Toast';
import { Store, PackageSearch, ClipboardList, Loader2, Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { getMyInventory, createInventoryItem, getRestockRequests, updateRequestStatus } from '../services/vendorService';
import { getIngredients } from '../services/ingredientService';
import type { VendorInventoryItem, RestockRequest } from '../types';

const STATUSES = ['Pending', 'Accepted', 'Rejected', 'Fulfilled'] as const;

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  Pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  Accepted: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
  Rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  Fulfilled: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const VendorDashboard = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests'>('inventory');

  const [inventory, setInventory] = useState<VendorInventoryItem[]>([]);
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ ingredientId: '', packageWeight: '', unit: '', price: '', stockQuantity: '', isReadyToCook: false });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invData, reqData, ingData] = await Promise.all([
        getMyInventory(),
        getRestockRequests(),
        getIngredients()
      ]);
      setInventory(invData);
      setRequests(reqData);
      setIngredients(ingData);
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ingredientId: newItem.ingredientId,
        packageWeight: Number(newItem.packageWeight),
        unit: newItem.unit,
        price: Number(newItem.price),
        stockQuantity: Number(newItem.stockQuantity),
        isReadyToCook: newItem.isReadyToCook
      };
      await createInventoryItem(payload);
      showToast('Item added to inventory', 'success');
      setShowAddModal(false);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to add item', 'error');
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

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-8">
        <Store className="h-8 w-8 text-orange-500" /> Vendor Dashboard
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 ${activeTab === 'inventory' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('inventory')}
        >
          <PackageSearch className="h-4 w-4" /> My Inventory
        </button>
        <button
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 ${activeTab === 'requests' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('requests')}
        >
          <ClipboardList className="h-4 w-4" /> Admin Requests
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Inventory Items</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-700 transition"
            >
              <Plus className="h-4 w-4" /> Add Item
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3.5 font-semibold">Ingredient</th>
                  <th className="px-5 py-3.5 font-semibold">Package Info</th>
                  <th className="px-5 py-3.5 font-semibold">Price</th>
                  <th className="px-5 py-3.5 font-semibold">Stock</th>
                  <th className="px-5 py-3.5 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inventory.map(item => (
                  <tr key={item._id} className="hover:bg-orange-50/30">
                    <td className="px-5 py-3 font-medium">{item.ingredientId?.name || 'Unknown'}</td>
                    <td className="px-5 py-3 text-gray-600">{item.packageWeight} {item.unit}</td>
                    <td className="px-5 py-3 font-bold text-gray-900">Rs. {item.price?.toFixed(2) || '0.00'}</td>
                    <td className="px-5 py-3 font-bold">{item.stockQuantity}</td>
                    <td className="px-5 py-3">
                      {item.isReadyToCook ? (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold">Ready to Cook</span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">Raw</span>
                      )}
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400 font-medium">No inventory items found. Add some!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Requests from Admins</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Items</th>
                  <th className="px-5 py-3.5 font-semibold">Notes</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map(req => {
                  const cfg = statusConfig[req.status] || statusConfig.Pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={req._id} className="hover:bg-orange-50/30">
                      <td className="px-5 py-3 text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <ul className="list-disc list-inside text-gray-700">
                          {req.items.map((item, idx) => (
                            <li key={idx}>{item.ingredientId.name} ({item.requestedQuantity} {item.unit})</li>
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
                          className="pl-3 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  )
                })}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400 font-medium">No requests from admins yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Inventory Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient</label>
                <select required value={newItem.ingredientId} onChange={e => setNewItem({ ...newItem, ingredientId: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-gray-50 focus:ring-orange-500 focus:border-orange-500">
                  <option value="">Select Ingredient</option>
                  {ingredients.map(ing => <option key={ing._id} value={ing._id}>{ing.name} ({ing.baseUnit})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Weight/Qty</label>
                  <input type="number" step="0.01" required value={newItem.packageWeight} onChange={e => setNewItem({ ...newItem, packageWeight: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input type="text" required value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} placeholder="e.g. g, kg, ml" className="w-full px-3 py-2 border rounded-xl bg-gray-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)</label>
                  <input type="number" required value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                  <input type="number" required value={newItem.stockQuantity} onChange={e => setNewItem({ ...newItem, stockQuantity: e.target.value })} className="w-full px-3 py-2 border rounded-xl bg-gray-50" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="rtc" checked={newItem.isReadyToCook} onChange={e => setNewItem({ ...newItem, isReadyToCook: e.target.checked })} className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4" />
                <label htmlFor="rtc" className="text-sm text-gray-700">Is this Ready-to-Cook? (e.g. chopped/cleaned)</label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-500 font-medium hover:text-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
