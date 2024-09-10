import { Routes } from '@angular/router';

import { routes as auth } from '@app/core/auth/auth.routes';
import { isLoggedOutGuard } from '@app/core/auth/guards/is-logged-out.guard';
import { isLoggedInGuard } from '@app/core/auth/guards/is-logged-in.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
    },
    {
        path: '',
        children: auth,
        canActivate: [isLoggedOutGuard],
        data: { animation: 'auth' },
    },
    {
        path: '',
        loadComponent: () =>
            import('@app/shared/layouts/navigation-layout.component').then(
                (m) => m.NavigationLayoutComponent,
            ),
        children: [
            {
                path: 'home',
                loadComponent: () =>
                    import('@app/features/home-page/home-page.component').then(
                        (m) => m.HomePageComponent,
                    ),
                data: { animation: 'home' },
            },
            {
                outlet: 'sidesheet',
                path: 'views',
                loadComponent: () =>
                    import('@app/features/views-history-sheet/views-history-sheet.component').then(
                        (m) => m.ViewsHistorySheetComponent,
                    ),
            },
        ],
        canActivate: [isLoggedInGuard],
    },
    {
        path: '**',
        redirectTo: 'home',
    },
];
