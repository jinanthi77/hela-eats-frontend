import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCategories } from '../services/categoryService';
import type { Category } from '../types';
import {
  BarChart3,
  CalendarDays,
  Carrot,
  ClipboardList,
  LogOut,
  Menu,
  PackageSearch,
  Search,
  ShoppingBag,
  Store,
  User,
  X,
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const selectedCategory = new URLSearchParams(location.search).get('category');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);
  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setMobileOpen(false);
    navigate(`/recipes?search=${encodeURIComponent(query)}`);
  };

  const navLinkClass = (path: string) =>
    `relative px-2 py-1 text-base xl:text-lg font-bold font-heading transition-colors ${
      isActive(path) ? 'text-brand-dark' : 'text-black hover:text-brand-dark'
    } after:absolute after:left-2 after:right-2 after:-bottom-1 after:h-1 after:rounded-full after:bg-brand-dark after:transition-opacity ${
      isActive(path) ? 'after:opacity-100' : 'after:opacity-0'
    }`;

  return (
    <nav className="text-brand-dark sticky top-0 z-50 bg-white">
      <div className="bg-white rounded-b-[18px] shadow-[0_10px_24px_rgba(5,72,2,0.08)]">
        <div className="hela-shell">
          <div className="flex items-center justify-between gap-4 py-3 lg:py-3.5">
            <Link to="/" className="flex items-center hover:opacity-90 transition-opacity shrink-0">
              <img
                src="/logo22.png"
                alt="Hela Eats Logo"
                className="h-12 w-32 sm:h-14 sm:w-36 lg:h-16 lg:w-40 object-contain"
              />
            </Link>

            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-3xl xl:max-w-4xl items-center gap-3 px-5 py-2.5 hela-outline-control"
            >
              <button type="submit" className="shrink-0 text-brand-dark" aria-label="Search recipes">
                <Search className="h-5 w-5" />
              </button>
              <input
                type="search"
                placeholder="Search Here"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search recipes"
                enterKeyHint="search"
                className="w-full bg-transparent outline-none text-sm font-semibold placeholder:text-gray-300"
              />
            </form>

            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    className="h-10 w-10 rounded-full border-2 border-brand-dark flex items-center justify-center hover:bg-brand-light transition-colors"
                    title="Cart"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/orders"
                    className="h-10 w-10 rounded-full border-2 border-brand-dark flex items-center justify-center hover:bg-brand-light transition-colors"
                    title="Orders"
                  >
                    <ClipboardList className="h-4 w-4" />
                  </Link>
                  {user?.role === 'user' && (
                    <>
                      <Link
                        to="/mealplans"
                        className="h-10 w-10 rounded-full border-2 border-brand-dark flex items-center justify-center hover:bg-brand-light transition-colors"
                        title="Meal Plans"
                      >
                        <CalendarDays className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/pantry"
                        className="h-10 w-10 rounded-full border-2 border-brand-dark flex items-center justify-center hover:bg-brand-light transition-colors"
                        title="My Pantry"
                      >
                        <Carrot className="h-4 w-4" />
                      </Link>
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="h-10 w-10 rounded-full border-2 border-brand-dark flex items-center justify-center hover:bg-brand-light transition-colors"
                      title="Admin Dashboard"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Link>
                  )}
                  {user?.role === 'vendor' && (
                    <>
                      <Link
                        to="/vendor/dashboard"
                        className="h-10 w-10 rounded-full border-2 border-brand-dark flex items-center justify-center hover:bg-brand-light transition-colors"
                        title="Vendor Dashboard"
                      >
                        <Store className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/vendor/orders"
                        className="h-10 w-10 rounded-full border-2 border-brand-dark flex items-center justify-center hover:bg-brand-light transition-colors"
                        title="Vendor Orders"
                      >
                        <PackageSearch className="h-4 w-4" />
                      </Link>
                    </>
                  )}
                  <Link to="/profile" title={user?.name} className="shrink-0">
                    {user?.profilePicture?.url ? (
                      <img
                        src={user.profilePicture.url}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-brand-dark"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-brand-light flex items-center justify-center border-2 border-brand-dark">
                        <User className="h-4 w-4 text-brand-dark" />
                      </div>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 border-2 border-brand-dark text-brand-dark hover:bg-brand-light px-5 py-2 rounded-xl font-extrabold transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center border-2 border-brand-dark text-brand-dark hover:bg-brand-light px-8 py-2 rounded-xl font-extrabold transition-colors shadow-sm"
                >
                  Sign In
                </Link>
              )}
            </div>

            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="h-11 w-11 rounded-full border-2 border-brand-dark text-brand-dark hover:bg-brand-light transition-colors flex items-center justify-center"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          <form onSubmit={handleSearchSubmit} className="pb-3 md:hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 hela-outline-control">
              <button type="submit" className="shrink-0 text-brand-dark" aria-label="Search recipes">
                <Search className="h-5 w-5" />
              </button>
              <input
                type="search"
                placeholder="Search Here"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search recipes"
                enterKeyHint="search"
                className="w-full bg-transparent outline-none text-sm font-semibold placeholder:text-gray-300"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:block bg-brand-light">
        <div className="hela-shell flex items-center justify-end gap-10 py-3">
          <Link to="/" className={navLinkClass('/')}>Home</Link>
          <Link to="/recipes" className={navLinkClass('/recipes')}>Recipes</Link>
          <Link to="/cart" className={navLinkClass('/cart')}>Cart</Link>
          <Link to="/checkout" className={navLinkClass('/checkout')}>Purchase</Link>
        </div>
      </div>

      <div className="hidden lg:block bg-brand shadow-[0_12px_26px_rgba(5,72,2,0.25)] rounded-b-[18px]">
        <div className="hela-shell flex items-center gap-8 overflow-x-auto py-3.5">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/recipes?category=${encodeURIComponent(category._id)}`}
              className={`shrink-0 font-heading text-lg font-bold transition-colors ${
                selectedCategory === category._id
                  ? 'text-brand-light underline decoration-4 underline-offset-8'
                  : 'text-white hover:text-brand-light'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-brand-light border-t border-brand/30 animate-[slideDown_0.2s_ease] max-h-[calc(100vh-8rem)] overflow-y-auto shadow-lg">
          <div className="px-4 py-4 space-y-2">
            <Link to="/" onClick={closeMobile} className="block px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors font-bold">
              Home
            </Link>
            <Link to="/recipes" onClick={closeMobile} className="block px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors">
              Recipes
            </Link>
            <Link to="/categories" onClick={closeMobile} className="block px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors">
              Categories
            </Link>
            <Link to="/cart" onClick={closeMobile} className="block px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors">
              Cart
            </Link>
            <Link to="/contact" onClick={closeMobile} className="block px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors">
              Contact Us
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/orders" onClick={closeMobile} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors">
                  <ClipboardList className="h-4 w-4" /> Orders
                </Link>
                {user?.role === 'user' && (
                  <>
                    <Link to="/mealplans" onClick={closeMobile} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors">
                      <CalendarDays className="h-4 w-4" /> Meal Plans
                    </Link>
                    <Link to="/pantry" onClick={closeMobile} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors">
                      <Carrot className="h-4 w-4" /> My Pantry
                    </Link>
                  </>
                )}
                <Link to="/profile" onClick={closeMobile} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors">
                  {user?.profilePicture?.url ? (
                    <img src={user.profilePicture.url} alt={user.name} className="h-5 w-5 rounded-full object-cover" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  {user?.name || 'Profile'}
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" onClick={closeMobile} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors text-brand-dark font-medium">
                    <BarChart3 className="h-4 w-4" /> Admin Dashboard
                  </Link>
                )}
                {user?.role === 'vendor' && (
                  <>
                    <Link to="/vendor/dashboard" onClick={closeMobile} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors text-brand-dark font-medium">
                      <Store className="h-4 w-4" /> Vendor Dashboard
                    </Link>
                    <Link to="/vendor/orders" onClick={closeMobile} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors text-brand-dark font-medium">
                      <PackageSearch className="h-4 w-4" /> Vendor Orders
                    </Link>
                  </>
                )}
                <div className="border-t border-brand/30 pt-2 mt-2">
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors text-red-600">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMobile}
                className="block text-center bg-white text-brand-dark hover:bg-brand-light px-4 py-2 rounded-full font-bold transition-colors mt-2"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
