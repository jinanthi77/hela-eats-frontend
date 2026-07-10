import { useState, useEffect } from "react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      id="scroll-to-top-btn"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="scroll-to-top-btn"
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.8)",
        transition: "opacity 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.35s cubic-bezier(0.22,1,0.36,1)",

        /* Visual styling */
        width: "50px",
        height: "50px",
        borderRadius: "14px",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #054802 0%, #38A445 100%)",
        boxShadow: "0 8px 24px rgba(5, 72, 2, 0.3), 0 2px 8px rgba(0,0,0,0.1)",
        color: "#fff",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px) scale(1.08)";
        e.currentTarget.style.boxShadow =
          "0 12px 32px rgba(5, 72, 2, 0.4), 0 4px 12px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = isVisible
          ? "translateY(0) scale(1)"
          : "translateY(16px) scale(0.8)";
        e.currentTarget.style.boxShadow =
          "0 8px 24px rgba(5, 72, 2, 0.3), 0 2px 8px rgba(0,0,0,0.1)";
      }}
    >
      {/* Up Arrow SVG */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
};

export default ScrollToTop;
