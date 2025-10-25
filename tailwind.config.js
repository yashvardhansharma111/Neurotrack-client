// tailwind.config.js or tailwind.config.ts

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      // Ensure this includes all your source files
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    // ... rest of config
  }