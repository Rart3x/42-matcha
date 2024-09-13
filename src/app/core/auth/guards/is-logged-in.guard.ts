import { CanActivateChildFn, RedirectCommand, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from '@app/core/auth/auth.service';

export const isLoggedInGuard: CanActivateChildFn = (
    _route,
    _state,
    auth = inject(AuthService),
    router = inject(Router),
) => {
    return auth.isLoggedIn$.pipe(
        map((isAuthenticated) =>
            isAuthenticated ? true : new RedirectCommand(router.parseUrl('/login')),
        ),
    );
};
