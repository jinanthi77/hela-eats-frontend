import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getRecipes } from "../services/recipeService";
import { getCategories } from "../services/categoryService";
import type { Recipe, Category } from "../types";
import { Clock, UtensilsCrossed, X, Star } from "lucide-react";
import { CardGridSkeleton } from "../components/LoadingSkeleton";

const RECIPES_PER_PAGE = 9;

const Recipes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, Number(searchParams.get("page")) || 1),
  );

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setCurrentPage(Math.max(1, Number(searchParams.get("page")) || 1));
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recipeData, catData] = await Promise.all([
          getRecipes({
            search: searchTerm || undefined,
            category: selectedCategory || undefined,
          }),
          getCategories(),
        ]);
        setRecipes(recipeData);
        setCategories(catData);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch recipes");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTerm, selectedCategory]);

  const handleCategoryFilter = (catId: string) => {
    const newCat = selectedCategory === catId ? "" : catId;
    setSelectedCategory(newCat);
    const params = new URLSearchParams(searchParams);
    if (newCat) params.set("category", newCat);
    else params.delete("category");
    params.delete("page");
    setSearchParams(params, { replace: true });
  };

  const totalPages = Math.max(1, Math.ceil(recipes.length / RECIPES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRecipes = recipes.slice(
    (safeCurrentPage - 1) * RECIPES_PER_PAGE,
    safeCurrentPage * RECIPES_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      const params = new URLSearchParams(searchParams);
      if (totalPages > 1) params.set("page", String(totalPages));
      else params.delete("page");
      setSearchParams(params, { replace: true });
    }
  }, [currentPage, totalPages, searchParams, setSearchParams]);

  const handlePageChange = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    const params = new URLSearchParams(searchParams);
    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");
    setSearchParams(params, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [1, 2, 3, "...", totalPages];
    if (safeCurrentPage > 3 && safeCurrentPage < totalPages) {
      pages.splice(3, 0, safeCurrentPage);
    }
    return pages;
  };

  if (error)
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col space-y-4">
        <p className="text-red-500 font-medium text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-brand-light text-brand-dark rounded-lg hover:bg-brand-light/70 transition-colors"
        >
          Try Again
        </button>
      </div>
    );

  return (
    <div className="hela-shell py-10 sm:py-14">
        <div className="mb-10">
          <div>
            <h1 className="hela-display text-4xl sm:text-5xl font-bold">
              Trending Recipes
            </h1>
            <p className="text-gray-600 mt-2 text-base sm:text-lg font-medium">
              Find the perfect dish for your next meal
            </p>
          </div>
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mb-8">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryFilter(cat._id)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border-2 ${
                  selectedCategory === cat._id
                    ? "bg-brand-dark text-white border-brand-dark shadow-md"
                    : "bg-white text-brand-dark border-brand-dark/30 hover:border-brand-dark hover:bg-brand-light/60"
                }`}
              >
                {cat.name}
              </button>
            ))}
            {selectedCategory && (
              <button
                onClick={() => handleCategoryFilter("")}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-all flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        )}

        {loading ? (
          <CardGridSkeleton count={8} />
        ) : recipes.length === 0 ? (
          <div className="text-center py-16 hela-card">
            <UtensilsCrossed className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No recipes found{searchTerm ? ` for "${searchTerm}"` : ""}.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
              {paginatedRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipes/${recipe._id}`}
                  className="hela-recipe-card group p-4 sm:p-5 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-[1/1.05] bg-gray-200 relative overflow-hidden hela-food-frame">
                    {recipe.imageUrl || recipe.image ? (
                      <img
                        src={recipe.imageUrl || recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-brand-light/30">
                        <UtensilsCrossed className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 flex items-center gap-1 text-yellow-300">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-current" />
                      ))}
                      <span className="ml-1 text-white text-sm font-bold">
                        {recipe.ratingSummary?.averageRating || 4.9}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-black mb-4 leading-tight group-hover:text-brand-dark transition-colors line-clamp-2">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center justify-between gap-3 text-sm text-gray-600 mt-auto">
                      <span className="flex items-center gap-2 font-extrabold">
                        <Clock className="h-4 w-4" />{" "}
                        {recipe.cookTime || recipe.prepTime || 20} min Cook Time
                      </span>
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-extrabold min-w-24 text-center ${(recipe.difficulty || "EASY").toUpperCase() === "MEDIUM" ? "bg-brand text-black" : "bg-brand-light text-black"}`}
                      >
                        {recipe.difficulty || "Easy"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="min-w-28 rounded-full border-2 border-brand-dark px-6 py-2.5 text-base font-bold text-black transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Previous
                </button>

                {getVisiblePages().map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-lg font-extrabold text-black"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      className={`h-12 min-w-12 rounded-md border-2 border-brand-dark px-3 text-base font-extrabold transition-colors ${
                        safeCurrentPage === page
                          ? "bg-brand-light text-black"
                          : "bg-white text-black hover:bg-brand-light/60"
                      }`}
                    >
                      {String(page).padStart(2, "0")}
                    </button>
                  ),
                )}

                <button
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  className="min-w-28 rounded-full border-2 border-brand-dark bg-brand-light px-6 py-2.5 text-base font-bold text-black transition-colors hover:bg-brand-light/70 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
    </div>
  );
};

export default Recipes;
