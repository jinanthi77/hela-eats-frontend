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
  DollarSign,
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
  const getIngredients = (): { id: string; name: string; quantity: number; unit: string; price: number }[] => {
    if (!recipe) return [];
    // If the user manually adjusted quantities, use those
    if (recipe._customIngredients) return recipe._customIngredients;
    const raw = recipe.ingredients || [];
    return raw.map((ing: any) => ({
      id: ing.ingredientId?._id || ing.ingredientId || '',
      name: ing.name || ing.ingredientId?.name || 'Unknown',
      quantity: ing.quantity ?? ing.exactQuantity ?? 0,
      unit: ing.unit || ing.ingredientId?.baseUnit || '',
      price: ing.price ?? 0,
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
  const totalPrice = ingredients.reduce((sum, ing) => sum + (ing.price || 0), 0);
  const hasAnyPrice = ingredients.some(ing => ing.price > 0);


  return (
    <div className="hela-shell py-10 sm:py-14">
      {/* ── Back Button ────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-brand mb-6 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12 items-start">
        <div className="rounded-2xl overflow-hidden bg-gray-100 shadow-lg h-72 sm:h-[520px] relative">
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
          <div className="absolute left-5 top-5 flex items-center gap-2 text-white font-extrabold drop-shadow">
            <ChefHat className="h-5 w-5" />
            {recipe.difficulty || 'Easy'}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {categoryName && (
              <span className="inline-flex text-xs font-bold text-brand-dark bg-brand-light/50 px-3 py-1 rounded-full uppercase tracking-wide">
                {categoryName}
              </span>
            )}
            {hasAnyPrice && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full tracking-wide">
                <ShoppingCart className="w-3.5 h-3.5" />
                Total Cost: Rs. {ingredients.filter(ing => !excludedIngredients.includes(ing.id)).reduce((sum, ing) => sum + (ing.price || 0), 0).toFixed(2)}
              </span>
            )}
          </div>
          <h1 className="hela-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
            {recipe.title}
          </h1>
          {hasAnyPrice && (
            <p className="text-4xl sm:text-5xl font-extrabold text-brand-dark mb-5">
              Rs. {ingredients.filter(ing => !excludedIngredients.includes(ing.id)).reduce((sum, ing) => sum + (ing.price || 0), 0).toFixed(2)}/=
            </p>
          )}
          <p className="text-black text-base sm:text-lg font-medium leading-relaxed mb-6">{recipe.description}</p>

          {/* ── Quick Stats ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="hela-card p-4 text-center">
              <Clock className="h-5 w-5 text-brand mx-auto mb-1" />
              <p className="text-xs text-gray-500">Prep</p>
              <p className="text-sm font-bold text-gray-900">{recipe.prepTime || 0}m</p>
            </div>
            <div className="hela-card p-4 text-center">
              <Flame className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Cook</p>
              <p className="text-sm font-bold text-gray-900">{recipe.cookTime || 0}m</p>
            </div>
            <div className="hela-card p-4 text-center">
              <ChefHat className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Difficulty</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{recipe.difficulty}</p>
            </div>
          </div>

          {/* ── Servings + Add to Cart ─────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center bg-brand-light rounded-full overflow-hidden">
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
              className="flex-1 flex items-center justify-center gap-2 hela-action py-3 px-6 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
        <div className="mb-14">
          <h2 className="hela-card max-w-xl mx-auto text-3xl font-extrabold text-brand-dark mb-8 flex items-center justify-center gap-3 p-6 underline">
            <Zap className="h-5 w-5 text-emerald-600" />
            Your Nutrition Count
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 text-center">
            <div className="hela-card p-8">
              <p className="text-2xl font-extrabold text-emerald-700">Calories: {nutrition.calories || 0} kcal</p>
            </div>
            <div className="hela-card p-8">
              <p className="text-2xl font-extrabold text-emerald-700">Protein: {nutrition.protein || 0} g</p>
            </div>
            <div className="hela-card p-8">
              <p className="text-2xl font-extrabold text-emerald-700">Fiber: {nutrition.fiber || 0} g</p>
            </div>
            <div className="hela-card p-8">
              <p className="text-2xl font-extrabold text-emerald-700">Carbs: {nutrition.carbohydrate || 0} g</p>
            </div>
            <div className="hela-card p-8">
              <p className="text-2xl font-extrabold text-emerald-700">Fat: {nutrition.fat || 0} g</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Ingredients & Instructions ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Ingredients */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 sticky top-56">
            <h2 className="text-xl font-bold text-brand-dark mb-4">
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
              <>
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
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm px-4 py-2 rounded-full border transition-all cursor-pointer ${isExcluded
                          ? 'bg-gray-50 border-gray-100 opacity-60'
                          : 'bg-white border-brand hover:bg-brand-light/30'
                          }`}
                      >
                        <div className="flex items-center gap-3 w-full min-w-0">
                          <div className={`flex items-center justify-center w-5 h-5 rounded border ${isExcluded ? 'border-gray-300 bg-white' : 'border-brand bg-brand'} transition-colors`}>
                            {!isExcluded && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className={`font-medium ${isExcluded ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                            {ing.name}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
                          <span className={`font-bold px-3 py-1 rounded-lg border shadow-sm text-xs ${isExcluded ? 'text-gray-400 bg-gray-50 border-gray-100' : 'text-brand-dark bg-white border-brand-light'}`}>
                            {ing.quantity} {ing.unit}
                          </span>
                          {ing.price > 0 && (
                            <span className={`font-bold px-2.5 py-1 rounded-lg text-xs ${isExcluded ? 'text-gray-400 bg-gray-50 border border-gray-100 line-through' : 'text-emerald-700 bg-emerald-50 border border-emerald-100'}`}>
                              Rs.{ing.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>

                {/* Total Price Summary */}
                {hasAnyPrice && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-800">Total Ingredient Cost</span>
                      </div>
                      <span className="text-xl font-extrabold text-emerald-700">
                        Rs. {ingredients
                          .filter(ing => !excludedIngredients.includes(ing.id))
                          .reduce((sum, ing) => sum + (ing.price || 0), 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    {excludedIngredients.length > 0 && (
                      <p className="text-xs text-emerald-600 mt-1">
                        Excludes {excludedIngredients.length} deselected ingredient{excludedIngredients.length > 1 ? 's' : ''}
                        {totalPrice > 0 && (
                          <span className="text-gray-400 ml-1">(Full price: Rs. {totalPrice.toFixed(2)})</span>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">No ingredients listed</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold text-brand-dark mb-4">Steps to Cook</h2>
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
