/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,ts}'],
    theme: {
        extend: {
            minWidth: {
                screen: '100vw',
            },
            borderRadius: {
                xlarge: '1.75rem',
                '4xl': '2rem',
            },
            colors: {
                primary: 'var(--sys-primary)',
                surface: 'var(--sys-surface)',
                error: 'var(--sys-error)',
                outline: 'var(--sys-outline)',
                'error-container': 'var(--sys-error-container)',
                'on-error-container': 'var(--sys-on-error-container)',
                'outline-variant': 'var(--sys-outline-variant)',
                'surface-container': 'var(--sys-surface-container)',
                'surface-container-low': 'var(--sys-surface-container-low)',
                'primary-container': 'var(--sys-primary-container)',
                'secondary-container': 'var(--sys-secondary-container)',
                'tertiary-container': 'var(--sys-tertiary-container)',
                'on-error': 'var(--sys-on-error)',
                'on-surface': 'var(--sys-on-surface)',
                'on-primary-container': 'var(--sys-on-primary-container)',
                'on-secondary-container': 'var(--sys-on-secondary-container)',
                'on-tertiary-container': 'var(--sys-on-tertiary-container)',
                'on-surface-variant': 'var(--sys-on-surface-variant)',
                'inverse-surface': 'var(--sys-inverse-surface)',
                'inverse-on-surface': 'var(--sys-inverse-on-surface)',
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
            'max-medium': { max: '599px' },
            'max-expanded': { max: '839px' },
            'max-large': { max: '1199px' },
            'max-xlarge': { max: '1599px' },
        },
    },
    plugins: [],
};
