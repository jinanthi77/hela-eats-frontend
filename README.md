# 🍳 Hela Eats Frontend

Hela Eats is a personalized **Recipe-to-Cart Platform** designed to solve authentic Sri Lankan recipe discovery, meal planning, and automated ingredient shopping. Developed by students at SLTC, this React Single Page Application (SPA) allows users to explore traditional dishes, scale ingredients dynamically based on portion sizes, manage their personal pantries, schedule weekly meal plans, and checkout consolidated ingredient lists sourced from approved local vendors.

---

## 🎨 Design & Aesthetics
* **Theme & Layout**: Responsive shell layout with tailored color palettes, styled using Vanilla CSS and Tailwind CSS.
* **Animations**: Fluid page transitions, card hover animations, interactive hero sliders, and custom notification systems.
* **Component Framework**: Enhanced with premium icons from `lucide-react`, lazy loading skeleton loaders, and full mobile optimization.

---

## 🔑 Key Features by User Role

### 1. Customer Features
* **Interactive Home Page**:
  * Dynamic hero slider showcasing cycling platform capabilities (*Calorie Counter*, *Recipe Master*, *Cart Automation*).
  * Auto-play trending recipes carousel with average ratings, cooking times, and difficulty badges.
  * Real-time customer reviews and testimonial feedback cards.
  * Embedded support channels (Hotline, Email, Social Media links).
* **Recipe Explorer**:
  * Global text search and category-specific filtering.
  * Recipe cards displaying ratings, difficulty badges, and active cook times.
  * Numeric pagination with dynamic sizing and smooth scroll-to-top transition.
* **Interactive Recipe Details**:
  * Servings multiplier that dynamically scales ingredient quantities and prices.
  * Nutritional profile dashboard (Calories, Protein, Carbohydrates, Fat, and Fiber per serving).
  * Step-by-step cooking instructions.
  * Ingredient checkbox list, allowing users to add select items or the entire recipe to the cart.
* **Weekly Meal Planner**:
  * Calendar-based interface to assign recipes to breakfast, lunch, and dinner slots.
  * Consolidated daily/weekly nutritional tracking.
  * One-click cart import to batch-buy all ingredients required for planned meals.
* **Pantry Manager**:
  * Digital inventory tracking for ingredients already available at home.
  * Real-time expiration date alerts.
  * Smart recipe matching: recipe ingredients are cross-referenced with pantry stock, automatically subtracting owned ingredients from the shopping cart.
* **Smart Shopping Cart & Checkout**:
  * Consolidates identical ingredients and sorts them by vendor.
  * Displays itemized breakdown of quantities, unit prices, and vendor-specific totals.
  * Shipping address forms, contact info entry, and checkout selection (e.g., cash on delivery, card).
* **Profile & Authentication**:
  * Email-based signup/login, Google OAuth, and secure password recovery.
  * Customer profile management and personal order history tracking.

### 2. Vendor Features
* **Inventory Control**:
  * Add ingredients (raw or pre-chopped/cleaned ready-to-cook items) with price, package weight, units, and initial stock quantities.
  * Monitor item approval states (*Pending*, *Approved*, *Rejected* with custom admin notes).
* **Restock Request Fulfillment**:
  * Receive and process supply request tickets created by platform administrators.
  * Selectively transition request statuses (*Accepted*, *Rejected*, *Fulfilled*).
* **Order Delivery Manager**:
  * Display orders assigned to the vendor, along with customer shipping addresses, phone numbers, and scaled ingredient portions.

### 3. Administrator Features
* **Dashboard & Business Analytics**:
  * At-a-glance KPI metrics (Total Users, Orders, Revenue in LKR, Active Recipes).
  * Order status breakdown dashboard.
  * Top-performing recipes report showing ordered frequency and revenue contributions.
* **Vendor Submissions Approval**:
  * Single or bulk-approval workflow for pending vendor inventory items.
  * Form to provide custom rejection notes directly to vendors.
* **Recipe & Ingredient Studio**:
  * Create, edit, and delete recipe profiles.
  * Add step-by-step instructions and nutritional values.
  * Map recipe ingredients to standard ingredient nodes and select custom unit weights.
  * Global price syncing utility to automatically update recipe costs using the lowest vendor pricing.
* **Category & Inventory Manager**:
  * Create, update, or deactivate food categories.
  * Create and maintain global ingredient definitions.
* **Vendor Restock Coordinator**:
  * Create and submit ingredient restock requests to specific vendors with detail notes.

---

## 🛠️ Technology Stack
* **Core**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS, Vanilla CSS
* **Icons**: Lucide React
* **Routing**: React Router DOM (v6)
* **Auth**: Google OAuth Client (`@react-oauth/google`)
* **API Client**: Axios with centralized client interceptors (`src/api/client.ts`)

---

## 📦 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v16+ recommended).

### 2. Installation
Clone the repository and install the project dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 4. Running the Dev Server
To start the application locally:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
To generate optimized production assets in the `dist` folder:
```bash
npm run build
```

---

## ⚙️ Expanding the ESLint Configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
