/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0fdff',
                    100: '#ccfbfe',
                    200: '#9af8fd',
                    300: '#62f0fa',
                    400: '#1dddf0',
                    500: '#00ffff', // Основной cyan
                    600: '#00d4d6',
                    700: '#00a8aa',
                    800: '#008588',
                    900: '#006b70',
                },
                secondary: {
                    500: '#0099ff', // Синий
                },
                dark: {
                    100: '#1a1a2e',
                    200: '#16213e',
                    300: '#0f3460',
                    400: '#0f0f0f',
                }
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'slide-in': 'slide-in 0.3s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 255, 0.5)' },
                    '50%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)' },
                },
                'slide-in': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}