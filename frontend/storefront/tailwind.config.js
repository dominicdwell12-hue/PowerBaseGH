/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // PowerBase Gh design tokens — shared with /frontend/admin's config.
        // Palette drawn from Ashanti goldweights (gold), cocoa/forest (green),
        // and indigo-dyed cloth (ink) rather than a generic brand orange.
        ink: {
          DEFAULT: '#14213A', // nav/footer background, headings on light
          50: '#EEF0F5',
          100: '#D6DAE6',
          400: '#4A5978',
          600: '#232F4B',
          900: '#14213A',
        },
        gold: {
          DEFAULT: '#C98A2C', // primary CTA + price-tag accent
          50: '#FBF1E1',
          100: '#F4DCB2',
          400: '#D9A250',
          600: '#C98A2C',
          700: '#A06E20',
        },
        forest: {
          DEFAULT: '#2F5D50', // confirmed / in-stock / success states
          50: '#E8EFEC',
          400: '#3E7A69',
          600: '#2F5D50',
        },
        brick: {
          DEFAULT: '#B4432A', // discount badges, destructive actions
          50: '#F6E8E4',
          400: '#C65D42',
          600: '#B4432A',
        },
        paper: '#F5F4EE', // app background — cool-leaning off-white, not cream
        ash: '#78756C', // muted secondary text
        cream: '#F7F1E6', // primary text/headings on the dark storefront body
        magenta: {
          DEFAULT: '#D6337B', // discount badges, sale pricing accent
          50: '#FBE4EE',
          400: '#E3568F',
          600: '#B92564',
        },
      },
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        tag: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        // Used sparingly — one accent word in hero/section headlines
        // (see Home hero, ProductListing group intro), never body copy.
        serifAccent: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        tag: '4px 12px 4px 12px', // signature price-tag notch, see PriceTag component
      },
    },
  },
  plugins: [],
};
