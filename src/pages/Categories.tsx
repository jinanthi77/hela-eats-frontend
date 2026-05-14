import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/categoryService';
import type { Category } from '../types';
import { CardGridSkeleton } from '../components/LoadingSkeleton';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (error) return (
    <div className="min-h-[50vh] flex items-center justify-center flex-col space-y-4">
      <p className="text-red-500 font-medium text-lg">{error}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-brand-light text-brand-dark rounded-lg hover:bg-brand-light transition-colors">Try Again</button>
    </div>
  );

  return (
    <div className="hela-shell py-10 sm:py-14">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="hela-display text-4xl sm:text-5xl font-bold mb-4">Recipe Categories</h1>
        <p className="text-gray-600 text-base sm:text-lg font-medium">Browse our collection of recipes by category to find exactly what you're in the mood for.</p>
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : categories.length === 0 ? (
        <div className="text-center py-16 hela-card">
          <p className="text-gray-500 text-lg">No categories available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category) => (
            <Link key={category._id} to={`/categories/${category.slug}`}
              className="group cursor-pointer hela-card overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="h-48 sm:h-52 bg-gray-100 relative overflow-hidden">
                {category.imageUrl || category.image ? (
                  <img src={category.imageUrl || category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-light to-red-50 text-brand group-hover:scale-105 transition-transform duration-500">
                    <span className="text-4xl font-bold opacity-50">{category.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-medium">View Recipes &rarr;</span>
                </div>
              </div>
              <div className="p-5 flex-1">
                <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2 group-hover:text-brand transition-colors">{category.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
