 /** @type {import('tailwindcss').Config} */
 module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui") 
  ],
  daisyui: {
    themes: [
      {
        sentinel: {
          "primary": "#0026FF",
          "secondary": "#F8F9FC",
          "accent": "#F4E37C",
          "neutral": "#6B7280",
          "base-100": "#FFFFFF",
          "info": "#3B82F6",
          "success": "#34D399",
          "warning": "#FBBF24",
          "error": "#F87171",
        },
      },
    ],
  },
}