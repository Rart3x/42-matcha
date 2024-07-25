import { Routes } from '@angular/router';

import { routes as auth } from '@app/core/auth/auth.routes';
import { isLoggedOutGuard } from '@app/core/auth/guards/is-logged-out.guard';

export const routes: Routes = [
    {
        path: '',
        children: auth,
        canActivateChild: [isLoggedOutGuard],
    },
];
