import React, { useEffect, useRef, useState } from "react";
import { Smartphone, Bell, Zap, ChefHat, ShoppingCart, CheckCircle2 } from "lucide-react";
import { publicAsset } from "../utils/publicAsset";

const App = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailValue.trim()) {
      setSubscribed(true);
      setEmailValue("");
    }
  };

  const features = [
    { icon: ChefHat, label: "Smart Recipes", desc: "AI-powered cooking guidance" },
    { icon: ShoppingCart, label: "One-Tap Cart", desc: "Recipe to cart in seconds" },
    { icon: Zap, label: "Lightning Fast", desc: "Seamless ordering experience" },
    { icon: Bell, label: "Meal Reminders", desc: "Never miss a meal plan" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      <section
        ref={sectionRef}
        id="mobile-app-announcement"
        className={`relative w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white transition-all duration-1000 transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-16 items-center">

          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-sm tracking-wide">
              <Smartphone className="w-4 h-4" />
              <span>EXCITING NEWS</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
              Our Mobile App
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
                Coming Soon!
              </span>
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Get HelaEats in your pocket! Order authentic Sri Lankan meals, track
              deliveries in real-time, and access personalized meal plans. All
              from your phone.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {features.map((feature, index) => (
                <div
                  key={feature.label}
                  className={`flex items-start gap-4 transition-all duration-700 delay-[${index * 150}ms] ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                    }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{feature.label}</h4>
                    <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Notify Me Form */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-500" />
                Be the first to know when we launch
              </p>

              {subscribed ? (
                <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-xl border border-green-200">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">You're on the list! We'll notify you at launch.</span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Notify Me
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right — Phone Mockup Container */}
          <div className="relative flex justify-center items-center lg:justify-end mt-12 lg:mt-0">
            {/* Ambient Glow behind phone */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-teal-400 rounded-full blur-3xl opacity-30 transform scale-75 animate-pulse" />

            {/* CSS Phone Frame */}
            <div className="relative z-20 w-[280px] h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl border-4 border-gray-800">

              {/* Phone Notch/Dynamic Island */}
              <div className="absolute top-3 inset-x-0 mx-auto w-32 h-7 bg-gray-900 rounded-b-3xl z-30 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-800" />
                <div className="w-12 h-2 rounded-full bg-gray-800" />
              </div>

              {/* Screen Content (Video) */}
              <div className="relative w-full h-full bg-black rounded-[2.25rem] overflow-hidden">
                <video
                  src={publicAsset("hela-eats-mobile-app.mp4")}
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            </div>

            {/* Floating Emojis matching Sri Lankan context */}
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute top-10 left-10 text-4xl animate-bounce" style={{ animationDelay: '0ms' }}>🍛</span>
              <span className="absolute top-1/4 right-0 text-4xl animate-bounce" style={{ animationDelay: '500ms' }}>🍔</span>
              <span className="absolute bottom-1/4 left-0 text-4xl animate-bounce" style={{ animationDelay: '1000ms' }}>🌶️</span>
              <span className="absolute bottom-10 right-10 text-4xl animate-bounce" style={{ animationDelay: '1500ms' }}>🥘</span>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default App;