/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB", // Deep Blue
        secondary: "#06B6D4", // Teal/Cyan
        accent: "#22C55E", // Green for resolved
        warning: "#F97316", // Orange for pending
        error: "#EF4444", // Red for urgent
        background: "#F8FAFC", // Light Gray
        surface: "#FFFFFF"
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.08)",
        card: "0 4px 12px rgba(0, 0, 0, 0.1)",
        hover: "0 8px 24px rgba(0, 0, 0, 0.12)"
      }
    }
  },
  plugins: []
};

