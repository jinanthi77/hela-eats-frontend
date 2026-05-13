import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBag, Menu, User, LogOut, X, ClipboardList, CalendarDays, BarChart3, Store, Carrot, PackageSearch } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="bg-brand-light text-brand-dark shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <img src="/logo.png" alt="Hela Eats Logo" className="h-17 w-38 object-contain" />
            </Link>
          </div>

          {/* ── Desktop Nav ─────────────────────────────────────── */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              <Link to="/recipes" className="hover:text-brand transition-colors">Recipes</Link>
              <Link to="/categories" className="hover:text-brand transition-colors">Categories</Link>
              <Link to="/contact" className="hover:text-brand transition-colors">Contact Us</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/cart" className="hover:text-brand transition-colors relative">
                    <ShoppingBag className="h-6 w-6" />
                  </Link>
                  <Link to="/orders" className="hover:text-brand transition-colors" title="Orders">
                    <ClipboardList className="h-6 w-6" />
                  </Link>
                  {user?.role === 'user' && (
                    <>
                      <Link to="/mealplans" className="hover:text-brand transition-colors" title="Meal Plans">
                        <CalendarDays className="h-6 w-6" />
                      </Link>
                      <Link to="/pantry" className="hover:text-brand transition-colors" title="My Pantry">
                        <Carrot className="h-6 w-6" />
                      </Link>
                    </>
                  )}

                  {/* Admin link */}
                  {user?.role === 'admin' && (
                    <Link to="/admin/dashboard" className="hover:text-brand transition-colors" title="Admin Dashboard">
                      <BarChart3 className="h-5 w-5" />
                    </Link>
                  )}

                  {/* Vendor link */}
                  {user?.role === 'vendor' && (
                    <>
                      <Link to="/vendor/dashboard" className="hover:text-brand transition-colors" title="Vendor Dashboard">
                        <Store className="h-5 w-5" />
                      </Link>
                      <Link to="/vendor/orders" className="hover:text-brand transition-colors" title="Vendor Orders">
                        <PackageSearch className="h-5 w-5" />
                      </Link>
                    </>
                  )}

                  {/* User dropdown area */}
                  <div className="flex items-center space-x-3 pl-2 border-l border-brand/50">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 text-sm font-medium hover:text-brand transition-colors"
                      title={user?.name}
                    >
                      {user?.profilePicture?.url ? (
                        <img src={user.profilePicture.url} alt={user.name} className="h-8 w-8 rounded-full object-cover border border-brand-light" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-brand-light flex items-center justify-center">
                          <User className="h-4 w-4 text-brand-dark" />
                        </div>
                      )}
                      <span className="truncate max-w-[100px] hidden lg:block">{user?.name || 'Profile'}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 bg-brand-dark text-white hover:bg-brand-dark/80 px-3 py-1.5 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="flex items-center space-x-1 bg-white text-brand-dark hover:bg-brand-light px-4 py-1.5 rounded-full font-medium transition-colors shadow-sm">
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* ── Mobile Toggle ───────────────────────────────────── */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-brand-dark hover:text-brand transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-light border-t border-brand/30 animate-[slideDown_0.2s_ease]">
          <div className="px-4 py-4 space-y-2">
            <Link to="/recipes" onClick={closeMobile} className="block px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors">
              Recipes
            </Link>
            <Link to="/categories" onClick={closeMobile} className="block px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors">
              Categories
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/cart" onClick={closeMobile} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors">
                  <ShoppingBag className="h-4 w-4" /> Cart
                </Link>
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
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-brand/20 transition-colors text-red-600"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMobile}
                className="block text-center bg-white text-brand-dark hover:bg-brand-light px-4 py-2 rounded-full font-medium transition-colors mt-2"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
