import { Routes } from '@angular/router';

import { routes as auth } from '@app/core/auth/auth.routes';

export const routes: Routes = [
    {
        path: '',
        children: auth,
    },
];
