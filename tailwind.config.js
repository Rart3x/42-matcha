/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,ts}'],
    theme: {
        extend: {
            borderRadius: {
                xlarge: '1.75rem',
                '4xl': '2rem',
            },
            colors: {
                'secondary-container': 'var(--sys-secondary-container)',
                'on-secondary-container': 'var(--sys-on-secondary-container)',
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
