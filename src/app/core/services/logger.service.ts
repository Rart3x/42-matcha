import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LoggerService {
    #level: 'debug' | 'info' | 'warn' | 'error' = 'debug';

    debug(...args: Parameters<typeof console.log>): void {
        switch (this.#level) {
            case 'debug':
                console.debug(...args);
                break;
            default:
                break;
        }
    }

    info(...args: Parameters<typeof console.info>): void {
        switch (this.#level) {
            case 'debug':
            case 'info':
                console.info(...args);
                break;
            default:
                break;
        }
    }

    warn(...args: Parameters<typeof console.warn>): void {
        switch (this.#level) {
            case 'debug':
            case 'info':
            case 'warn':
                console.warn(...args);
                break;
            default:
                break;
        }
    }

    error(...args: Parameters<typeof console.error>): void {
        switch (this.#level) {
            case 'debug':
            case 'info':
            case 'warn':
            case 'error':
                console.error(...args);
                break;
            default:
                break;
        }
    }
}
