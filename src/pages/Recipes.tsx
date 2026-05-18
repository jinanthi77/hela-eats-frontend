import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getRecipes } from "../services/recipeService";
import type { Recipe } from "../types";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  UtensilsCrossed,
  Star,
} from "lucide-react";
import { CardGridSkeleton } from "../components/LoadingSkeleton";

const RECIPES_PER_PAGE = 9;

const Recipes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRecipePage, setActiveRecipePage] = useState(0);
  const [isRecipeSliderHovered, setIsRecipeSliderHovered] = useState(false);
  const searchTerm = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "";

  const getCardsPerView = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView);
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const recipeData = await getRecipes({
          search: searchTerm || undefined,
          category: selectedCategory || undefined,
        });
        setRecipes(recipeData);
        setActiveRecipePage(0);
      } catch (err) {
        const apiError = err as {
          response?: { data?: { message?: string } };
        };
        setError(apiError.response?.data?.message || "Failed to fetch recipes");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const handleResize = () => setCardsPerView(getCardsPerView());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const trendingRecipes = recipes.slice(0, 9);
  const recipeSliderPages = Array.from(
    { length: Math.ceil(trendingRecipes.length / cardsPerView) },
    (_, index) =>
      trendingRecipes.slice(
        index * cardsPerView,
        index * cardsPerView + cardsPerView,
      ),
  );
  const recipePageCount = Math.max(recipeSliderPages.length, 1);
  const safeActiveRecipePage = Math.min(
    activeRecipePage,
    Math.max(recipePageCount - 1, 0),
  );
  const totalPages = Math.max(1, Math.ceil(recipes.length / RECIPES_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRecipes = recipes.slice(
    (safeCurrentPage - 1) * RECIPES_PER_PAGE,
    safeCurrentPage * RECIPES_PER_PAGE,
  );

  useEffect(() => {
    if (loading || recipes.length === 0 || isRecipeSliderHovered) return;
    const interval = setInterval(() => {
      setActiveRecipePage((page) => (page + 1) % recipePageCount);
    }, 3600);
    return () => clearInterval(interval);
  }, [loading, recipes.length, recipePageCount, isRecipeSliderHovered]);

  const scrollLeftBtn = () => {
    setActiveRecipePage(
      (page) => (page - 1 + recipePageCount) % recipePageCount,
    );
  };

  const scrollRightBtn = () => {
    setActiveRecipePage((page) => (page + 1) % recipePageCount);
  };

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

    const pages: Array<number | "..."> = [1, 2, 3, "...", totalPages];
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
        <div className="mb-10 px-0 sm:px-3 lg:px-10 xl:px-14">
          <div>
            <h1 className="hela-display text-4xl sm:text-5xl font-bold">
              Trending Recipes
            </h1>
            <p className="text-gray-600 mt-2 text-base sm:text-lg font-medium">
              Find the perfect dish for your next meal
            </p>
          </div>
        </div>

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
            <section className="mb-12">
              <div
                className="relative"
                onMouseEnter={() => setIsRecipeSliderHovered(true)}
                onMouseLeave={() => setIsRecipeSliderHovered(false)}
              >
                {recipePageCount > 1 && (
                  <button
                    onClick={scrollLeftBtn}
                    className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-lg transition-colors hover:bg-black/65 sm:flex lg:left-8 xl:left-10"
                    aria-label="Previous recipes"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                <div className="overflow-hidden px-0 sm:px-3">
                  <div
                    className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      transform: `translateX(-${safeActiveRecipePage * 100}%)`,
                    }}
                  >
                    {recipeSliderPages.map((page, pageIndex) => (
                      <div
                        key={pageIndex}
                        className={`grid min-w-full gap-5 sm:gap-7 lg:gap-10 lg:px-10 xl:px-14 ${
                          cardsPerView === 1
                            ? "grid-cols-1"
                            : cardsPerView === 2
                              ? "grid-cols-2"
                              : "grid-cols-3"
                        }`}
                      >
                        {page.map((recipe) => (
                          <Link
                            key={recipe._id}
                            to={`/recipes/${recipe._id}`}
                            className="group relative h-[330px] overflow-hidden rounded-[14px] border-2 border-brand-dark bg-gray-100 shadow-[0_12px_24px_rgba(5,72,2,0.12)] transition-transform duration-300 hover:-translate-y-1 sm:h-[395px] lg:h-[430px] xl:h-[460px]"
                          >
                            {recipe.imageUrl || recipe.image ? (
                              <img
                                src={recipe.imageUrl || recipe.image}
                                alt={recipe.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-brand-light/30 text-gray-400">
                                <UtensilsCrossed className="h-12 w-12" />
                              </div>
                            )}

                            <div className="absolute inset-x-0 bottom-0 bg-black/68 px-4 py-4 text-white backdrop-blur-[1px] sm:px-5">
                              <div className="mb-1.5 flex items-center gap-1">
                                <div className="flex text-yellow-300">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className="h-3.5 w-3.5 fill-current"
                                    />
                                  ))}
                                </div>
                                <span className="text-xs font-extrabold">
                                  {recipe.ratingSummary?.averageRating || 4.9}
                                </span>
                              </div>
                              <h3 className="font-heading text-xl font-bold leading-tight line-clamp-2 sm:text-2xl">
                                {recipe.title}
                              </h3>
                              <div className="mt-3 flex flex-col gap-2 text-xs font-extrabold min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between sm:text-sm">
                                <span className="flex min-w-0 items-center gap-1.5 truncate">
                                  <Clock className="h-3.5 w-3.5 shrink-0" />
                                  {recipe.cookTime || recipe.prepTime || 20} min
                                  Cook Time
                                </span>
                                <span
                                  className={`min-w-24 rounded-full px-4 py-1.5 text-center text-xs font-extrabold ${
                                    (
                                      recipe.difficulty || "EASY"
                                    ).toUpperCase() === "EASY"
                                      ? "bg-brand-light text-brand-dark"
                                      : (
                                            recipe.difficulty || "EASY"
                                          ).toUpperCase() === "MEDIUM"
                                        ? "bg-brand text-black"
                                        : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {recipe.difficulty || "Easy"}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                        {page.length < cardsPerView &&
                          Array.from({
                            length: cardsPerView - page.length,
                          }).map((_, index) => (
                            <div
                              key={`empty-${index}`}
                              className="hidden sm:block"
                              aria-hidden="true"
                            />
                          ))}
                      </div>
                    ))}
                  </div>
                </div>

                {recipePageCount > 1 && (
                  <button
                    onClick={scrollRightBtn}
                    className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-lg transition-colors hover:bg-black/65 sm:flex lg:right-8 xl:right-10"
                    aria-label="Next recipes"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              {recipePageCount > 1 && (
                <div className="mt-7 flex items-center justify-center gap-2">
                  {recipeSliderPages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveRecipePage(index)}
                      className={`h-2.5 rounded-full border border-brand-dark transition-all ${
                        safeActiveRecipePage === index
                          ? "w-6 bg-brand-light"
                          : "w-2.5 bg-white"
                      }`}
                      aria-label={`Go to recipe slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </section>

            <h2 className="hela-display mb-6 px-0 sm:px-3 lg:px-10 xl:px-14 text-4xl sm:text-5xl font-bold">
              Recipes Chart
            </h2>

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
                      onClick={() => handlePageChange(page)}
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
