import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes } from '../services/recipeService';
import { getCategories } from '../services/categoryService';
import type { Recipe, Category } from '../types';
import { UtensilsCrossed, ArrowRight, Loader2, ChefHat, Mail, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Carousel state and refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMoved, setDragMoved] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate the width of one card so exactly 4 fit in the viewport
  const GAP = 24; // gap-6 = 24px
  const getCardWidth = () => {
    if (!scrollRef.current) return 300;
    return (scrollRef.current.clientWidth - GAP * 3) / 4;
  };

  useEffect(() => {
    if (isHovered || isDragging) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const cardW = getCardWidth() + GAP;
        const { scrollLeft: sl, scrollWidth, clientWidth } = scrollRef.current;
        if (sl + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollTo({ left: sl + cardW, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, isDragging]);

  const startDragging = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragMoved(false);
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const stopDragging = () => {
    setIsDragging(false);
    setTimeout(() => setDragMoved(false), 50);
  };

  const onDrag = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    setDragMoved(true);
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollLeftBtn = () => {
    if (scrollRef.current) {
      const cardW = getCardWidth() + GAP;
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollLeft - cardW, behavior: 'smooth' });
    }
  };

  const scrollRightBtn = () => {
    if (scrollRef.current) {
      const cardW = getCardWidth() + GAP;
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollLeft + cardW, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipeData, catData] = await Promise.all([
          getRecipes(),
          getCategories(),
        ]);
        setRecipes((recipeData || []).slice(0, 9));
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

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-12 w-12 text-brand animate-spin" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm mb-16">
            <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl font-medium">No recipes available yet.</p>
            <p className="text-gray-400 mt-2">Check back soon for delicious meals!</p>
          </div>
        ) : (
          <>
            {/* ── Trending Recipes ──────────────────────────────────── */}
            <div className="mb-16">
              <h2 className="text-[32px] font-bold text-brand-dark mb-6 font-heading">Trending Recipes</h2>
              <div className="flex items-center gap-4 relative">
                <button 
                  onClick={scrollLeftBtn}
                  className="hidden sm:flex w-10 h-10 rounded-full bg-[#e8f3ee] items-center justify-center text-brand-dark hover:bg-[#d1e8dd] transition-colors shrink-0"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div 
                  ref={scrollRef}
                  onMouseDown={startDragging}
                  onMouseLeave={() => { setIsHovered(false); stopDragging(); }}
                  onMouseUp={stopDragging}
                  onMouseMove={onDrag}
                  onMouseEnter={() => setIsHovered(true)}
                  className="flex gap-6 overflow-x-auto scrollbar-hide snap-x scroll-smooth flex-1 cursor-grab active:cursor-grabbing pb-4 pt-1"
                  style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                >
                  {recipes.map((recipe) => (
                    <Link 
                      key={recipe._id} 
                      to={`/recipes/${recipe._id}`} 
                      onClick={(e) => dragMoved && e.preventDefault()}
                      className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group snap-start shrink-0 pointer-events-auto"
                      style={{ width: 'calc((100% - 72px) / 4)' }}
                      draggable={false}
                    >
                      <div className="p-3 pb-0 pointer-events-none">
                        {recipe.imageUrl || recipe.image ? (
                          <img src={recipe.imageUrl || recipe.image} alt={recipe.title} className="w-full h-[220px] object-cover rounded-[14px] group-hover:scale-[1.02] transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-[220px] flex items-center justify-center text-gray-400 bg-brand-light/30 rounded-[14px]">
                            <UtensilsCrossed className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1 pointer-events-none">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className="text-[15px] font-bold text-gray-800">{recipe.ratingSummary?.averageRating || 4.8}</span>
                          <div className="flex text-brand-dark">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 leading-snug group-hover:text-brand transition-colors line-clamp-2">
                          {recipe.title}
                        </h3>
                        <div className="mt-auto flex flex-col items-start gap-2">
                          <span className={`text-[11px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wide ${(recipe.difficulty || 'EASY').toUpperCase() === 'EASY' ? 'bg-[#e8f3ee] text-brand-dark' :
                              (recipe.difficulty || 'EASY').toUpperCase() === 'MEDIUM' ? 'bg-[#fff0e6] text-[#e67e22]' :
                                'bg-red-50 text-red-700'
                            }`}>
                            {recipe.difficulty || 'EASY'}
                          </span>
                          <span className="text-[14px] font-bold text-gray-800">
                            Cook Time: {recipe.cookTime || 20} min
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <button 
                  onClick={scrollRightBtn}
                  className="hidden sm:flex w-10 h-10 rounded-full bg-[#e8f3ee] items-center justify-center text-brand-dark hover:bg-[#d1e8dd] transition-colors shrink-0"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* ── Explore Categories ────────────────────────────────── */}
            {categories.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[32px] font-bold text-brand-dark font-heading">Explore Categories</h2>
                  <Link to="/categories" className="text-brand hover:text-brand-dark font-bold text-[15px] flex items-center gap-1 transition-colors">
                    View All <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                  {categories.map((cat) => (
                    <Link key={cat._id} to={`/categories/${cat.slug}`}
                      className="group bg-white rounded-[20px] p-5 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-xl hover:border-brand-light transition-all duration-300 flex flex-col items-center text-center">
                      {(cat as any).imageUrl ? (
                        <img src={(cat as any).imageUrl} alt={cat.name} className="h-[84px] w-[84px] rounded-[16px] object-cover mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm" />
                      ) : (
                        <div className="h-[84px] w-[84px] rounded-[16px] bg-[#e8f3ee] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <ChefHat className="h-10 w-10 text-brand-dark" />
                        </div>
                      )}
                      <p className="font-bold text-gray-900 text-[15px] group-hover:text-brand transition-colors leading-tight">{cat.name}</p>
                      {cat.recipeCount != null && (
                        <p className="text-[13px] font-semibold text-gray-400 mt-2">{cat.recipeCount} recipes</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

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
