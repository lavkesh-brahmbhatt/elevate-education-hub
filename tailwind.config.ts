import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        subtle: "hsl(var(--subtle))",
        primary: {
          DEFAULT: "#5B4FE8",
          light: "#7B71ED",
          dark: "#4338CA",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#2F88D8",
          light: "#5BA3E4",
          dark: "#1E6BB5",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#F5A623",
          light: "#F7BC5A",
          dark: "#D4891A",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FCD34D",
          dark: "#D97706",
        },
        navy: {
          50: '#EEF0F8',
          100: '#D4D9EE',
          500: '#3D4B8A',
          900: '#0f0c3d',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem",
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 3s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "fade-in": "fadeInUp 0.35s ease forwards",
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #5B4FE8 0%, #2F88D8 100%)',
        'gradient-warm': 'linear-gradient(135deg, #F5A623 0%, #E8834A 100%)',
        'gradient-success': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1a1560 0%, #0a0828 100%)',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(91,79,232,0.08), 0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 30px rgba(91,79,232,0.15), 0 2px 8px rgba(0,0,0,0.08)',
        'primary': '0 4px 14px rgba(91,79,232,0.4)',
        'glow': '0 0 20px rgba(91,79,232,0.3)',
        'active': 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.2)',
      }
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
