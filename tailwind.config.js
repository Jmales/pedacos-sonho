/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './js/**/*.js'],
  safelist: [
    'hidden',
    'lg:flex',
    'lg:hidden',
    'xl:inline',
    'xl:gap-5',
    'xl:px-5',
    'bg-primary',
    'text-white',
    'bg-white',
    'text-gray-700',
    'border',
    'border-gray-200',
    'truncate',
    'whitespace-nowrap',
    'min-w-0',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5B6F55',
        secondary: '#DDA75F',
        dark: '#3A3A3A',
        light: '#FAF7F2',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
