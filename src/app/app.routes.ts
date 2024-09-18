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
        path: 'confirm-email/:token',
        loadComponent: () =>
            import('@app/features/email-confirmation-pages/confirm-email-page.component').then(
                (m) => m.ConfirmEmailPageComponent,
            ),
    },
    {
        path: 'confirm-email-modification/:token',
        loadComponent: () =>
            import(
                '@app/features/email-confirmation-pages/confirm-email-modification-page.component'
            ).then((m) => m.ConfirmEmailModificationPageComponent),
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
                path: 'browse',
                loadComponent: () =>
                    import('@app/features/browse-page/browse-page.component').then(
                        (m) => m.BrowsePageComponent,
                    ),
                data: { animation: 'browse' },
            },
            {
                path: 'chat',
                loadComponent: () =>
                    import('@app/features/chat-page/chat-page.component').then(
                        (m) => m.ChatPageComponent,
                    ),
                data: { animation: 'chat' },
            },
            {
                outlet: 'sidesheet',
                path: 'views',
                loadComponent: () =>
                    import('@app/features/views-history-sheet/views-history-sheet.component').then(
                        (m) => m.ViewsHistorySheetComponent,
                    ),
            },
            {
                outlet: 'sidesheet',
                path: 'likes',
                loadComponent: () =>
                    import('@app/features/likes-history-sheet/likes-history-sheet.component').then(
                        (m) => m.LikesHistorySheetComponent,
                    ),
            },
            {
                outlet: 'sidesheet',
                path: 'edit-profile',
                loadComponent: () =>
                    import('@app/features/edit-profile-sheet/edit-profile-sheet.component').then(
                        (m) => m.EditProfileSheetComponent,
                    ),
            },
            {
                outlet: 'sidesheet',
                path: 'edit-pictures',
                loadComponent: () =>
                    import('@app/features/edit-pictures-sheet/edit-pictures-sheet.component').then(
                        (m) => m.EditPicturesSheetComponent,
                    ),
            },
            {
                outlet: 'sidesheet',
                path: 'edit-email',
                loadComponent: () =>
                    import('@app/features/edit-email-sheet/edit-email-sheet.component').then(
                        (m) => m.EditEmailSheetComponent,
                    ),
            },
            {
                outlet: 'sidesheet',
                path: 'edit-password',
                loadComponent: () =>
                    import('@app/features/edit-password-sheet/edit-password-sheet.component').then(
                        (m) => m.EditPasswordSheetComponent,
                    ),
            },
            {
                outlet: 'sidesheet',
                path: 'edit-geolocation',
                loadComponent: () =>
                    import(
                        '@app/features/edit-geolocation-sheet/edit-geolocation-sheet.component'
                    ).then((m) => m.EditGeolocationSheetComponent),
            },
            {
                outlet: 'sidesheet',
                path: 'profile/:id',
                loadComponent: () =>
                    import('@app/features/profile-sheet/profile-sheet.component').then(
                        (m) => m.ProfileSheetComponent,
                    ),
            },
        ],
        canActivate: [isLoggedInGuard],
    },
    {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'home',
    },
];
