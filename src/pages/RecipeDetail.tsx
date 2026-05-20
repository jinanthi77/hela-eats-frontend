import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Apple,
  ArrowLeft,
  Check,
  ChefHat,
  Clock,
  Droplets,
  Flame,
  Heart,
  Leaf,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Sprout,
  UtensilsCrossed,
  Wheat,
} from 'lucide-react';
import { addToCart, calculateScale } from '../services/cartService';
import { getRecipeById } from '../services/recipeService';
import { useToast } from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../utils/apiError';
import type { Recipe, RecipeIngredient } from '../types';

type IngredientRow = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  available: boolean;
  calories?: number;
};

type RecipeIngredientWithId = RecipeIngredient & {
  _id?: string;
};

type PricePreviewRow = {
  ingredientId?: string;
  quantity?: number;
  unit?: string;
  price?: number;
  error?: unknown;
};

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0';
  return Number.isInteger(value) ? `${value}` : value.toFixed(value < 10 ? 1 : 0);
};

const getIngredientId = (ingredient: RecipeIngredientWithId) => {
  if (typeof ingredient.ingredientId === 'object' && ingredient.ingredientId?._id) return ingredient.ingredientId._id;
  return String(ingredient.ingredientId || ingredient._id || ingredient.name || '');
};

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [servings, setServings] = useState(1);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [addingMode, setAddingMode] = useState<'cart' | 'kit' | null>(null);
  const [caloriesOpen, setCaloriesOpen] = useState(false);
  const [pricePreview, setPricePreview] = useState<PricePreviewRow[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getRecipeById(id);
        setRecipe(data);
        setServings(data.standardServingSize || data.servings || 1);
        setExcludedIngredients([]);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load recipe'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  useEffect(() => {
    if (!id || !isAuthenticated) return;

    let ignore = false;
    const fetchPricePreview = async () => {
      try {
        setPreviewLoading(true);
        const data = await calculateScale(id, servings, false);
        if (!ignore) {
          setPricePreview(Array.isArray(data.mappedIngredients) ? data.mappedIngredients : []);
        }
      } catch {
        if (!ignore) setPricePreview([]);
      } finally {
        if (!ignore) setPreviewLoading(false);
      }
    };

    fetchPricePreview();
    return () => {
      ignore = true;
    };
  }, [id, servings, isAuthenticated]);

  const baseServings = recipe?.standardServingSize || recipe?.servings || 1;
  const servingRatio = servings / baseServings;

  const ingredients: IngredientRow[] = useMemo(() => {
    if (!recipe) return [];

    return (recipe.ingredients || []).map((ingredient) => {
      const ingredientId = getIngredientId(ingredient);
      const preview = pricePreview.find((item) => String(item.ingredientId || '') === String(ingredientId));
      const usingBackendPreview = pricePreview.length > 0;
      const quantity = Number(ingredient.quantity ?? ingredient.exactQuantity ?? 0) * servingRatio;
      const ingredientInfo = typeof ingredient.ingredientId === 'object' ? ingredient.ingredientId : undefined;
      const nutrition = ingredientInfo?.nutritionPer100Units;
      const calories =
        nutrition?.calories && quantity
          ? Math.round((Number(nutrition.calories) * quantity) / 100)
          : undefined;

      return {
        id: ingredientId,
        name: ingredient.name || ingredientInfo?.name || 'Ingredient',
        quantity: Number(preview?.quantity ?? quantity),
        unit: preview?.unit || ingredient.unit || ingredientInfo?.baseUnit || '',
        price: preview?.error ? 0 : Number(preview?.price ?? (usingBackendPreview ? 0 : ingredient.price ?? 0)) * (preview ? 1 : servingRatio),
        available: usingBackendPreview ? !!preview && !preview.error : true,
        calories,
      };
    });
  }, [recipe, servingRatio, pricePreview]);

  const instructions = useMemo(() => {
    if (!recipe) return [];
    if (Array.isArray(recipe.steps) && recipe.steps.length > 0) {
      return [...recipe.steps]
        .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
        .map((step) => step.instruction)
        .filter(Boolean);
    }
    return recipe.instructions || [];
  }, [recipe]);

  const nutrition = recipe?.nutritionPerStandardServing || recipe?.nutrition;
  const selectedIngredients = ingredients.filter((ingredient) => ingredient.available && !excludedIngredients.includes(ingredient.id));
  const unavailableIngredients = ingredients.filter((ingredient) => !ingredient.available);
  const selectedTotal = selectedIngredients.reduce((sum, ingredient) => sum + ingredient.price, 0);
  const hasPrices = ingredients.some((ingredient) => ingredient.price > 0) || pricePreview.length > 0;
  const estimatedCalories = nutrition?.calories || selectedIngredients.reduce((sum, ingredient) => sum + (ingredient.calories || 0), 0);
  const caloriesRows = selectedIngredients.map((ingredient) => ({
    ...ingredient,
    calories:
      ingredient.calories ??
      Math.max(1, Math.round((estimatedCalories || 0) / Math.max(selectedIngredients.length, 1))),
  }));

  const toggleIngredient = (ingredientId: string) => {
    if (!ingredientId) return;
    const ingredient = ingredients.find((item) => item.id === ingredientId);
    if (ingredient && !ingredient.available) return;
    setExcludedIngredients((current) =>
      current.includes(ingredientId)
        ? current.filter((idValue) => idValue !== ingredientId)
        : [...current, ingredientId]
    );
  };

  const handleAddToCart = async (isMealKit: boolean) => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart', 'warning');
      navigate('/login', { state: { from: `/recipes/${id}` } });
      return;
    }

    if (!id) return;
    setAddingMode(isMealKit ? 'kit' : 'cart');
    try {
      await addToCart(id, servings, excludedIngredients, isMealKit);
      showToast(isMealKit ? 'Ready-to-cook meal kit added to cart' : 'Recipe ingredients added to cart', 'success');
      navigate('/cart');
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Failed to add to cart'), 'error');
    } finally {
      setAddingMode(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-brand-dark" />
          <p className="text-sm font-semibold text-gray-500">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="hela-shell min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-bold text-red-600">{error || 'Recipe not found'}</p>
        <button onClick={() => navigate('/recipes')} className="hela-action px-6 py-3">
          Back to Recipes
        </button>
      </div>
    );
  }

  const categoryName = typeof recipe.category === 'object' && recipe.category ? recipe.category.name : undefined;
  const imageSrc = recipe.imageUrl || recipe.image;

  return (
    <div className="hela-shell py-6 sm:py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-black hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_1fr] lg:items-start">
        <div className="relative overflow-hidden rounded-[14px] border-2 border-brand-dark bg-gray-100 aspect-[1.45/1]">
          {imageSrc ? (
            <img src={imageSrc} alt={recipe.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-brand-light">
              <UtensilsCrossed className="h-20 w-20 text-brand-dark" />
            </div>
          )}
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-sm font-bold text-white">
            <ChefHat className="h-4 w-4" />
            {recipe.difficulty || 'Easy'}
          </div>
          <div className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-sm font-extrabold text-white">
            {recipe.ratingSummary?.averageRating?.toFixed(1) || '4.9'} ★★★★★
          </div>
        </div>

        <div>
          <p className="text-sm font-extrabold uppercase tracking-wide text-brand-dark">{categoryName || 'Hela Eats'}</p>
          <h1 className="hela-display mt-2 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            {recipe.title}
          </h1>
          <p className="mt-2 text-4xl font-black text-brand-dark">
            Rs {hasPrices ? selectedTotal.toFixed(2) : '0.00'}/=
            {previewLoading && <span className="ml-3 align-middle text-sm font-bold text-gray-400">updating...</span>}
          </p>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-black">
            {recipe.description || 'Fresh ingredients measured for your kitchen and ready for checkout.'}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-brand-dark/35 px-5 py-4 text-center">
              <Clock className="mx-auto mb-2 h-5 w-5 text-brand-dark" />
              <p className="text-xs font-extrabold underline">Per {baseServings} Serving</p>
              <p className="mt-2 text-xs font-bold">Meal Prep Time: {recipe.prepTime || 0} Minutes</p>
              <p className="text-xs font-bold">Meal Cook Time: {recipe.cookTime || 0} Minutes</p>
            </div>

            <div className="rounded-xl border border-brand-dark/35 px-5 py-4 text-center">
              <UsersIcon />
              <p className="text-xs font-extrabold underline">Servings</p>
              <p className="mt-1 text-[10px] text-gray-500">Select the amount of servings here</p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  onClick={() => setServings((value) => Math.max(1, value - 1))}
                  className="grid h-7 w-7 place-items-center rounded-full bg-brand-light text-brand-dark hover:bg-brand"
                  aria-label="Decrease servings"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-8 text-center text-lg font-black">{servings}</span>
                <button
                  onClick={() => setServings((value) => value + 1)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-brand-light text-brand-dark hover:bg-brand"
                  aria-label="Increase servings"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-brand-dark/50 p-4">
            <p className="mb-3 text-center text-xs font-black text-brand-dark underline">Review Your Ingredients</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={addingMode !== null}
                className="hela-action flex items-center justify-center gap-2 px-4 py-3 text-sm disabled:opacity-60"
              >
                {addingMode === 'cart' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                Add to Cart
              </button>
              <button
                onClick={() => handleAddToCart(true)}
                disabled={addingMode !== null}
                className="hela-action flex items-center justify-center gap-2 px-4 py-3 text-sm disabled:opacity-60"
              >
                {addingMode === 'kit' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UtensilsCrossed className="h-4 w-4" />}
                Add Ready-to-Cook Meal Kit
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] font-medium text-gray-400">
              Untick ingredients you already have at home. Items marked out of stock are unavailable from approved vendors right now.
            </p>
            {unavailableIngredients.length > 0 && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                <p className="text-[11px] font-black text-amber-700">
                  Some ingredients are not available from approved vendors right now.
                </p>
                <p className="mt-1 text-[10px] font-bold text-amber-700">
                  {unavailableIngredients.map((ingredient) => ingredient.name).join(', ')}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-amber-600">
                  We will add the available ingredients to your cart and skip {unavailableIngredients.length > 1 ? 'these items' : 'this item'} for now.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.86fr_1fr]">
        <div>
          <h2 className="mb-3 text-lg font-black text-brand-dark">Ingredients</h2>
          <div className="space-y-2">
            {ingredients.map((ingredient) => {
              const unavailable = !ingredient.available;
              const excluded = unavailable || excludedIngredients.includes(ingredient.id);
              return (
                <button
                  key={`${ingredient.id}-${ingredient.name}`}
                  onClick={() => toggleIngredient(ingredient.id)}
                  disabled={unavailable}
                  className={`grid w-full grid-cols-[1.4rem_1fr_auto_auto] items-center gap-2 rounded-full border px-3 py-1.5 text-left text-xs font-bold transition ${
                    unavailable
                      ? 'cursor-not-allowed border-red-100 bg-red-50/60 text-red-400'
                      : excluded
                        ? 'border-gray-200 bg-gray-50 text-gray-400 line-through'
                        : 'border-brand bg-white hover:bg-brand-light/40'
                  }`}
                >
                  <span className={`grid h-4 w-4 place-items-center rounded-full border ${unavailable ? 'border-red-200 bg-white' : excluded ? 'border-gray-300' : 'border-brand-dark bg-brand-light'}`}>
                    {!excluded && <Check className="h-3 w-3 text-brand-dark" />}
                  </span>
                  <span className="min-w-0 truncate">{ingredient.name}</span>
                  <span>{formatAmount(ingredient.quantity)}{ingredient.unit ? ` ${ingredient.unit}` : ''}</span>
                  <span className="min-w-20 text-right">
                    {unavailable ? 'Out of stock' : hasPrices ? `${ingredient.price.toFixed(2)}/=` : '-'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-black text-brand-dark">Steps to Cook</h2>
          <ol className="space-y-2 text-sm font-semibold leading-relaxed text-black">
            {instructions.map((step, index) => (
              <li key={`${step}-${index}`} className="grid grid-cols-[1.7rem_1fr] gap-2">
                <span className="font-black text-brand-dark">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {nutrition && (
        <section className="mt-12">
          <h2 className="mx-auto flex max-w-xl items-center justify-center gap-3 rounded-xl border border-brand-dark/60 bg-white px-5 py-4 text-2xl font-black text-brand-dark underline shadow-[0_8px_20px_rgba(5,72,2,0.09)]">
            <Heart className="h-5 w-5 fill-brand-dark text-brand-dark" />
            Your Nutrition Count
          </h2>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <NutritionCard icon={<Flame />} label="Calories" value={`${Math.round(nutrition.calories || 0)} kcal`} />
            <NutritionCard icon={<Apple />} label="Protein" value={`${formatAmount(nutrition.protein || 0)} g`} />
            <NutritionCard icon={<Leaf />} label="Fiber" value={`${formatAmount(nutrition.fiber || 0)} g`} />
            <NutritionCard icon={<Wheat />} label="Carbs" value={`${formatAmount(nutrition.carbohydrate || 0)} g`} />
            <NutritionCard icon={<Droplets />} label="Fat" value={`${formatAmount(nutrition.fat || 0)} g`} />
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setCaloriesOpen((open) => !open)}
              className="hela-action-soft px-8 py-3 underline transition hover:scale-[1.02]"
              aria-expanded={caloriesOpen}
            >
              Check Your Calories &gt;&gt;&gt;
            </button>
          </div>

          <div className={`overflow-hidden transition-[max-height,opacity,margin] duration-500 ease-in-out ${caloriesOpen ? 'mt-8 max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-3">
              {caloriesRows.map((ingredient) => (
                <div key={`cal-${ingredient.id}-${ingredient.name}`} className="contents">
                  <div className="bg-brand-light border border-brand px-3 py-2 text-center text-xs font-bold">{ingredient.name}</div>
                  <div className="bg-brand-light border border-brand px-3 py-2 text-center text-xs font-bold">
                    {formatAmount(ingredient.quantity)} {ingredient.unit}
                  </div>
                  <div className="bg-brand-light border border-brand px-3 py-2 text-center text-xs font-bold">{ingredient.calories} kcal</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const UsersIcon = () => (
  <div className="mx-auto mb-2 grid h-5 w-5 place-items-center text-brand-dark">
    <Sprout className="h-5 w-5" />
  </div>
);

const NutritionCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="rounded-xl border border-brand-dark/70 bg-white px-5 py-7 text-center shadow-[0_8px_18px_rgba(5,72,2,0.08)]">
    <div className="mx-auto mb-3 h-7 w-7 text-brand-dark [&>svg]:h-7 [&>svg]:w-7">{icon}</div>
    <p className="text-sm font-black text-brand-dark">
      {label}: <span className="text-black">{value}</span>
    </p>
  </div>
);

export default RecipeDetail;
