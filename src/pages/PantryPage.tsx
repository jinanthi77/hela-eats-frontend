import { useEffect, useState } from 'react';
import { getProfile, addToPantry, removeFromPantry } from '../services/userService';
import { getIngredients } from '../services/ingredientService';
import type { Ingredient } from '../services/ingredientService';
import type { PantryItem } from '../types';
import { useToast } from '../components/Toast';
import {
  Search, Loader2, Info, Plus, X, Carrot, CheckCircle2, ShoppingCart
} from 'lucide-react';

const PantryPage = () => {
  const { showToast } = useToast();
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileData, ingredientsData] = await Promise.all([
        getProfile(),
        getIngredients()
      ]);
      setPantry(profileData.pantry || []);
      setAllIngredients(Array.isArray(ingredientsData) ? ingredientsData : []);
    } catch {
      showToast('Failed to load pantry data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (ingredientId: string) => {
    setAddingId(ingredientId);
    try {
      const updatedPantry = await addToPantry(ingredientId);
      setPantry(updatedPantry);
      showToast('Added to pantry', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add to pantry', 'error');
    } finally {
      setAddingId(null);
    }
  };

  const handleRemove = async (ingredientId: string) => {
    try {
      const updatedPantry = await removeFromPantry(ingredientId);
      setPantry(updatedPantry);
      showToast('Removed from pantry', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to remove from pantry', 'error');
    }
  };

  const isInPantry = (ingredientId: string) => {
    return pantry.some(p => typeof p.ingredientId === 'object' ? p.ingredientId._id === ingredientId : p.ingredientId === ingredientId);
  };

  const filteredIngredients = allIngredients.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stapleIngredients = allIngredients.filter(ing => ing.isStaple && !isInPantry(ing._id));

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <Carrot className="h-8 w-8 text-brand" /> My Pantry
        </h1>
        <p className="text-gray-500">Manage the ingredients you already have at home.</p>
      </div>

      {/* Info Banner */}
      <div className="bg-brand-light/20 border border-brand/20 rounded-xl p-4 mb-8 flex items-start gap-3">
        <Info className="h-5 w-5 text-brand shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-1">Smart Cart Exclusions</h4>
          <p className="text-sm text-gray-600">
            Ingredients in your pantry will be automatically excluded when you add recipes to your cart, saving you money! You can always re-select them in the cart if you need more.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Current Pantry */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-gray-400" /> Current Pantry Items ({pantry.length})
            </h2>
            
            {pantry.length === 0 ? (
              <div className="text-center py-8">
                <Carrot className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Your pantry is empty</p>
                <p className="text-sm text-gray-400 mt-1">Search and add items you already have.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {pantry.map((item, idx) => {
                  const ingId = typeof item.ingredientId === 'object' ? item.ingredientId._id : item.ingredientId;
                  const ingName = typeof item.ingredientId === 'object' ? item.ingredientId.name : allIngredients.find(i => i._id === ingId)?.name || 'Unknown';
                  return (
                    <div key={idx} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-medium animate-[fadeIn_0.2s_ease]">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {ingName}
                      <button onClick={() => handleRemove(ingId)} className="ml-1 p-0.5 text-emerald-600 hover:text-red-500 hover:bg-emerald-100 rounded-full transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search & Add */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add to Pantry</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-brand focus:border-brand bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-1 pr-2">
              {filteredIngredients.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No ingredients found.</p>
              ) : (
                filteredIngredients.map(ing => {
                  const inPantry = isInPantry(ing._id);
                  return (
                    <div key={ing._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{ing.name}</p>
                        <p className="text-xs text-gray-500">{ing.baseUnit}</p>
                      </div>
                      <button 
                        onClick={() => handleAdd(ing._id)}
                        disabled={inPantry || addingId === ing._id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                          inPantry 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-brand-light/30 text-brand hover:bg-brand hover:text-white'
                        }`}
                      >
                        {inPantry ? (
                          <><CheckCircle2 className="h-4 w-4" /> Added</>
                        ) : addingId === ing._id ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Adding</>
                        ) : (
                          <><Plus className="h-4 w-4" /> Add</>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Suggestions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Carrot className="h-5 w-5 text-amber-600" /> Staple Suggestions
            </h3>
            <p className="text-sm text-amber-700/80 mb-4">
              Do you have these common staple ingredients at home? Add them to save on your next order!
            </p>
            {stapleIngredients.length === 0 ? (
              <p className="text-sm text-amber-600 font-medium italic">You've added all suggested staples!</p>
            ) : (
              <div className="space-y-2">
                {stapleIngredients.slice(0, 5).map(ing => (
                  <div key={ing._id} className="flex items-center justify-between bg-white/60 rounded-xl p-2.5 border border-amber-200/50">
                    <span className="text-sm font-bold text-amber-900">{ing.name}</span>
                    <button 
                      onClick={() => handleAdd(ing._id)}
                      disabled={addingId === ing._id}
                      className="p-1.5 bg-amber-200 text-amber-800 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {addingId === ing._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PantryPage;
