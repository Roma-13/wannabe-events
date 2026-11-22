/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: {
          950: '#130409',
          900: '#1B060E',
          800: '#260914',
          700: '#5C102B',
          600: '#751435',
          400: '#9E224C',
        },
        poster: {
          yellow: '#F7C616',
          'yellow-bright': '#FFD63B',
          'yellow-deep': '#DDA90A',
          cream: '#FAF5E4',
          'cream-soft': '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['"ArchyEDT-Bold"', '"Noto Sans Georgian"', 'sans-serif'],
        body: ['"Noto Sans Georgian"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
