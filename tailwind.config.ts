import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Tron theme colors
        tron: {
          cyan: "#00eaff",
          "cyan-dark": "#00a8cc",
          "cyan-light": "#00ffff",
          bg: {
            dark: "#000000",
            darker: "#02040a",
            card: "#001318",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        orbitron: ["Orbitron", "sans-serif"],
      },
      animation: {
        "grid-move": "gridmove 20s linear infinite",
        scanline: "scanline 3s linear infinite",
        pulse: "pulse 2s ease-in-out infinite",
        fadein: "fadein 0.4s ease",
        jiggle: "jiggle 0.5s ease-in-out infinite",
        "grid-pulse": "gridpulse 0.6s ease-out",
      },
      keyframes: {
        gridmove: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(40px)" },
        },
        scanline: {
          "0%": { transform: "translateY(0)", opacity: "0.5" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100vh)", opacity: "0.5" },
        },
        pulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 234, 255, 0.5)" },
          "50%": { boxShadow: "0 0 30px rgba(0, 234, 255, 0.8)" },
        },
        fadein: {
          from: {
            opacity: "0",
            transform: "translateY(10px) scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        jiggle: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "10%": { transform: "translate(-1px, -2px) rotate(-1deg)" },
          "20%": { transform: "translate(-3px, 0px) rotate(1deg)" },
          "30%": { transform: "translate(3px, 2px) rotate(0deg)" },
          "40%": { transform: "translate(1px, -1px) rotate(1deg)" },
          "50%": { transform: "translate(-1px, 2px) rotate(-1deg)" },
          "60%": { transform: "translate(-3px, 1px) rotate(0deg)" },
          "70%": { transform: "translate(3px, 1px) rotate(-1deg)" },
          "80%": { transform: "translate(-1px, -1px) rotate(1deg)" },
          "90%": { transform: "translate(1px, 2px) rotate(0deg)" },
        },
        gridpulse: {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)",
          },
          "30%": {
            opacity: "0.8",
            transform: "scale(1.02)",
          },
          "60%": {
            opacity: "0.4",
            transform: "scale(1.01)",
          },
          "100%": {
            opacity: "0",
            transform: "scale(1)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
