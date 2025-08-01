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
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
			// Custom breakpoints for specific use cases
			'mobile': {'max': '767px'},
			'tablet': {'min': '768px', 'max': '1023px'},
			'desktop': {'min': '1024px'},
			// Touch device detection
			'touch': {'raw': '(hover: none) and (pointer: coarse)'},
			'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
			// Orientation
			'portrait': {'raw': '(orientation: portrait)'},
			'landscape': {'raw': '(orientation: landscape)'},
			// Reduced motion
			'reduce-motion': {'raw': '(prefers-reduced-motion: reduce)'},
			'no-reduce-motion': {'raw': '(prefers-reduced-motion: no-preference)'},
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				'section-bg': 'hsl(var(--section-bg))',
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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'pulse-scale': {
					'0%, 100%': { transform: 'scale(1)', opacity: '1' },
					'50%': { transform: 'scale(1.05)', opacity: '0.9' }
				},
				'shimmer': {
					'0%': { opacity: '0.3' },
					'50%': { opacity: '1' },
					'100%': { opacity: '0.3' }
				},
				'flash': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'50%': { transform: 'translateX(0%)', opacity: '1' },
					'100%': { transform: 'translateX(100%)', opacity: '0' }
				},
				'sparkle': {
					'0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.7' },
					'50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '1' }
				},
				'progress': {
					'0%': { width: '0%' },
					'100%': { width: '100%' }
				},
				'float-slow': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-30px) rotate(10deg)' }
				},
				'float-reverse': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(30px) rotate(-10deg)' }
				},
				'paper-float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg) scale(1)' },
					'33%': { transform: 'translateY(-20px) rotate(5deg) scale(1.05)' },
					'66%': { transform: 'translateY(-10px) rotate(-3deg) scale(0.95)' }
				},
				'paper-float-reverse': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg) scale(1)' },
					'33%': { transform: 'translateY(20px) rotate(-5deg) scale(1.05)' },
					'66%': { transform: 'translateY(10px) rotate(3deg) scale(0.95)' }
				},
				'writing-bounce': {
					'0%, 100%': { transform: 'translateY(0px) scale(1)' },
					'50%': { transform: 'translateY(-5px) scale(1.02)' }
				},
				'type-in': {
					'0%': { width: '0%', opacity: '0' },
					'50%': { opacity: '0.5' },
					'100%': { width: '100%', opacity: '1' }
				},
				'writing-hand': {
					'0%, 100%': { transform: 'rotate(0deg) translateX(0px)' },
					'25%': { transform: 'rotate(-10deg) translateX(-2px)' },
					'50%': { transform: 'rotate(5deg) translateX(2px)' },
					'75%': { transform: 'rotate(-5deg) translateX(-1px)' }
				},
				'person-working': {
					'0%, 100%': { transform: 'scale(1) rotate(0deg)' },
					'50%': { transform: 'scale(1.05) rotate(2deg)' }
				},
				'idea-float': {
					'0%, 100%': { transform: 'translateY(0px) scale(1)' },
					'50%': { transform: 'translateY(-15px) scale(1.2)' }
				},
				'idea-float-delay': {
					'0%, 100%': { transform: 'translateY(0px) scale(1) rotate(0deg)' },
					'50%': { transform: 'translateY(-10px) scale(1.3) rotate(180deg)' }
				},
				'step-1': {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
					'33%': { transform: 'scale(1.2)', opacity: '1' }
				},
				'step-2': {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
					'66%': { transform: 'scale(1.2)', opacity: '1' }
				},
				'step-3': {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
					'100%': { transform: 'scale(1.2)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
				'shimmer': 'shimmer 1.5s ease-in-out infinite',
				'shimmer-delay-1': 'shimmer 1.5s ease-in-out infinite 0.1s',
				'shimmer-delay-2': 'shimmer 1.5s ease-in-out infinite 0.2s',
				'shimmer-delay-3': 'shimmer 1.5s ease-in-out infinite 0.3s',
				'shimmer-delay-4': 'shimmer 1.5s ease-in-out infinite 0.4s',
				'shimmer-delay-5': 'shimmer 1.5s ease-in-out infinite 0.5s',
				'shimmer-delay-6': 'shimmer 1.5s ease-in-out infinite 0.6s',
				'shimmer-delay-7': 'shimmer 1.5s ease-in-out infinite 0.7s',
				'flash': 'flash 2s ease-in-out infinite',
				'sparkle': 'sparkle 2s ease-in-out infinite',
				'sparkle-delay': 'sparkle 2s ease-in-out infinite 0.5s',
				'sparkle-slow': 'sparkle 3s ease-in-out infinite',
				'progress': 'progress 2.5s ease-out',
				'float-slow': 'float-slow 4s ease-in-out infinite',
				'float-reverse': 'float-reverse 3.5s ease-in-out infinite',
				'type-in': 'type-in 2s ease-out',
				'type-in-delay-1': 'type-in 2s ease-out 0.1s',
				'type-in-delay-2': 'type-in 2s ease-out 0.2s',
				'type-in-delay-3': 'type-in 2s ease-out 0.3s',
				'type-in-delay-4': 'type-in 2s ease-out 0.4s',
				'type-in-delay-5': 'type-in 2s ease-out 0.5s',
				'type-in-delay-6': 'type-in 2s ease-out 0.6s',
				'type-in-delay-7': 'type-in 2s ease-out 0.7s',
				'writing-hand': 'writing-hand 1s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
