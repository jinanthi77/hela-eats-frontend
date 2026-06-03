import { publicAsset } from "../utils/publicAsset";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-brand-light border-t border-brand/20 flex items-center py-8 sm:py-10 mt-auto">
      {/* Floating Emojis matching Sri Lankan context */}
      <div className="absolute inset-0 pointer-events-none">
        <span className="absolute top-6 left-10 text-4xl animate-bounce" style={{ animationDelay: "0ms" }}>
          🍛
        </span>
        <span className="absolute top-2 right-12 text-4xl animate-bounce" style={{ animationDelay: "500ms" }}>
          🍔
        </span>
        <span className="absolute bottom-2 left-16 text-4xl animate-bounce" style={{ animationDelay: "1000ms" }}>
          🌶️
        </span>
        <span className="absolute bottom-6 right-6 text-4xl animate-bounce" style={{ animationDelay: "1500ms" }}>
          🥘
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-black text-sm font-medium">
        <img
          src={publicAsset("logo22.png")}
          alt="Hela Eats Logo"
          className="h-16 w-32 object-contain mx-auto mb-3"
        />
        <p className="text-black">
          Developed by Udara | Nilupul | Jinanthi | Dilshika
        </p>
      </div>
    </footer>
  );
};

export default Footer;
