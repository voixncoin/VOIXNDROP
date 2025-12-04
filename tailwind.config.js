/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#00f0ff',
                accent: '#9945FF',
                background: '#0b0e14',
                foreground: '#e2e8f0',
                muted: '#94a3b8',
                border: '#232a3b',
            },
        },
    },
    plugins: [],
}
