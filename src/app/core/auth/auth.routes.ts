import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./pages/login-page/login-page.component').then(
                (m) => m.LoginPageComponent,
            ),
    },
];
