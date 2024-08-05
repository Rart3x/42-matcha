import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { concatMap, Subject, tap } from 'rxjs';

type ToastConfig = {
    message: string;
    duration?: number;
    action?: {
        label: string;
        action: () => void;
    };
};

@Injectable({
    providedIn: 'root',
})
export class SnackBarServiceService {
    #matSnackBar = inject(MatSnackBar);

    #queue = new Subject<ToastConfig>();

    #subscription = this.#queue
        .pipe(
            concatMap((config) => {
                const snack = this.#matSnackBar.open(
                    config.message,
                    config.action?.label,
                    {
                        duration: config.duration || 3000,
                        verticalPosition: 'bottom',
                        horizontalPosition: 'right',
                    },
                );

                if (config.action) {
                    snack
                        .onAction()
                        .pipe(tap(() => config.action?.action()))
                        .subscribe();
                }

                return snack.afterDismissed();
            }),
        )
        .subscribe();

    /**
     * Show a success toast.
     *
     * @param message The message to display.
     * @param config Additional configuration.
     */
    public enqueueSnackBar(
        message: string,
        config?: Omit<ToastConfig, 'message'>,
    ): void {
        this.#queue.next({ message, ...config });
    }
}
