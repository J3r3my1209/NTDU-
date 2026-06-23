/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#00E56A",
          50:  "#e9fff3",
          100: "#c9ffe1",
          200: "#93ffc4",
          300: "#52f7a3",
          400: "#1fe884",
          500: "#00E56A",
          600: "#00b855",
          700: "#068f45",
          800: "#0a703a",
          900: "#0a5c31",
        },
        ink: {
          DEFAULT: "#0A0B0D",
          800: "#111317",
          700: "#1A1D23",
          600: "#272B33",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)",
        card: "0 4px 24px -8px rgba(16,24,40,.10), 0 2px 8px -4px rgba(16,24,40,.06)",
        float: "0 24px 48px -16px rgba(16,24,40,.18)",
        glow: "0 0 0 1px rgba(0,229,106,.25), 0 12px 32px -8px rgba(0,229,106,.35)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s cubic-bezier(.21,1.02,.73,1) both",
        shimmer: "shimmer 2s infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Opcional, ayuda con los inputs
    require('tailwindcss-animate'), // ESTO ES CLAVE para las animaciones del chat
  ],
}
