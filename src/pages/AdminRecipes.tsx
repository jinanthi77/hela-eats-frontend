import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes } from '../services/recipeService';
import { getCategories } from '../services/categoryService';
import { adminCreateRecipe, adminUpdateRecipe, adminDeleteRecipe } from '../services/adminService';
import type { RecipePayload } from '../services/adminService';
import { getIngredients, createIngredient } from '../services/ingredientService';
import type { Ingredient } from '../services/ingredientService';
import { getAllInventory, syncRecipePrices } from '../services/vendorService';
import type { VendorInventoryItem } from '../types';
import { useToast } from '../components/Toast';
import type { Recipe, Category } from '../types';
import {
  UtensilsCrossed, Plus, Pencil, Trash2, Loader2, X, Save, ArrowLeft, Clock, Search, DollarSign, RefreshCw,
} from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

const emptyForm: RecipePayload = {
  title: '',
  description: '',
  category: '',
  imageUrl: '',
  prepTime: 0,
  cookTime: 0,
  difficulty: 'Medium',
  tags: [],
  standardServingSize: 1,
  ingredients: [],
  steps: [],
  nutritionPerStandardServing: { calories: 0, protein: 0, carbohydrate: 0, fiber: 0, fat: 0 },
};

const AdminRecipes = () => {
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<RecipePayload>({ ...emptyForm });
  const [tagsInput, setTagsInput] = useState('');

  // Steps state
  const [steps, setSteps] = useState<{ stepNumber: number; instruction: string }[]>([]);

  // Ingredients state
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [vendorInventory, setVendorInventory] = useState<VendorInventoryItem[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<{ ingredientId: string; exactQuantity: number; unit: string; price: number }[]>([]);
  const [ingSearch, setIngSearch] = useState('');
  const [showIngDropdown, setShowIngDropdown] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('g');
  const [creatingIng, setCreatingIng] = useState(false);

  const fetchData = async () => {
    try {
      const [recipeData, categoryData, ingredientData, inventoryData] = await Promise.all([
        getRecipes(), getCategories(), getIngredients(), getAllInventory('Approved')
      ]);
      setRecipes(Array.isArray(recipeData) ? recipeData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setAllIngredients(Array.isArray(ingredientData) ? ingredientData : []);
      setVendorInventory(Array.isArray(inventoryData) ? inventoryData : []);
    } catch {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setSteps([{ stepNumber: 1, instruction: '' }]);
    setRecipeIngredients([]);
    setTagsInput('');
    setShowForm(true);
  };

  const openEdit = (recipe: Recipe) => {
    setEditId(recipe._id);
    const catId = typeof recipe.category === 'string' ? recipe.category : recipe.category?._id || '';
    const mappedIngs = ((recipe as any).ingredients || []).map((ing: any) => ({
      ingredientId: ing.ingredientId?._id || ing.ingredientId || '',
      exactQuantity: ing.exactQuantity || ing.quantity || 0,
      unit: ing.unit || '',
      price: ing.price || 0,
    }));
    setForm({
      title: recipe.title,
      description: recipe.description || '',
      category: catId,
      imageUrl: recipe.imageUrl || recipe.image || '',
      prepTime: recipe.prepTime || 0,
      cookTime: recipe.cookTime || 0,
      difficulty: (recipe.difficulty as any) || 'Medium',
      tags: (recipe as any).tags || [],
      standardServingSize: (recipe as any).standardServingSize || recipe.servings || 1,
      ingredients: mappedIngs,
      steps: (recipe as any).steps || [],
      nutritionPerStandardServing: (recipe as any).nutritionPerStandardServing || recipe.nutrition || { calories: 0, protein: 0, carbohydrate: 0, fiber: 0, fat: 0 },
    });
    setRecipeIngredients(mappedIngs);
    setSteps((recipe as any).steps?.length > 0 ? (recipe as any).steps : [{ stepNumber: 1, instruction: '' }]);
    setTagsInput(((recipe as any).tags || []).join(', '));
    setShowForm(true);
  };

  // Ingredient helpers
  const getVendorPrice = (ingredientId: string): number => {
    // Find cheapest vendor price for this ingredient
    const stocks = vendorInventory.filter(v => {
      const vIngId = typeof v.ingredientId === 'object' ? v.ingredientId._id : v.ingredientId;
      return vIngId === ingredientId && v.stockQuantity > 0;
    });
    if (stocks.length === 0) return 0;
    stocks.sort((a, b) => a.price - b.price);
    return stocks[0].price;
  };

  const addIngredientToRecipe = (ingId: string) => {
    if (recipeIngredients.find(r => r.ingredientId === ingId)) return;
    const ing = allIngredients.find(i => i._id === ingId);
    const vendorPrice = getVendorPrice(ingId);
    setRecipeIngredients([...recipeIngredients, { ingredientId: ingId, exactQuantity: 0, unit: ing?.baseUnit || 'g', price: vendorPrice }]);
    setIngSearch('');
    setShowIngDropdown(false);
  };
  const removeIngredientFromRecipe = (idx: number) => setRecipeIngredients(recipeIngredients.filter((_, i) => i !== idx));
  const updateRecipeIngredient = (idx: number, field: string, value: any) => {
    setRecipeIngredients(recipeIngredients.map((ing, i) => i === idx ? { ...ing, [field]: value } : ing));
  };
  const recipeTotalPrice = recipeIngredients.reduce((sum, ing) => sum + (ing.price || 0), 0);
  const getIngName = (id: string) => allIngredients.find(i => i._id === id)?.name || 'Unknown';
  const filteredIngredients = allIngredients.filter(i => i.name.toLowerCase().includes(ingSearch.toLowerCase()) && !recipeIngredients.find(r => r.ingredientId === i._id));

  const handleCreateIngredient = async () => {
    if (!newIngName.trim() || !newIngUnit.trim()) return;
    setCreatingIng(true);
    try {
      const created = await createIngredient({ name: newIngName.trim(), baseUnit: newIngUnit.trim() });
      setAllIngredients(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      addIngredientToRecipe(created._id);
      setNewIngName('');
      setNewIngUnit('g');
      showToast(`Ingredient "${created.name}" created`, 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create ingredient', 'error');
    } finally { setCreatingIng(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: RecipePayload = {
        ...form,
        tags: tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        steps: steps.filter(s => s.instruction.trim()),
        ingredients: recipeIngredients.filter(i => i.ingredientId && i.exactQuantity > 0).map(i => ({
          ingredientId: i.ingredientId,
          exactQuantity: i.exactQuantity,
          unit: i.unit,
          price: i.price || 0
        })),
      };
      if (editId) {
        await adminUpdateRecipe(editId, payload);
        showToast('Recipe updated!', 'success');
      } else {
        await adminCreateRecipe(payload);
        showToast('Recipe created!', 'success');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ ...emptyForm });
      setSteps([]);
      setTagsInput('');
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete recipe "${title}"? This cannot be undone.`)) return;
    try {
      await adminDeleteRecipe(id);
      showToast('Recipe deleted', 'info');
      setRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const handleSyncPrices = async (recipeId: string, title: string) => {
    setSyncingId(recipeId);
    try {
      const result = await syncRecipePrices(recipeId);
      showToast(`"${title}" — ${result.synced} prices synced${result.failed > 0 ? `, ${result.failed} failed` : ''}`, 'success');
      await fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to sync prices', 'error');
    } finally {
      setSyncingId(null);
    }
  };

  const addStep = () => {
    setSteps([...steps, { stepNumber: steps.length + 1, instruction: '' }]);
  };

  const removeStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  const updateStep = (idx: number, instruction: string) => {
    setSteps(steps.map((s, i) => i === idx ? { ...s, instruction } : s));
  };

  const getCategoryName = (recipe: Recipe): string => {
    if (!recipe.category) return '—';
    if (typeof recipe.category === 'string') {
      const cat = categories.find(c => c._id === recipe.category);
      return cat?.name || '—';
    }
    return recipe.category.name || '—';
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Admin Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
            <UtensilsCrossed className="h-8 w-8 text-brand" /> Manage Recipes
          </h1>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark hover:bg-brand-dark text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-dark/20">
          <Plus className="h-4 w-4" /> New Recipe
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 animate-[fadeInUp_0.2s_ease]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Recipe' : 'Create Recipe'}</h2>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors"
                placeholder="e.g. Sri Lankan Chicken Curry" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors">
                <option value="">— None —</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors resize-none"
              placeholder="Brief description of the recipe..." />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
              <input type="number" min={0} value={form.prepTime || 0} onChange={(e) => setForm({ ...form, prepTime: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cook Time (min)</label>
              <input type="number" min={0} value={form.cookTime || 0} onChange={(e) => setForm({ ...form, cookTime: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select value={form.difficulty || 'Medium'} onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors">
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
              <input type="number" min={1} value={form.standardServingSize || 1} onChange={(e) => setForm({ ...form, standardServingSize: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="url" value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors"
                placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors"
                placeholder="e.g. spicy, traditional, quick" />
            </div>
          </div>

          {/* Nutrition */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-900 mb-2">Nutrition (per serving)</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {(['calories', 'protein', 'carbohydrate', 'fiber', 'fat'] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 mb-1 capitalize">{field}{field === 'calories' ? ' (kcal)' : ' (g)'}</label>
                  <input type="number" min={0} step="0.1"
                    value={form.nutritionPerStandardServing?.[field] || 0}
                    onChange={(e) => setForm({
                      ...form,
                      nutritionPerStandardServing: { ...form.nutritionPerStandardServing!, [field]: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-900">Ingredients ({recipeIngredients.length})</label>
              {recipeIngredients.length > 0 && (
                <span className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  Total: Rs. {recipeTotalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {/* Search & Add */}
            <div className="relative mb-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={ingSearch}
                    onChange={(e) => { setIngSearch(e.target.value); setShowIngDropdown(true); }}
                    onFocus={() => setShowIngDropdown(true)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors"
                    placeholder="Search ingredients..." />
                  {showIngDropdown && ingSearch && filteredIngredients.length > 0 && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {filteredIngredients.slice(0, 15).map(ing => {
                        const vPrice = getVendorPrice(ing._id);
                        return (
                          <button key={ing._id} type="button" onClick={() => addIngredientToRecipe(ing._id)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-brand-light/30 transition-colors flex justify-between">
                            <span className="font-medium text-gray-800">{ing.name}</span>
                            <span className="text-xs text-gray-400 flex gap-2">
                              <span>{ing.baseUnit}</span>
                              {vPrice > 0 && <span className="text-emerald-600 font-bold">Rs.{vPrice}</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              {/* Quick-create ingredient */}
              <div className="flex gap-2 mt-2">
                <input type="text" value={newIngName} onChange={(e) => setNewIngName(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs bg-gray-50 focus:bg-white focus:border-brand transition-colors"
                  placeholder="New ingredient name..." />
                <input type="text" value={newIngUnit} onChange={(e) => setNewIngUnit(e.target.value)}
                  className="w-16 px-2 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs bg-gray-50 text-center" placeholder="Unit" />
                <button type="button" onClick={handleCreateIngredient} disabled={creatingIng || !newIngName.trim()}
                  className="px-3 py-1.5 text-xs font-bold text-brand border border-brand-light rounded-lg hover:bg-brand-light/30 disabled:opacity-40 transition-colors">
                  {creatingIng ? '...' : '+ Create'}
                </button>
              </div>
            </div>
            {/* Column headers */}
            {recipeIngredients.length > 0 && (
              <div className="flex items-center gap-2 px-2 pb-1 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <span className="flex-1">Ingredient</span>
                <span className="w-20 text-center">Qty</span>
                <span className="w-16 text-center">Unit</span>
                <span className="w-24 text-center">Price (Rs.)</span>
                <span className="w-8"></span>
              </div>
            )}
            {/* Selected ingredients list */}
            {recipeIngredients.length > 0 && (
              <div className="space-y-2">
                {recipeIngredients.map((ing, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800 flex-1 min-w-0 truncate">{getIngName(ing.ingredientId)}</span>
                    <input type="number" min={0} step="0.1" value={ing.exactQuantity}
                      onChange={(e) => updateRecipeIngredient(idx, 'exactQuantity', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-brand focus:border-brand" placeholder="Qty" />
                    <input type="text" value={ing.unit}
                      onChange={(e) => updateRecipeIngredient(idx, 'unit', e.target.value)}
                      className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-brand focus:border-brand" placeholder="Unit" />
                    <input type="number" min={0} step="0.01" value={ing.price}
                      onChange={(e) => updateRecipeIngredient(idx, 'price', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-brand focus:border-brand" placeholder="Price" />
                    <button type="button" onClick={() => removeIngredientFromRecipe(idx)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {/* Total row */}
                <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="flex-1 text-sm font-bold text-emerald-800">Total Recipe Price</span>
                  <span className="w-20"></span>
                  <span className="w-16"></span>
                  <span className="w-24 text-center text-sm font-extrabold text-emerald-700">Rs. {recipeTotalPrice.toFixed(2)}</span>
                  <span className="w-8"></span>
                </div>
              </div>
            )}
            {recipeIngredients.length === 0 && <p className="text-xs text-gray-400 italic">No ingredients added yet. Search above to add.</p>}
          </div>

          {/* Steps */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-900">Steps</label>
              <button type="button" onClick={addStep} className="text-xs text-brand hover:text-brand-dark font-bold flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add Step
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-brand-light text-brand-dark font-bold text-xs mt-0.5">{idx + 1}</span>
                  <input type="text" value={step.instruction} onChange={(e) => updateStep(idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors"
                    placeholder={`Step ${idx + 1} instruction...`} />
                  {steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(idx)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-dark hover:bg-brand-dark text-white font-bold rounded-xl transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editId ? 'Update Recipe' : 'Create Recipe'}
          </button>
        </form>
      )}

      {/* Recipes Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {recipes.length === 0 ? (
          <div className="text-center py-16">
            <UtensilsCrossed className="h-14 w-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">No recipes yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first recipe to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3.5 font-semibold">#</th>
                  <th className="px-5 py-3.5 font-semibold">Recipe</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Difficulty</th>
                  <th className="px-5 py-3.5 font-semibold">Time</th>
                  <th className="px-5 py-3.5 font-semibold">Servings</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recipes.map((recipe, idx) => (
                  <tr key={recipe._id} className="hover:bg-brand-light/30 transition-colors">
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {(recipe.imageUrl || recipe.image) && (
                          <img src={recipe.imageUrl || recipe.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-[200px]">{recipe.title}</p>
                          {recipe.description && (
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{recipe.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                        {getCategoryName(recipe)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${recipe.difficulty === 'Easy' ? 'bg-brand-light/30 text-brand' : recipe.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {recipe.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {(recipe.prepTime || 0) + (recipe.cookTime || 0)}m
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 font-medium">
                      {(recipe as any).standardServingSize || recipe.servings || 1}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleSyncPrices(recipe._id, recipe.title)}
                          disabled={syncingId === recipe._id}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Sync vendor prices">
                          <RefreshCw className={`h-4 w-4 ${syncingId === recipe._id ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => openEdit(recipe)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(recipe._id, recipe.title)}
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

      {/* Summary */}
      <p className="text-xs text-gray-400 mt-4 text-right">
        {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} total
      </p>
    </div>
  );
};

export default AdminRecipes;
