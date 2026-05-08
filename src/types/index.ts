// ─── User Types ──────────────────────────────────────────────────────
export interface Address {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district?: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface HealthProfile {
  dietaryPreference: 'None' | 'Fitness' | 'Low-Glycemic' | 'Vegetarian' | 'Vegan';
  allergies: string[];
}

export interface PantryItem {
  ingredientId: {
    _id: string;
    name: string;
    baseUnit: string;
    isStaple?: boolean;
  };
  addedAt: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'vendor';
  phone?: string;
  addresses?: Address[];
  healthProfile?: HealthProfile;
  pantry?: PantryItem[];
  profilePicture?: { url: string; publicId: string };
}

// ─── Auth Response Types ─────────────────────────────────────────────
export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'vendor';
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface GoogleTokenPayload {
  idToken?: string;
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}

// ─── Recipe Types ────────────────────────────────────────────────────
export interface Recipe {
  _id: string;
  title: string;
  description: string;
  category?: { _id: string; name: string; slug: string } | string;
  ingredients: RecipeIngredient[];
  instructions?: string[];
  steps?: { stepNumber: number; instruction: string }[];
  servings?: number;
  standardServingSize?: number;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  tags?: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbohydrate: number;
    fiber: number;
    fat: number;
  };
  nutritionPerStandardServing?: {
    calories: number;
    protein: number;
    carbohydrate: number;
    fiber: number;
    fat: number;
  };
  image?: string;
  imageUrl?: string;
  ratingSummary?: {
    averageRating: number;
    totalRatings: number;
  };
  _customIngredients?: { name: string; quantity: number; unit: string }[];
}

export interface RecipeIngredient {
  ingredientId?: string | { _id: string; name: string; baseUnit: string; isStaple?: boolean };
  name?: string;
  quantity?: number;
  exactQuantity?: number;
  unit: string;
  price?: number;
}

// ─── Category Types ──────────────────────────────────────────────────
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  imageUrl?: string;
  recipeCount?: number;
}

// ─── Cart Types (matches backend Cart model) ─────────────────────────
export interface SelectedIngredient {
  ingredientId: string | { _id: string; name: string; baseUnit: string };
  vendorInventoryId?: string | { _id: string; packageWeight: number; unit: string; price: number };
  quantity: number;
  unit: string;
  price: number;
  isReadyToCook: boolean;
}

export interface CartItem {
  _id: string;
  recipeId: string | { _id: string; title: string; category?: string; imageUrl?: string; standardServingSize?: number };
  servings: number;
  isMealKit: boolean;
  excludedIngredients: string[];
  selectedIngredients: SelectedIngredient[];
  itemTotal: number;
  // Legacy aliases used by some components
  recipe?: Recipe;
  ingredients?: RecipeIngredient[];
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

// ─── Order Types (matches backend Order model — PascalCase statuses) ──
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'OutForDelivery' | 'Delivered' | 'Cancelled';
export type PaymentMethodType = 'Card' | 'COD';
export type PaymentStatusType = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderIngredient {
  vendorInventoryId: string;
  ingredientId?: string | { _id: string; name: string; baseUnit: string };
  ingredientName?: string;
  scaledQuantity: number;
  unit?: string;
  priceCalculated: number;
}

export interface OrderItem {
  recipeId?: string | { _id: string; title: string; category?: string };
  recipeTitle?: string;
  servings: number;
  ingredients: OrderIngredient[];
  itemTotal: number;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  orderNumber?: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatusType;
  status: OrderStatus;
  statusHistory?: { status: string; changedAt: string; note?: string }[];
  deliveryAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district?: string;
    postalCode?: string;
  };
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  paymentTransactionId?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Payment Types (matches backend Payment model — PascalCase) ──────
export interface Payment {
  _id: string;
  orderId: string;
  userId: string;
  method: PaymentMethodType;
  amount: number;
  currency: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Refunded';
  transactionId?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  collectedAt?: string;
  collectedBy?: string;
  failureReason?: string;
  createdAt?: string;
}

// ─── Meal Plan Types (matches backend MealPlan model) ────────────────
export interface MealPlanRecipe {
  recipeId: string | Recipe;
  servings: number;
}

export interface MealPlanDay {
  _id?: string;
  date: string;
  recipes: MealPlanRecipe[];
  totalDailyNutrition?: {
    calories: number;
    protein: number;
    carbohydrate: number;
    fiber: number;
    fat: number;
  };
}

export interface MealPlan {
  _id: string;
  userId: string;
  title: string;
  startDate: string;
  endDate: string;
  days: MealPlanDay[];
  createdAt?: string;
  updatedAt?: string;
}

// ─── Vendor Types ────────────────────────────────────────────────────
export interface VendorInventoryItem {
  _id: string;
  ingredientId: { _id: string; name: string; baseUnit: string };
  vendorId: { _id: string; name: string; email: string };
  price: number;
  stockQuantity: number;
  packageWeight: number;
  unit: string;
  isReadyToCook: boolean;
}

export interface RestockRequestItem {
  ingredientId: { _id: string; name: string };
  requestedQuantity: number;
  unit: string;
}

export interface RestockRequest {
  _id: string;
  adminId: { _id: string; name: string };
  vendorId: { _id: string; name: string; email: string };
  items: RestockRequestItem[];
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Fulfilled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
