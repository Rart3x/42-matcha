import { CanMatchFn, RedirectCommand, Router, Routes } from '@angular/router';

import { routes as auth } from '@app/core/auth/auth.routes';
import { isLoggedOutGuard } from '@app/core/auth/guards/is-logged-out.guard';
import { isLoggedInGuard } from '@app/core/auth/guards/is-logged-in.guard';
import { inject } from '@angular/core';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { injectQueryClient } from '@tanstack/angular-query-experimental';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { catchError, map, of } from 'rxjs';

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
                children: [
                    {
                        path: ':other_user_id',
                        loadComponent: () =>
                            import(
                                '@app/features/conversation-page/conversation-page.component'
                            ).then((m) => m.ConversationPageComponent),
                        canMatch: [
                            ((_, segments) => {
                                const router = inject(Router);
                                const rpcClient = injectRpcClient();
                                const queryClient = injectQueryClient();

                                const id = segments[segments.length - 1].path;

                                if (!Number.isInteger(+id) || +id < 0) {
                                    return new RedirectCommand(router.createUrlTree(['chat']));
                                }
                                return fromPromise(
                                    rpcClient.canChatWithUser({ other_user_id: +id }),
                                ).pipe(
                                    map((result) => {
                                        if (!result.canChat) {
                                            return new RedirectCommand(
                                                inject(Router).createUrlTree(['chat']),
                                            );
                                        }
                                        return true;
                                    }),
                                    catchError(() =>
                                        of(new RedirectCommand(router.createUrlTree(['chat']))),
                                    ),
                                );
                            }) satisfies CanMatchFn,
                        ],
                    },
                ],
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
                path: 'notifications',
                loadComponent: () =>
                    import('@app/features/notifications-sheet/notifications-sheet.component').then(
                        (m) => m.NotificationsSheetComponent,
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
                canMatch: [
                    ((_, segments) => {
                        const id = segments[segments.length - 1].path;
                        if (Number.isInteger(+id) && +id > 0) {
                            return true;
                        }
                        return new RedirectCommand(
                            inject(Router).createUrlTree([{ outlets: { sidesheet: null } }]),
                        );
                    }) satisfies CanMatchFn,
                ],
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
