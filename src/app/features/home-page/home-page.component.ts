import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoggerService } from '@app/core/services/logger.service';

@Component({
    selector: 'app-home-page',
    standalone: true,
    imports: [MatButton],
    template: `
        <p>home-page works!</p>
        <button mat-button (click)="onClick()">log out</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
    #rpcClient = injectRpcClient();
    #router = inject(Router);
    #logger = inject(LoggerService);

    onClick() {
        this.#rpcClient
            .logout({})
            .pipe(
                tap((res) => {
                    if (res.ok) {
                        void this.#router.navigate(['/login']);
                    } else {
                        this.#logger.error(res.error);
                    }
                }),
            )
            .subscribe();
    }
}
