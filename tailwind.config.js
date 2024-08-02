/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,ts}'],
    theme: {
        screens: {
            compact: { max: '600px' },
            medium: { min: '600px', max: '840px' },
            expanded: { min: '840px', max: '1200px' },
            large: { min: '1200px', max: '1600px' },
            xlarge: { min: '1600px' },
        },
    },
    plugins: [],
};
