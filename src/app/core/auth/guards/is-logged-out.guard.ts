import { CanActivateChildFn, RedirectCommand, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@app/core/auth/auth.service';
import { map } from 'rxjs';

export const isLoggedOutGuard: CanActivateChildFn = (
    _route,
    _state,
    authService = inject(AuthService),
    router = inject(Router),
) => {
    return authService.isAuthenticated$.pipe(
        map((isAuthenticated) =>
            isAuthenticated
                ? new RedirectCommand(router.parseUrl('/home'))
                : true,
        ),
    );
};
