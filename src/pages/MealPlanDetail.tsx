import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMealPlanById, updateMealPlan, addMealPlanToCart } from '../services/mealPlanService';
import { getRecipes } from '../services/recipeService';
import { useToast } from '../components/Toast';
import type { MealPlan, MealPlanEntry, Recipe } from '../types';
import { ArrowLeft, Loader2, Plus, Trash2, ShoppingCart, Save, CalendarDays } from 'lucide-react';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MealPlanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<MealPlanEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDay, setNewDay] = useState(DAYS[0]);
  const [newMealType, setNewMealType] = useState<typeof MEAL_TYPES[number]>('breakfast');
  const [newRecipeId, setNewRecipeId] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const [planData, recipeData] = await Promise.all([getMealPlanById(id), getRecipes()]);
        setPlan(planData);
        setEntries(planData.entries || []);
        setRecipes(recipeData);
        if (recipeData.length > 0) setNewRecipeId(recipeData[0]._id);
      } catch { showToast('Failed to load meal plan', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleAddEntry = () => {
    if (!newRecipeId) return;
    setEntries([...entries, { recipe: newRecipeId, day: newDay, mealType: newMealType }]);
    setShowAddForm(false);
    showToast('Entry added — save to persist', 'info');
  };

  const handleRemoveEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const payload = { entries: entries.map((e) => ({ recipe: typeof e.recipe === 'string' ? e.recipe : (e.recipe as Recipe)._id, day: e.day, mealType: e.mealType })) };
      const updated = await updateMealPlan(id, payload);
      setPlan(updated);
      setEntries(updated.entries || []);
      showToast('Meal plan saved!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const handleAddToCart = async () => {
    if (!id) return;
    try {
      await addMealPlanToCart(id);
      showToast('Meal plan added to cart!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add', 'error');
    }
  };

  const getRecipeName = (recipe: string | Recipe): string => {
    if (typeof recipe === 'string') {
      const found = recipes.find((r) => r._id === recipe);
      return found?.title || 'Unknown Recipe';
    }
    return recipe.title;
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
    </div>
  );

  if (!plan) return (
    <div className="min-h-[60vh] flex items-center justify-center flex-col space-y-4">
      <p className="text-red-500 font-medium text-lg">Meal plan not found</p>
      <button onClick={() => navigate('/mealplans')} className="px-6 py-2 bg-brand-light text-brand-dark rounded-lg hover:bg-brand-light transition-colors">Back to Plans</button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/mealplans')} className="inline-flex items-center gap-2 text-gray-500 hover:text-brand mb-6 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">All Plans</span>
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-brand" /> {plan.name}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {new Date(plan.startDate).toLocaleDateString()} — {new Date(plan.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleAddToCart}
            className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl transition-colors text-sm">
            <ShoppingCart className="h-4 w-4" /> Add to Cart
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-brand-dark hover:bg-brand-dark text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </button>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No meals planned yet. Add your first entry!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {DAYS.map((day) => {
              const dayEntries = entries.filter((e) => e.day === day);
              if (dayEntries.length === 0) return null;
              return (
                <div key={day} className="p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{day}</h3>
                  <div className="space-y-2">
                    {dayEntries.map((entry, i) => {
                      const entryIndex = entries.indexOf(entry);
                      return (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${entry.mealType === 'breakfast' ? 'bg-amber-100 text-amber-700' : entry.mealType === 'lunch' ? 'bg-blue-100 text-blue-700' : entry.mealType === 'dinner' ? 'bg-violet-100 text-violet-700' : 'bg-brand-light text-brand-dark'}`}>
                              {entry.mealType}
                            </span>
                            <span className="text-sm font-medium text-gray-700">{getRecipeName(entry.recipe)}</span>
                          </div>
                          <button onClick={() => handleRemoveEntry(entryIndex)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Entry */}
      {showAddForm ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-[fadeInUp_0.2s_ease]">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add Meal Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <select value={newDay} onChange={(e) => setNewDay(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-brand focus:border-brand">
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={newMealType} onChange={(e) => setNewMealType(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-brand focus:border-brand">
              {MEAL_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <select value={newRecipeId} onChange={(e) => setNewRecipeId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-brand focus:border-brand">
              {recipes.map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddEntry} className="px-5 py-2 bg-brand-dark hover:bg-brand-dark text-white font-bold rounded-xl transition-colors text-sm">Add</button>
            <button onClick={() => setShowAddForm(false)} className="px-5 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold rounded-xl transition-colors text-sm">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-200 text-gray-400 hover:text-brand hover:border-brand-light font-medium rounded-2xl transition-colors">
          <Plus className="h-5 w-5" /> Add Meal Entry
        </button>
      )}
    </div>
  );
};

export default MealPlanDetail;
