/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,ts}'],
    theme: {
        extend: {
            borderRadius: {
                '4xl': '1.75rem',
            },
        },
        screens: {
            medium: { min: '600px' },
            expanded: { min: '840px' },
            large: { min: '1200px' },
            xlarge: { min: '1600px' },
            'web-landscape': {
                raw: '(orientation: landscape) and (min-width: 600px)',
            },
        },
    },
    plugins: [],
};
