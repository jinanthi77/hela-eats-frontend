import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeById, getRecipeMealKit } from '../services/recipeService';
import { addToCart } from '../services/cartService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import {
  ArrowLeft,
  Clock,
  ChefHat,
  Users,
  Flame,
  ShoppingCart,
  Loader2,
  Plus,
  Minus,
  UtensilsCrossed,
  Zap,
  Wheat,
  Droplets,
} from 'lucide-react';

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [servings, setServings] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const [recipeData] = await Promise.allSettled([
          getRecipeById(id),
          getRecipeMealKit(id),
        ]);

        if (recipeData.status === 'fulfilled') {
          setRecipe(recipeData.value);
          setServings(recipeData.value.standardServingSize || recipeData.value.servings || 1);
        } else {
          setError('Failed to load recipe');
        }

      } catch {
        setError('Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart', 'warning');
      navigate('/login', { state: { from: `/recipes/${id}` } });
      return;
    }

    if (!id) return;
    setAddingToCart(true);
    try {
      await addToCart(id, servings, excludedIngredients);
      showToast('Recipe added to cart!', 'success');
      navigate('/cart');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  // ── Helpers to normalize API response ──────────────────────────────
  // Backend can return ingredients as:
  //   { ingredientId: { _id, name, baseUnit }, exactQuantity, unit }
  // or the frontend type:
  //   { name, quantity, unit }
  const getIngredients = (): { id: string; name: string; quantity: number; unit: string }[] => {
    if (!recipe) return [];
    // If the user manually adjusted quantities, use those
    if (recipe._customIngredients) return recipe._customIngredients;
    const raw = recipe.ingredients || [];
    return raw.map((ing: any) => ({
      id: ing.ingredientId?._id || ing.ingredientId || '',
      name: ing.name || ing.ingredientId?.name || 'Unknown',
      quantity: ing.quantity ?? ing.exactQuantity ?? 0,
      unit: ing.unit || ing.ingredientId?.baseUnit || '',
    }));
  };

  // Backend returns steps: [{ stepNumber, instruction }]
  // Frontend type expects instructions: string[]
  const getInstructions = (): string[] => {
    if (!recipe) return [];
    // Handle backend "steps" format
    if (recipe.steps && Array.isArray(recipe.steps) && recipe.steps.length > 0) {
      return recipe.steps
        .sort((a: any, b: any) => (a.stepNumber || 0) - (b.stepNumber || 0))
        .map((s: any) => (typeof s === 'string' ? s : s.instruction || ''));
    }
    // Handle frontend "instructions" format
    if (recipe.instructions && Array.isArray(recipe.instructions)) {
      return recipe.instructions;
    }
    return [];
  };

  // Nutrition can be recipe.nutrition or recipe.nutritionPerStandardServing
  const getNutrition = () => {
    return recipe?.nutrition || recipe?.nutritionPerStandardServing || null;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-brand-light flex items-center justify-center animate-pulse">
            <Loader2 className="h-7 w-7 text-brand animate-spin" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading recipe…</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col space-y-4">
        <p className="text-red-500 font-medium text-lg">{error || 'Recipe not found'}</p>
        <button
          onClick={() => navigate('/recipes')}
          className="px-6 py-2 bg-brand-light text-brand-dark rounded-lg hover:bg-brand-light/70 transition-colors font-medium"
        >
          Back to Recipes
        </button>
      </div>
    );
  }

  const categoryName =
    typeof recipe.category === 'object' && recipe.category
      ? recipe.category.name
      : undefined;

  const ingredients = getIngredients();
  const instructions = getInstructions();
  const nutrition = getNutrition();


  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Back Button ────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-brand mb-6 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="rounded-3xl overflow-hidden bg-gray-100 shadow-lg h-72 lg:h-auto">
          {recipe.imageUrl || recipe.image ? (
            <img
              src={recipe.imageUrl || recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-light to-brand-light/30 text-brand">
              <UtensilsCrossed className="h-24 w-24" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          {categoryName && (
            <span className="inline-block text-xs font-bold text-brand-dark bg-brand-light/50 px-3 py-1 rounded-full mb-3 w-fit uppercase tracking-wide">
              {categoryName}
            </span>
          )}
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
            {recipe.title}
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-6">{recipe.description}</p>

          {/* ── Quick Stats ─────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-brand-light/30 rounded-2xl p-4 text-center">
              <Clock className="h-5 w-5 text-brand mx-auto mb-1" />
              <p className="text-xs text-gray-500">Prep</p>
              <p className="text-sm font-bold text-gray-900">{recipe.prepTime || 0}m</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 text-center">
              <Flame className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Cook</p>
              <p className="text-sm font-bold text-gray-900">{recipe.cookTime || 0}m</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 text-center">
              <ChefHat className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Difficulty</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{recipe.difficulty}</p>
            </div>
          </div>

          {/* ── Servings + Add to Cart ─────────────────────────── */}
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => { setServings((s) => Math.max(1, s - 1)); setRecipe((prev: any) => prev ? { ...prev, _customIngredients: undefined } : prev); }}
                className="p-3 hover:bg-gray-200 transition-colors"
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <div className="px-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-bold text-gray-900">{servings}</span>
              </div>
              <button
                onClick={() => { setServings((s) => s + 1); setRecipe((prev: any) => prev ? { ...prev, _customIngredients: undefined } : prev); }}
                className="p-3 hover:bg-gray-200 transition-colors"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-dark hover:bg-brand-dark/90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-brand-dark/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {addingToCart ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Nutrition Info ──────────────────────────────────────── */}
      {nutrition && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-10 border border-emerald-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-600" />
            Nutrition per serving
          </h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-extrabold text-emerald-700">{nutrition.calories || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Calories</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-blue-700">{nutrition.protein || 0}g</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <Droplets className="h-3 w-3" /> Protein
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-amber-700">{nutrition.carbs || 0}g</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <Wheat className="h-3 w-3" /> Carbs
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-rose-700">{nutrition.fat || 0}g</p>
              <p className="text-xs text-gray-500 mt-1">Fat</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Ingredients & Instructions ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Ingredients */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Ingredients
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({ingredients.length} items)
              </span>
            </h2>

            <div className="mb-4 p-3.5 bg-brand-light/30 border border-brand-light rounded-xl">
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-brand-dark">Smart Deselect:</span> If you already have any of the following ingredients at home, you can purchase the others through us instead of selecting them here.
              </p>
            </div>

            {ingredients.length > 0 ? (
              <ul className="space-y-3">
                {ingredients.map((ing, i) => {
                  const isExcluded = excludedIngredients.includes(ing.id);
                  return (
                    <li
                      key={i}
                      onClick={() => {
                        if (!ing.id) return;
                        setExcludedIngredients(prev =>
                          prev.includes(ing.id)
                            ? prev.filter(id => id !== ing.id)
                            : [...prev, ing.id]
                        );
                      }}
                      className={`flex items-center justify-between gap-3 text-sm p-3 rounded-xl border transition-all cursor-pointer ${isExcluded
                        ? 'bg-gray-50 border-gray-100 opacity-60'
                        : 'bg-brand-light/20 border-brand-light hover:bg-brand-light/30'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-5 h-5 rounded border ${isExcluded ? 'border-gray-300 bg-white' : 'border-brand bg-brand'} transition-colors`}>
                          {!isExcluded && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={`font-medium ${isExcluded ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                          {ing.name}
                        </span>
                      </div>
                      <span className={`font-bold px-3 py-1 rounded-lg border shadow-sm text-xs ${isExcluded ? 'text-gray-400 bg-gray-50 border-gray-100' : 'text-brand-dark bg-white border-brand-light'}`}>
                        {ing.quantity} {ing.unit}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No ingredients listed</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
          {instructions.length > 0 ? (
            <ol className="space-y-4">
              {instructions.map((step, i) => (
                <li key={i} className="flex gap-4 group">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-light text-brand-dark font-bold text-sm flex items-center justify-center group-hover:bg-brand-dark group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-400">No instructions available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
