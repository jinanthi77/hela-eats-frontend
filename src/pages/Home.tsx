import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getRecipes } from "../services/recipeService";
import { getTestimonials } from "../services/ratingService";
import { publicAsset } from "../utils/publicAsset";
import type { Recipe } from "../types";
import MobileAppBanner from "../components/MobileAppBanner";
import {
  UtensilsCrossed,
  Loader2,
  Mail,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const heroFallback =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80";
const heroPhrases = ["CART", "CALORIE COUNTER", "RECIPE MASTER"];
const homeHeroImages = [
  publicAsset("Home_page_slide_img-01.png"),
  publicAsset("Home_page_slide_img-02.png"),
  publicAsset("Home_page_slide_img-03.png"),
  publicAsset("Home_page_slide_img-04.png"),
];

type PresentationFeedback = {
  name: string;
  text: string;
  avatar: string;
  rating: number;
};

const presentationFeedbacks: PresentationFeedback[] = [
  {
    name: "Shammi Dileka",
    text: "Loved it so much!!",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
  {
    name: "Sahan Madawa",
    text: "Delivery guy is very friendly and got my order at the exact time I notified.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
  {
    name: "Binuri Athima",
    text: "I live in Australia and this page is literally teach me how to cook alone. Very easy instructions to follow, and loving it.",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
  {
    name: "Anupama Rajasingha",
    text: "Perfect Meal Plans for Diets, who loves eat tasty meals without eating bland foods.",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
    rating: 5,
  },
];
const fallbackFeedbackAvatar =
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80";

const getRandomFeedbackOrder = (total: number) =>
  Array.from({ length: total }, (_, index) => index)
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(4, total));

const Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [realFeedbacks, setRealFeedbacks] = useState<PresentationFeedback[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [heroStep, setHeroStep] = useState(0);
  const [aboutHeadingVisible, setAboutHeadingVisible] = useState(false);
  const [communityHeadingVisible, setCommunityHeadingVisible] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState(
    presentationFeedbacks.map((_, index) => index),
  );
  const aboutHeadingRef = useRef<HTMLDivElement | null>(null);
  const communityHeadingRef = useRef<HTMLDivElement | null>(null);

  const [activeRecipePage, setActiveRecipePage] = useState(0);
  const [isRecipeSliderHovered, setIsRecipeSliderHovered] = useState(false);

  // Responsive cards-per-view: 3 on large, 2 on medium, 1 on small
  const getCardsPerView = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };
  const [cardsPerView, setCardsPerView] = useState(getCardsPerView);

  useEffect(() => {
    const handleResize = () => setCardsPerView(getCardsPerView());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroStep((step) => step + 1);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipeData, testimonialData] = await Promise.all([
          getRecipes(),
          getTestimonials(8).catch(() => []),
        ]);
        setRecipes((recipeData || []).slice(0, 9));
        setRealFeedbacks(
          (testimonialData || [])
            .filter((testimonial) => testimonial.review)
            .map((testimonial) => ({
              name: testimonial.user?.name || "Customer",
              text: testimonial.review,
              avatar:
                testimonial.user?.profilePicture?.url || fallbackFeedbackAvatar,
              rating: testimonial.rating || 5,
            })),
        );
      } catch {
        // Silently fail — Home still usable without data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heroImages = homeHeroImages;
  const activeHeroImage =
    heroImages.length > 0
      ? heroImages[heroStep % heroImages.length]
      : heroFallback;
  const previousHeroImage =
    heroImages.length > 1
      ? heroImages[(heroStep + heroImages.length - 1) % heroImages.length]
      : "";
  const activeHeroPhrase = heroPhrases[heroStep % heroPhrases.length];
  const feedbackItems = [...presentationFeedbacks, ...realFeedbacks];
  const recipePages = Array.from(
    { length: Math.ceil(recipes.length / cardsPerView) },
    (_, index) =>
      recipes.slice(index * cardsPerView, index * cardsPerView + cardsPerView),
  );
  const recipePageCount = Math.max(recipePages.length, 1);

  useEffect(() => {
    setActiveRecipePage((page) =>
      Math.min(page, Math.max(recipePageCount - 1, 0)),
    );
  }, [recipePageCount]);

  useEffect(() => {
    if (loading || recipes.length === 0 || isRecipeSliderHovered) return;
    const interval = setInterval(() => {
      setActiveRecipePage((page) => (page + 1) % recipePageCount);
    }, 3600);
    return () => clearInterval(interval);
  }, [loading, recipes.length, recipePageCount, isRecipeSliderHovered]);

  useEffect(() => {
    const heading = aboutHeadingRef.current;
    if (!heading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutHeadingVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.85, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const heading = communityHeadingRef.current;
    if (!heading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCommunityHeadingVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.85, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(heading);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setFeedbackOrder(getRandomFeedbackOrder(feedbackItems.length));
  }, [feedbackItems.length]);

  useEffect(() => {
    if (feedbackItems.length === 0) return;

    const interval = setInterval(() => {
      setFeedbackOrder(getRandomFeedbackOrder(feedbackItems.length));
    }, 4200);

    return () => clearInterval(interval);
  }, [feedbackItems.length]);

  const scrollLeftBtn = () => {
    setActiveRecipePage(
      (page) => (page - 1 + recipePageCount) % recipePageCount,
    );
  };

  const scrollRightBtn = () => {
    setActiveRecipePage((page) => (page + 1) % recipePageCount);
  };

  return (
    <div className="min-h-screen hela-page">
      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="relative flex min-h-[360px] items-center overflow-hidden sm:min-h-[420px] lg:min-h-[500px]">
        {heroStep > 0 && previousHeroImage && (
          <div
            key={`old-${previousHeroImage}-${heroStep}`}
            className="hero-bg-train hero-bg-train-out absolute inset-0"
            style={{ backgroundImage: `url(${previousHeroImage})` }}
          />
        )}
        <div
          key={`new-${activeHeroImage}-${heroStep}`}
          className={`hero-bg-train absolute inset-0 ${heroStep > 0 ? "hero-bg-train-in" : "hero-bg-train-static"}`}
          style={{ backgroundImage: `url(${activeHeroImage})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.62),rgba(0,0,0,0.18))]" />
        <div className="hela-shell py-10 sm:py-12">
          <div className="relative max-w-4xl">
            <h1 className="font-heading text-[clamp(2.55rem,12vw,4.5rem)] text-white leading-[0.98] sm:text-5xl lg:text-6xl xl:text-7xl">
              HelaEats
              <br />
              is your{" "}
              <span className="hero-word-viewport" aria-live="polite">
                <span
                  key={heroStep}
                  className="hero-word-slide hero-word-soft"
                >
                  {activeHeroPhrase}
                </span>
              </span>
            </h1>
            <Link
              to="/register"
              className="mt-7 inline-flex min-h-12 items-center justify-center px-9 py-3 text-base sm:px-12 hela-action sm:text-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      <div className="hela-shell py-9 sm:py-14">

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-12 w-12 text-brand animate-spin" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm mb-16">
            <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl font-medium">
              No recipes available yet.
            </p>
            <p className="text-gray-400 mt-2">
              Check back soon for delicious meals!
            </p>
          </div>
        ) : (
          <>
            {/* ── Trending Recipes ──────────────────────────────────── */}
            <section className="mb-14 sm:mb-20">
              <div className="mb-8 sm:mb-10">
                <h2 className="hela-display inline-block border-b-4 border-brand-dark pb-3 text-4xl font-bold sm:text-5xl">
                  Trending Recipes
                </h2>
              </div>

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
                      transform: `translateX(-${activeRecipePage * 100}%)`,
                    }}
                  >
                    {recipePages.map((page, pageIndex) => (
                      <div
                        key={pageIndex}
                        className={`grid min-w-full gap-5 sm:gap-7 lg:gap-10 lg:px-10 xl:px-14 ${cardsPerView === 1
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
                                  <UtensilsCrossed className="h-3.5 w-3.5 shrink-0" />
                                  {recipe.cookTime || recipe.prepTime || 20} min
                                  Cook Time
                                </span>
                                <span
                                  className={`min-w-24 rounded-full px-4 py-1.5 text-center text-xs font-extrabold ${(
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
                  {recipePages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveRecipePage(index)}
                      className={`h-2.5 rounded-full border border-brand-dark transition-all ${activeRecipePage === index
                        ? "w-6 bg-brand-light"
                        : "w-2.5 bg-white"
                        }`}
                      aria-label={`Go to recipe slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ── About Us ──────────────────────────────────── */}
        <div className="home-about-section mt-14 mb-14 px-0 text-center sm:mt-20 sm:mb-20 sm:px-4">
          <div
            ref={aboutHeadingRef}
            className={`about-heading-rise mb-8 ${aboutHeadingVisible ? "is-visible" : ""
              }`}
          >
            <h2 className="hela-display home-mega-heading mb-5 font-bold">
              HelaEats
            </h2>
            <h3 className="mx-auto max-w-4xl text-base font-bold leading-relaxed text-brand-dark sm:text-xl">
              Personalized Recipe-to-Cart Platform, Automating Grocery Shopping
              and Healthy Meal Preparation
            </h3>
          </div>
          <div className="mx-auto max-w-5xl space-y-3 text-base font-semibold leading-relaxed text-black sm:text-xl">
            <p>
              We are students at SLTC doing their final project to help young
              Sri Lankan to cook traditional meals in a healthy and convenient
              way, while also enabling online grocery shopping.
            </p>
            <p>
              We are addressing Struggle Of Finding Authentic Sri Lankan Recipes
              Without Vague Instructions, Lack Of Time Due To The Busy Schedule,
              Food Waste From Bulk Shopping, And Limited Nutrition Information
              In The Application.
            </p>
            <p className="pt-2">
              We are here to help you with your day to day life in a tasty and
              healthy way!!!
            </p>
          </div>
        </div>

        {/* ── Mobile App Coming Soon ──────────────────────────────── */}
        <MobileAppBanner />

        <div className="mb-20 px-0 text-center sm:mb-24 sm:px-4">
          <div
            ref={communityHeadingRef}
            className={`about-heading-rise mb-12 ${communityHeadingVisible ? "is-visible" : ""
              }`}
          >
            <h2 className="hela-display text-4xl font-bold sm:text-5xl">
              Be a part of the Our Community
            </h2>
            <h3 className="mt-3 font-heading text-[1.55rem] font-bold leading-tight text-black sm:text-3xl">
              Join As a Trusted Vendor or Be an Excellent Delivery Person
            </h3>
          </div>

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 text-left md:flex-row md:gap-12">
            <div className="w-full space-y-6 md:w-1/2">
              <h4 className="font-heading text-2xl font-bold text-black sm:text-3xl">
                Why you should join us?
              </h4>
              <p className="text-base font-medium leading-relaxed text-black sm:text-xl">
                Joining with our community enhance your business with more
                easily and it is anew way to make profits with your business and
                profit more than you earn by only doing one business.
              </p>
              <div className="mt-10 flex min-w-0 items-center gap-4 sm:mt-12">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brand-dark text-brand-dark">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="font-bold text-[15px] text-black break-all">
                  Email: helaeats@gmail.com
                </span>
              </div>
            </div>
            <div className="flex w-full justify-center md:w-1/2 md:justify-end">
              <img
                src={publicAsset("The Little Things - Business Planning.png")}
                alt="Community Illustration"
                className="h-auto w-[min(450px,100%)] object-contain"
              />
            </div>
          </div>
        </div>

        <section className="mx-auto mb-16 max-w-[1280px] px-0 sm:mb-20 sm:px-4">
          <h2 className="hela-display home-mega-heading mb-12 text-left font-bold sm:mb-16">
            Feedback
          </h2>

          <div className="home-feedback-grid grid grid-cols-1 gap-y-10 lg:grid-cols-2 lg:gap-x-24 lg:gap-y-24">
            {feedbackOrder.map((feedbackIndex, slotIndex) => {
              const feedback = feedbackItems[feedbackIndex];
              const imageRight = slotIndex < 2;
              const alignRight = slotIndex >= 2;

              return (
                <article
                  key={`${feedback.name}-${slotIndex}`}
                  className={`presentation-feedback-card ${imageRight ? "lg:flex-row-reverse" : ""} ${alignRight ? "feedback-align-right" : ""}`}
                >
                  <img
                    src={feedback.avatar}
                    alt={feedback.name}
                    className="presentation-feedback-avatar"
                  />
                  <div className="presentation-feedback-copy flex-1">
                    <div className="presentation-feedback-stars mb-1 flex gap-0.5 text-yellow-300">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${star <= Math.round(feedback.rating)
                            ? "fill-current text-yellow-300"
                            : "text-gray-200"
                            }`}
                        />
                      ))}
                    </div>
                    <h3 className="font-heading text-xl font-bold text-black leading-none">
                      {feedback.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold leading-snug text-black">
                      {feedback.text}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Contact Us ──────────────────────────────────── */}
        <div className="mx-auto mb-16 max-w-7xl px-0 sm:px-4">
          <h3 className="mb-10 font-heading text-3xl font-bold text-black sm:mb-12">
            Contact Us
          </h3>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center gap-4">
              <span className="font-bold text-[15px] text-black">
                Email: helaeats@gmail.com
              </span>
              <div className="w-12 h-12 rounded-full border-2 border-brand-dark flex items-center justify-center text-brand-dark hover:bg-brand-light/50 transition-colors cursor-pointer">
                <Mail className="h-5 w-5" />
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-4">
              <span className="font-bold text-[15px] text-black">
                Hotline: +94 77 421 35 04
              </span>
              <div className="w-12 h-12 rounded-full border-2 border-brand-dark flex items-center justify-center text-brand-dark hover:bg-brand-light/50 transition-colors cursor-pointer">
                <img
                  src="https://www.svgrepo.com/show/469455/phone.svg"
                  alt="phone"
                  className="h-6 w-6"
                />
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-4">
              <span className="font-bold text-[15px] text-black">Facebook #HelaEats</span>
              <div className="w-12 h-12 rounded-full border-2 border-brand-dark flex items-center justify-center text-brand-dark hover:bg-brand-light/30 transition-colors cursor-pointer">
                <img
                  src="https://www.svgrepo.com/show/303117/facebook-2-logo.svg"
                  alt="facebook"
                  className="h-6 w-6"
                />
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-4">
              <span className="font-bold text-[15px] text-black">
                Instagram #HelaEats
              </span>
              <div className="w-12 h-12 rounded-full border-2 border-brand-dark flex items-center justify-center text-brand-dark hover:bg-brand-light/30 transition-colors cursor-pointer">
                <img
                  src="https://www.svgrepo.com/show/452229/instagram-1.svg"
                  alt="instagram"
                  className="h-6 w-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
