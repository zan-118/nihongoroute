/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
  	extend: {
  		colors: {
  			cyber: {
  				bg: '#15171a',
  				surface: '#1e2024',
  				neon: '#0ef'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			neumorphic: '15px 15px 40px rgba(0,0,0,0.6), -10px -10px 30px rgba(255,255,255,0.02)',
  			'neumorphic-pressed': 'inset 4px 4px 10px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(255,255,255,0.02)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: ['var(--font-inter)', 'var(--font-noto-jp)', 'sans-serif'],
  			noto: ['var(--font-noto-jp)', 'sans-serif']
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
