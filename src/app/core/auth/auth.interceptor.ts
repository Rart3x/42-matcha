import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { injectQueryClient } from '@tanstack/angular-query-experimental';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const queryClient = injectQueryClient();

    return next(req).pipe(
        tap({
            error: async (error) => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    if (!error.url?.includes('/api/verifySession')) {
                        await queryClient.invalidateQueries({ queryKey: ['verifySession'] });
                    }
                    await router.navigateByUrl('/login');
                }
            },
        }),
    );
};
