import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SESSION_TOKEN } from '@app/core/auth/session.injection-token';

export const forwardSessionTokenOnSsrInterceptor: HttpInterceptorFn = (
    req,
    next,
    sessionToken = inject(SESSION_TOKEN, { optional: true }),
) => {
    if (sessionToken) {
        req = req.clone({
            setHeaders: {
                cookie: `session=${sessionToken}`,
            },
        });
    }
    return next(req);
};
