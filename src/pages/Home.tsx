import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes } from '../services/recipeService';
import { getCategories } from '../services/categoryService';
import type { Recipe, Category } from '../types';
import {
  Utensils, List, ShoppingCart, UserCheck, Clock, Flame,
  UtensilsCrossed, ArrowRight, Loader2, ChefHat,
  Mail
} from 'lucide-react';

const Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipeData, catData] = await Promise.all([
          getRecipes(),
          getCategories(),
        ]);
        setRecipes((recipeData || []).slice(0, 8));
        setCategories((catData || []).slice(0, 6));
      } catch {
        // Silently fail — Home still usable without data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero Section ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-16 animate-fade-in-up">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-dark">Hela Eats</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover authentic Sri Lankan recipes, order ingredients directly, and plan your meals effortlessly.
          </p>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Link to="/recipes" className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-light flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-brand-light text-brand-dark rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Utensils className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Browse Recipes</h3>
            <p className="text-gray-500 text-sm">Explore a wide variety of delicious meals curated just for you.</p>
          </Link>

          <Link to="/categories" className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-light flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <List className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Categories</h3>
            <p className="text-gray-500 text-sm">Find exactly what you're craving by browsing through our categories.</p>
          </Link>

          <Link to="/cart" className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-light flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-brand-light text-brand rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Your Cart</h3>
            <p className="text-gray-500 text-sm">Manage your selected ingredients and proceed to checkout easily.</p>
          </Link>

          <Link to="/login" className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-light flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UserCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">User Account</h3>
            <p className="text-gray-500 text-sm">Sign in to save your favorite recipes and track your orders.</p>
          </Link>
        </div>

        {/* ── Explore Categories ────────────────────────────────── */}
        {categories.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
              <Link to="/categories" className="text-brand hover:text-brand-dark font-medium text-sm flex items-center gap-1 transition-colors">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link key={cat._id} to={`/categories/${cat.slug}`}
                  className="group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-light transition-all text-center">
                  {(cat as any).imageUrl ? (
                    <img src={(cat as any).imageUrl} alt={cat.name} className="h-16 w-16 mx-auto rounded-xl object-cover mb-3 group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="h-16 w-16 mx-auto rounded-xl bg-brand-light/50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <ChefHat className="h-8 w-8 text-brand" />
                    </div>
                  )}
                  <p className="font-bold text-gray-900 text-sm group-hover:text-brand transition-colors">{cat.name}</p>
                  {cat.recipeCount != null && (
                    <p className="text-xs text-gray-400 mt-1">{cat.recipeCount} recipes</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Explore Recipes ──────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Explore Recipes</h2>
            <Link to="/recipes" className="text-brand hover:text-brand-dark font-medium text-sm flex items-center gap-1 transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-brand animate-spin" />
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <UtensilsCrossed className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No recipes available yet.</p>
              <p className="text-gray-400 text-sm mt-1">Check back soon for delicious meals!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <Link key={recipe._id} to={`/recipes/${recipe._id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {recipe.imageUrl || recipe.image ? (
                      <img src={recipe.imageUrl || recipe.image} alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Prep: {recipe.prepTime || 0}m</span>
                      <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" /> Cook: {recipe.cookTime || 0}m</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── About Us ──────────────────────────────────── */}
        <div className="mt-32 mb-20 text-center px-4">
          <h2 className="text-6xl font-bold text-brand-dark mb-6 font-heading">HelaEats</h2>
          <h3 className="text-xl font-bold text-brand-dark mb-8 max-w-4xl mx-auto leading-relaxed">
            Personalized Recipe-to-Cart Platform, Automating Grocery Shopping and Healthy Meal Preparation
          </h3>
          <div className="max-w-5xl mx-auto text-black space-y-2 text-[17px] font-medium leading-relaxed">
            <p>
              We are students at SLTC doing their final project to help young Sri Lankan to cook traditional meals in
              a healthy and convenient way, while also enabling online grocery shopping.
            </p>
            <p>
              We are addressing Struggle Of Finding Authentic Sri Lankan Recipes Without Vague Instructions, Lack
              Of Time Due To The Busy Schedule, Food Waste From Bulk Shopping, And Limited Nutrition Information
              In The Application.
            </p>
            <p className="pt-2">
              We are here to help you with your day to day life in a tasty and healthy way
            </p>
          </div>
        </div>

        <div className="mb-24 text-center px-4">
          <h2 className="text-3xl font-bold text-brand-dark mb-3">Be a part of the Our Community</h2>
          <h3 className="text-2xl font-bold text-black mb-12">Join As a Trusted Vendor or Be an Excellent Delivery Person</h3>

          <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-left max-w-5xl mx-auto">
            <div className="md:w-1/2 space-y-6">
              <h4 className="text-xl font-bold text-black">Why you should join us?</h4>
              <p className="text-black font-medium leading-relaxed text-[17px]">
                Joining with our community enhance your business with more easily and it is anew way to make profits with your
                business and profit more than you earn by only doing one business.
              </p>
              <div className="flex items-center gap-4 mt-12">
                <div className="w-10 h-10 rounded-full border-2 border-brand-dark flex items-center justify-center text-brand-dark">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="font-bold text-[15px] text-black">Email: helaeatsvendor@gmail.com</span>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-end">
              <img src="/The Little Things - Business Planning.png" alt="Community Illustration" className="w-[450px] max-w-full h-auto object-contain" />
            </div>
          </div>
        </div>

        {/* ── Contact Us ──────────────────────────────────── */}
        <div className="mb-16 max-w-5xl mx-auto px-4">
          <h3 className="text-xl font-bold text-black mb-10">Contact Us</h3>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <span className="font-bold text-[15px] text-black">Email: helaeats@gmail.com</span>
              <div className="w-12 h-12 rounded-full border-2 border-brand-dark flex items-center justify-center text-brand-dark hover:bg-brand-light/50 transition-colors cursor-pointer">
                <Mail className="h-5 w-5" />
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-4">
              <span className="font-bold text-[15px] text-black">Hotline: +94 77 421 35 04</span>
              <div className="w-12 h-12 rounded-full border-2 border-brand-dark flex items-center justify-center text-brand-dark hover:bg-brand-light/50 transition-colors cursor-pointer">
                <img src="https://www.svgrepo.com/show/469455/phone.svg" alt="phone" className="h-6 w-6" />
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-4">
              <span className="font-bold text-[15px] text-black">Facebook</span>
              <div className="w-12 h-12 rounded-full border-2 border-brand-dark flex items-center justify-center text-brand-dark hover:bg-brand-light/30 transition-colors cursor-pointer">
                <img src="https://www.svgrepo.com/show/303117/facebook-2-logo.svg" alt="facebook" className="h-6 w-6" />
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-4">
              <span className="font-bold text-[15px] text-black">Instagram</span>
              <div className="w-12 h-12 rounded-full border-2 border-brand-dark flex items-center justify-center text-brand-dark hover:bg-brand-light/30 transition-colors cursor-pointer">
                <img src="https://www.svgrepo.com/show/452229/instagram-1.svg" alt="instagram" className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
