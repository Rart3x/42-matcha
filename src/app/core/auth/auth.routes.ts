import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'confirm-email/:token',
        loadComponent: () =>
            import('./pages/confirm-email-page.component').then((m) => m.ConfirmEmailPageComponent),
    },
    {
        path: '',
        loadComponent: () =>
            import('./layouts/auth-layout.component').then((m) => m.AuthLayoutComponent),
        children: [
            {
                path: 'login',
                loadComponent: () =>
                    import('./pages/login-page.component').then((m) => m.LoginPageComponent),
            },
            {
                path: 'register',
                loadComponent: () =>
                    import('./pages/register-page.component').then((m) => m.RegisterPageComponent),
            },
            {
                path: 'registration-successful',
                loadComponent: () =>
                    import('./pages/registration-successful-page.component').then(
                        (m) => m.RegistrationSuccessfulPageComponent,
                    ),
            },
        ],
    },
];
