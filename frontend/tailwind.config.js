/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray-900': '#111827',
        'gray-800': '#1F2937',
        'gray-700': '#374151',
        'indigo-400': '#818CF8',
        'indigo-500': '#6366F1',
        'indigo-600': '#4F46E5',
        'indigo-700': '#4338CA',
      }
    },
  },
  plugins: [],
}
