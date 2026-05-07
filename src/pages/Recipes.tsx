import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getRecipes } from '../services/recipeService';
import { getCategories } from '../services/categoryService';
import type { Recipe, Category } from '../types';
import { Loader2, Search, Clock, Flame, UtensilsCrossed, X } from 'lucide-react';
import { CardGridSkeleton } from '../components/LoadingSkeleton';

const Recipes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recipeData, catData] = await Promise.all([
          getRecipes({ search: searchTerm || undefined, category: selectedCategory || undefined }),
          getCategories(),
        ]);
        setRecipes(recipeData);
        setCategories(catData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch recipes');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTerm, selectedCategory]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set('search', value);
    else params.delete('search');
    setSearchParams(params, { replace: true });
  };

  const handleCategoryFilter = (catId: string) => {
    const newCat = selectedCategory === catId ? '' : catId;
    setSelectedCategory(newCat);
    const params = new URLSearchParams(searchParams);
    if (newCat) params.set('category', newCat);
    else params.delete('category');
    setSearchParams(params, { replace: true });
  };

  if (error) return (
    <div className="min-h-[50vh] flex items-center justify-center flex-col space-y-4">
      <p className="text-red-500 font-medium text-lg">{error}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-brand-light text-brand-dark rounded-lg hover:bg-brand-light/70 transition-colors">Try Again</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Explore Recipes</h1>
          <p className="text-gray-500 mt-1">Find the perfect dish for your next meal</p>
        </div>
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search recipes..."
            className="pl-10 pr-10 py-2 w-full md:w-72 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-sm"
          />
          {searchTerm && (
            <button onClick={() => handleSearch('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button key={cat._id} onClick={() => handleCategoryFilter(cat._id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${selectedCategory === cat._id
                ? 'bg-brand-dark text-white border-brand-dark shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-light hover:text-brand'}`}>
              {cat.name}
            </button>
          ))}
          {selectedCategory && (
            <button onClick={() => handleCategoryFilter('')}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-all flex items-center gap-1">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      )}

      {loading ? (
        <CardGridSkeleton count={8} />
      ) : recipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <UtensilsCrossed className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No recipes found{searchTerm ? ` for "${searchTerm}"` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <Link key={recipe._id} to={`/recipes/${recipe._id}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                {recipe.imageUrl || recipe.image ? (
                  <img src={recipe.imageUrl || recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-brand-light/30">
                    <UtensilsCrossed className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-brand-dark shadow-sm">
                  {recipe.difficulty}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-brand transition-colors">{recipe.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{recipe.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-50 pt-4 mt-auto">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Prep: {recipe.prepTime}m</span>
                  <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" /> Cook: {recipe.cookTime}m</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recipes;
