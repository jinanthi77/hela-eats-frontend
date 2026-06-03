import { useEffect, useRef, useState } from "react";
import { Smartphone, Bell, Zap, ChefHat, ShoppingCart } from "lucide-react";
import { publicAsset } from "../utils/publicAsset";

const MobileAppBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

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
    <section
      ref={sectionRef}
      id="mobile-app-announcement"
      className={`mobile-app-banner ${isVisible ? "is-visible" : ""}`}
    >
      {/* Decorative floating circles */}
      <div className="mobile-app-bg-circle mobile-app-bg-circle-1" />
      <div className="mobile-app-bg-circle mobile-app-bg-circle-2" />
      <div className="mobile-app-bg-circle mobile-app-bg-circle-3" />

      <div className="hela-shell">
        <div className="mobile-app-inner">
          {/* Left Content */}
          <div className="mobile-app-content">
            <div className="mobile-app-badge">
              <Smartphone className="mobile-app-badge-icon" />
              <span>EXCITING NEWS</span>
            </div>

            <h2 className="mobile-app-title">
              Our Mobile App
              <br />
              <span className="mobile-app-title-highlight">Coming Soon!</span>
            </h2>

            <p className="mobile-app-subtitle">
              Get HelaEats in your pocket! Order authentic Sri Lankan meals, track
              deliveries in real-time, and access personalized meal plans — all
              from your phone.
            </p>

            {/* Feature Grid */}
            <div className="mobile-app-features">
              {features.map((feature, index) => (
                <div
                  key={feature.label}
                  className="mobile-app-feature-item"
                  style={{ animationDelay: `${0.15 + index * 0.1}s` }}
                >
                  <div className="mobile-app-feature-icon-wrap">
                    <feature.icon className="mobile-app-feature-icon" />
                  </div>
                  <div>
                    <h4 className="mobile-app-feature-label">{feature.label}</h4>
                    <p className="mobile-app-feature-desc">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Notify Me Form */}
            <div className="mobile-app-notify-section">
              <p className="mobile-app-notify-label">
                <Bell className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />
                Be the first to know when we launch
              </p>
              {subscribed ? (
                <div className="mobile-app-subscribed">
                  <span className="mobile-app-subscribed-check">✓</span>
                  <span>You're on the list! We'll notify you at launch.</span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="mobile-app-notify-form">
                  <input
                    type="email"
                    placeholder="Enter your email..."
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    className="mobile-app-notify-input"
                    required
                  />
                  <button type="submit" className="mobile-app-notify-btn">
                    Notify Me
                  </button>
                </form>
              )}
            </div>

            {/* Store badges coming soon */}
            <div className="mobile-app-stores">
              <div className="mobile-app-store-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div>
                  <span className="mobile-app-store-soon">Coming soon on</span>
                  <span className="mobile-app-store-name">App Store</span>
                </div>
              </div>
              <div className="mobile-app-store-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.302 1.327-2.302 1.328-1.697-1.327 1.697-1.328zm-4.606-2.74L4.457 0.228l10.937 6.334-2.302 2.005z"/>
                </svg>
                <div>
                  <span className="mobile-app-store-soon">Coming soon on</span>
                  <span className="mobile-app-store-name">Google Play</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Phone Mockup */}
          <div className="mobile-app-phone-wrap">
            <div className="mobile-app-phone-glow" />
            <video
              src={publicAsset("hela-eats-mobile-app.mp4")}
              className="mobile-app-phone-img"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="mobile-app-phone-particles">
              <span className="mobile-app-particle mobile-app-particle-1">🍛</span>
              <span className="mobile-app-particle mobile-app-particle-2">🥘</span>
              <span className="mobile-app-particle mobile-app-particle-3">🍲</span>
              <span className="mobile-app-particle mobile-app-particle-4">🌶️</span>
              <span className="mobile-app-particle mobile-app-particle-5">🥥</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppBanner;
