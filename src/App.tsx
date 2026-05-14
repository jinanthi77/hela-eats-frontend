import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// ─── Pages ───────────────────────────────────────────────────────────
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthSuccess from "./pages/AuthSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetail from "./pages/OrderDetail";
import PaymentSuccess from "./pages/PaymentSuccess";
import MealPlansPage from "./pages/MealPlansPage";
import MealPlanDetail from "./pages/MealPlanDetail";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCategories from "./pages/AdminCategories";
import AdminRecipes from "./pages/AdminRecipes";
import AdminOrders from "./pages/AdminOrders";
import AdminVendorRequests from "./pages/AdminVendorRequests";
import AdminApprovals from "./pages/AdminApprovals";
import VendorDashboard from "./pages/VendorDashboard";
import VendorOrders from "./pages/VendorOrders";
import PantryPage from "./pages/PantryPage";

// Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-white flex flex-col font-body">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* ── Public Routes ─────────────────────────────── */}
                  <Route path="/" element={<Home />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/recipes/:id" element={<RecipeDetail />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route
                    path="/categories/:slug"
                    element={<CategoryDetail />}
                  />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                  />
                  <Route path="/auth/success" element={<AuthSuccess />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />

                  {/* ── Protected Routes ──────────────────────────── */}
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <ProtectedRoute>
                        <OrderDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mealplans"
                    element={
                      <ProtectedRoute>
                        <MealPlansPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mealplans/:id"
                    element={
                      <ProtectedRoute>
                        <MealPlanDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pantry"
                    element={
                      <ProtectedRoute>
                        <PantryPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Admin Routes ──────────────────────────────── */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/categories"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminCategories />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/recipes"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminRecipes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/vendor-requests"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminVendorRequests />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/approvals"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminApprovals />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Vendor Routes ──────────────────────────────── */}
                  <Route
                    path="/vendor/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["vendor"]}>
                        <VendorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vendor/orders"
                    element={
                      <ProtectedRoute allowedRoles={["vendor"]}>
                        <VendorOrders />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>

              <footer className="bg-brand-light border-t border-brand/20 flex items-center py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-700 text-sm">
                  <img
                    src="/logo22.png"
                    alt="Hela Eats Logo"
                    className="h-22 w-22 object-contain mx-auto mb-3"
                  />
                  &copy; {new Date().getFullYear()} Hela Eats. All rights reserved.
                  <p className="text-gray-700">
                    Developed by: Nilupul, Udara, Jinanthi, Dilshika
                  </p>
                </div>
              </footer>
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
