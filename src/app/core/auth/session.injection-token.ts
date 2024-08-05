import { InjectionToken } from '@angular/core';

export const SESSION_TOKEN = new InjectionToken<string>(
    'session token from cookie',
);
