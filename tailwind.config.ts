
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'chat': '0.75rem',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Module-specific color tokens for consistent theming
				skills: {
					DEFAULT: 'hsl(var(--skills-color))',
					light: 'hsl(var(--skills-light))'
				},
				calendar: {
					DEFAULT: 'hsl(var(--calendar-color))',
					light: 'hsl(var(--calendar-light))'
				},
				goods: {
					DEFAULT: 'hsl(var(--goods-color))',
					light: 'hsl(var(--goods-light))'
				},
				safety: {
					DEFAULT: 'hsl(var(--safety-color))',
					light: 'hsl(var(--safety-light))'
				}
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'star-movement-bottom': {
					'0%': { transform: 'translate(0%, 0%)', opacity: '1' },
					'100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
				},
				'star-movement-top': {
					'0%': { transform: 'translate(0%, 0%)', opacity: '1' },
					'100%': { transform: 'translate(100%, 0%)', opacity: '0' },
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' },
				},
				'float': {
					'0%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' },
					'100%': { transform: 'translateY(0px)' },
				},
				"spin-around": {
					"0%": {
						transform: "translateZ(0) rotate(0)",
					},
					"15%, 35%": {
						transform: "translateZ(0) rotate(90deg)",
					},
					"65%, 85%": {
						transform: "translateZ(0) rotate(270deg)",
					},
					"100%": {
						transform: "translateZ(0) rotate(360deg)",
					},
				},
				"shimmer-slide": {
					to: {
						transform: "translate(calc(100cqw - 100%), 0)",
					},
				},
				"rainbow-shimmer": {
					"0%": {
						filter: "hue-rotate(0deg) saturate(1.2) brightness(1.1)",
					},
					"25%": {
						filter: "hue-rotate(90deg) saturate(1.4) brightness(1.2)",
					},
					"50%": {
						filter: "hue-rotate(180deg) saturate(1.3) brightness(1.1)",
					},
					"75%": {
						filter: "hue-rotate(270deg) saturate(1.4) brightness(1.2)",
					},
					"100%": {
						filter: "hue-rotate(360deg) saturate(1.2) brightness(1.1)",
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
				'star-movement-top': 'star-movement-top linear infinite alternate',
				'gradient-shift': 'gradient-shift 8s ease infinite',
				'float': 'float 6s ease-in-out infinite',
				"shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
				"spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
				"rainbow-shimmer": "rainbow-shimmer 4s ease-in-out infinite",
			},
			boxShadow: {
				'chat': '0 2px 8px rgba(0, 0, 0, 0.05)',
				'chat-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
			},
			maxWidth: {
				'xs+100': 'calc(20rem + 100px)',     // default xs is 20rem
				'sm+100': 'calc(24rem + 100px)',     // default sm is 24rem
				'md+100': 'calc(28rem + 100px)',     // default md is 28rem
				'lg+100': 'calc(32rem + 100px)',     // default lg is 32rem
				'xl+100': 'calc(36rem + 100px)',     // default xl is 36rem
				'2xl+100': 'calc(42rem + 100px)',    // default 2xl is 42rem
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
