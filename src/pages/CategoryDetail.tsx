import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCategoryBySlug } from '../services/categoryService';
import type { Category, Recipe } from '../types';
import { ArrowLeft, Loader2, Clock, Flame, UtensilsCrossed } from 'lucide-react';

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getCategoryBySlug(slug);
        setCategory(data.category || data);
        setRecipes(data.recipes || []);
      } catch { setError('Failed to load category'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [slug]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
    </div>
  );

  if (error || !category) return (
    <div className="min-h-[60vh] flex items-center justify-center flex-col space-y-4">
      <p className="text-red-500 font-medium text-lg">{error || 'Category not found'}</p>
      <button onClick={() => navigate('/categories')} className="px-6 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">Back to Categories</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/categories')} className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 mb-6 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">All Categories</span>
      </button>

      <div className="relative rounded-3xl overflow-hidden mb-10 shadow-xl">
        <div className="h-48 md:h-64 bg-gradient-to-br from-orange-400 to-red-500 relative">
          {(category.imageUrl || category.image) && <img src={category.imageUrl || category.image} alt={category.name} className="w-full h-full object-cover opacity-40" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{category.name}</h1>
            <p className="text-white/80 text-base max-w-2xl">{category.description}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">Recipes <span className="text-sm font-normal text-gray-400 ml-2">({recipes.length})</span></h2>

      {recipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <UtensilsCrossed className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No recipes in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <Link key={recipe._id} to={`/recipes/${recipe._id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                {recipe.imageUrl || recipe.image ? (
                  <img src={recipe.imageUrl || recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-orange-50"><UtensilsCrossed className="h-12 w-12" /></div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-orange-600 shadow-sm">{recipe.difficulty}</div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-orange-600 transition-colors">{recipe.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{recipe.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-50 pt-4">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {recipe.prepTime}m</span>
                  <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" /> {recipe.cookTime}m</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
