import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMealPlans, createMealPlan, deleteMealPlan, addMealPlanToCart } from '../services/mealPlanService';
import { useToast } from '../components/Toast';
import type { MealPlan, Recipe } from '../types';
import { CalendarDays, Plus, Trash2, Loader2, ShoppingCart, Eye, X } from 'lucide-react';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const MealPlansPage = () => {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // New plan form
  const [newName, setNewName] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  const fetchPlans = async () => {
    try {
      const data = await getMealPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch { showToast('Failed to load meal plans', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newStart || !newEnd) return;
    setCreating(true);
    try {
      await createMealPlan({ name: newName, startDate: newStart, endDate: newEnd, entries: [] });
      showToast('Meal plan created!', 'success');
      setShowCreate(false);
      setNewName(''); setNewStart(''); setNewEnd('');
      await fetchPlans();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create', 'error');
    } finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this meal plan?')) return;
    setActionId(id);
    try {
      await deleteMealPlan(id);
      showToast('Meal plan deleted', 'info');
      setPlans((p) => p.filter((pl) => pl._id !== id));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete', 'error');
    } finally { setActionId(null); }
  };

  const handleAddToCart = async (id: string) => {
    setActionId(id);
    try {
      await addMealPlanToCart(id);
      showToast('Meal plan added to cart!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add to cart', 'error');
    } finally { setActionId(null); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-brand" /> Meal Plans
          </h1>
          <p className="text-gray-500 mt-1">Plan your weekly meals and shop smarter</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 hela-action transition-colors">
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? 'Cancel' : 'New Plan'}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="hela-card p-5 sm:p-6 mb-6 animate-[fadeInUp_0.2s_ease]">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create Meal Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors"
                placeholder="My Weekly Plan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={creating}
            className="flex items-center gap-2 px-5 py-2.5 hela-action transition-colors disabled:opacity-50">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Plan
          </button>
        </form>
      )}

      {/* Plans List */}
      {plans.length === 0 ? (
        <div className="text-center py-16 hela-card">
          <CalendarDays className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-400 mb-2">No meal plans yet</h2>
          <p className="text-gray-400">Create your first meal plan to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan._id} className="hela-card p-4 sm:p-5 hover:-translate-y-0.5 transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(plan.startDate).toLocaleDateString()} — {new Date(plan.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{plan.entries?.length || 0} meals planned</p>
                </div>

                {/* Entries preview */}
                {plan.entries && plan.entries.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {MEAL_TYPES.map((type) => {
                      const count = plan.entries.filter((e) => e.mealType === type).length;
                      if (count === 0) return null;
                      return (
                        <span key={type} className="text-xs px-2 py-1 rounded-full bg-brand-light/30 text-brand font-medium">
                          {count} {type}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Link to={`/mealplans/${plan._id}`}
                    className="p-2 text-gray-400 hover:text-brand hover:bg-brand-light/30 rounded-lg transition-colors">
                    <Eye className="h-5 w-5" />
                  </Link>
                  <button onClick={() => handleAddToCart(plan._id)} disabled={actionId === plan._id}
                    className="p-2 text-gray-400 hover:text-brand hover:bg-brand-light/30 rounded-lg transition-colors disabled:opacity-30">
                    {actionId === plan._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                  </button>
                  <button onClick={() => handleDelete(plan._id)} disabled={actionId === plan._id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealPlansPage;
