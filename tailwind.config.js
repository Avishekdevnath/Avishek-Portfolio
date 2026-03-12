/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        secondary: '#6B7280',
        cream: {
          DEFAULT: '#f0ece3',
          dark: '#e8e2d6',
          deeper: '#ddd5c5',
        },
        sand: '#c9b99a',
        'warm-brown': '#8b7355',
        'deep-brown': '#4a3728',
        ink: '#2a2118',
        'off-white': '#faf8f4',
        'text-muted': '#8a7a6a',
        accent: {
          orange: '#d4622a',
          teal: '#3a7d6e',
          blue: '#2d5a8e',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-body)', 'DM Sans', 'sans-serif'],
        mono: ['var(--font-mono)', 'DM Mono', 'monospace'],
        ui: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            a: {
              color: '#2563eb',
              '&:hover': {
                color: '#1d4ed8',
              },
              textDecoration: 'none',
            },
            strong: {
              color: '#111827',
            },
            h1: {
              color: '#111827',
            },
            h2: {
              color: '#111827',
            },
            h3: {
              color: '#111827',
            },
            h4: {
              color: '#111827',
            },
            code: {
              color: '#111827',
              backgroundColor: '#f3f4f6',
              padding: '0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#f3f4f6',
              borderRadius: '0.5rem',
            },
          },
        },
      },
      keyframes: {
        loading: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        blink: {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 1 }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 }
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' }
        },
        'pulse-dot': {
          '0%, 100%': { boxShadow: '0 0 0 3px rgba(58,176,122,.2)' },
          '50%': { boxShadow: '0 0 0 6px rgba(58,176,122,.1)' }
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' }
        },
        loaderSlideUp: {
          from: { transform: 'translateY(110%)' },
          to: { transform: 'translateY(0%)' }
        },
        grain: {
          '0%, 100%': { transform: 'translate(0,0)' },
          '25%': { transform: 'translate(-2%,-3%)' },
          '50%': { transform: 'translate(2%,1%)' },
          '75%': { transform: 'translate(-1%,3%)' }
        },
        curtainDrop: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0%)' }
        },
        curtainRise: {
          from: { transform: 'translateY(0%)' },
          to: { transform: 'translateY(-100%)' }
        }
      },
      animation: {
        loading: 'loading 2s ease-in-out infinite',
        blink: 'blink 1s ease-in-out infinite',
        fadeIn: 'fadeIn 0.5s ease-out',
        slideUp: 'slideUp 0.5s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease infinite',
        bob: 'bob 2.2s ease-in-out infinite',
        grain: 'grain 0.5s steps(2) infinite',
        curtainDrop: 'curtainDrop .7s cubic-bezier(.76,0,.24,1) forwards',
        curtainRise: 'curtainRise .6s cubic-bezier(.76,0,.24,1) forwards'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
  safelist: [
    'bg-blue-50',
    'bg-blue-100',
    'text-blue-600',
    'bg-yellow-50',
    'bg-yellow-100',
    'text-yellow-600',
    'bg-purple-50',
    'bg-purple-100',
    'text-purple-600',
    'bg-green-50',
    'bg-green-100',
    'text-green-600',
    'prose',
    'prose-lg',
    'animate-fadeIn',
    'animate-slideUp',
    'animate-pulse',
    'animate-bounce'
  ]
} 