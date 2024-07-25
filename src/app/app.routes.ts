import { Routes } from '@angular/router';

import { routes as auth } from '@app/core/auth/auth.routes';
import { isLoggedOutGuard } from '@app/core/auth/guards/is-logged-out.guard';
import { isLoggedInGuard } from '@app/core/auth/guards/is-logged-in.guard';

export const routes: Routes = [
    {
        path: '',
        children: auth,
        canActivateChild: [isLoggedOutGuard],
    },
    {
        path: '',
        children: [
            {
                path: 'home',
                loadComponent: () =>
                    import('@app/features/home-page/home-page.component').then(
                        (m) => m.HomePageComponent,
                    ),
            },
        ],
        canActivateChild: [isLoggedInGuard],
    },
    {
        path: '**',
        redirectTo: 'home',
    },
];
