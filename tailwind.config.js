/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#18181B",
          700: "#27272A",
          500: "#52525B",
          400: "#71717A",
          300: "#A1A1AA",
          200: "#D4D4D8",
          100: "#E4E4E7",
          50: "#F4F4F5",
        },
        canvas: {
          DEFAULT: "#FFFFFF",
          soft: "#FAFAFA",
          panel: "#F7F8FA",
          inset: "#F4F4F5",
        },
        flame: {
          50: "#FFF1F0",
          100: "#FFE0DD",
          400: "#FF6A55",
          500: "#F43F5E",
          600: "#E11D48",
          700: "#BE123C",
        },
        ember: {
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
        },
        spark: {
          400: "#FBBF24",
          500: "#F59E0B",
        },
        brand: {
          weibo: "#E6162D",
          zhihu: "#0084FF",
          bilibili: "#FB7299",
          douyin: "#161823",
          kuaishou: "#FF4906",
          baidu: "#2932E1",
          toutiao: "#F04142",
          wangyi: "#CC292D",
          douyu: "#FF7700",
          weixin: "#07C160",
          tieba: "#4E6EF2",
          qq: "#12B7F5",
        },
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "Noto Sans SC",
          "HarmonyOS Sans SC",
          "Microsoft YaHei",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: ["SF Mono", "JetBrains Mono", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.04)",
        hover: "0 4px 16px rgba(15, 23, 42, 0.06), 0 2px 6px rgba(15, 23, 42, 0.04)",
        focus: "0 0 0 3px rgba(244, 63, 94, 0.12)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.85)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        "slide-in": "slide-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
