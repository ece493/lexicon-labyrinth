/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    {pattern: /grid-cols-.+/,},
    {pattern: /grid-rows-.+/,}
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}