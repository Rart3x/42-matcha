import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
    provideClientHydration,
    withEventReplay,
    withHttpTransferCacheOptions,
    withI18nSupport,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { forwardSessionTokenOnSsrInterceptor } from '@app/core/auth/forward-session-token-on-ssr.interceptor';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withComponentInputBinding()),
        provideClientHydration(
            withEventReplay(),
            withI18nSupport(),
            withHttpTransferCacheOptions({
                includePostRequests: true,
            }),
        ),
        provideHttpClient(withFetch(), withInterceptors([forwardSessionTokenOnSsrInterceptor])),
        provideAnimationsAsync(),
        { provide: MAT_ICON_DEFAULT_OPTIONS, useValue: { fontSet: 'material-icons-outlined' } },
    ],
};
