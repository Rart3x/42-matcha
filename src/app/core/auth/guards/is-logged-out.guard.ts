import { CanActivateChildFn, RedirectCommand, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@app/core/auth/auth.service';
import { map } from 'rxjs';

export const isLoggedOutGuard: CanActivateChildFn = (
    _route,
    _state,
    auth = inject(AuthService),
    router = inject(Router),
) => {
    return auth.isLoggedIn$.pipe(
        map((isAuthenticated) =>
            isAuthenticated ? new RedirectCommand(router.parseUrl('/home')) : true,
        ),
    );
};
