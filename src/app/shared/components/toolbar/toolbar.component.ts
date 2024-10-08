import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatIconAnchor, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { injectLogoutMutation } from '@app/shared/queries/account.queries';
import { TitleCasePipe } from '@angular/common';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { rxEffect } from 'ngxtension/rx-effect';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, pairwise } from 'rxjs';
import { SnackBarService } from '@app/core/services/snack-bar.service';
import { MatBadge } from '@angular/material/badge';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-toolbar',
    standalone: true,
    imports: [
        MatToolbar,
        MatToolbarRow,
        MatIcon,
        MatIconButton,
        MatTooltip,
        TitleCasePipe,
        MatBadge,
        RouterLink,
        MatIconAnchor,
    ],
    host: { class: 'grid place-content-stretch' },
    template: `
        <mat-toolbar class="!bg-transparent">
            <mat-toolbar-row class="gap-2 !pt-2">
                @if (title()) {
                    <h1 class="mat-display-small !mb-0">{{ title() | titlecase }}</h1>
                }

                <span class="grow"></span>

                <button
                    mat-icon-button
                    matTooltip="notifications"
                    (click)="openNotificationsSidesheet()"
                    [matBadge]="unreadNotificationsCount()"
                >
                    <mat-icon>notifications</mat-icon>
                </button>

                <button mat-icon-button matTooltip="logout" (click)="logout.mutate()">
                    <mat-icon>logout</mat-icon>
                </button>
            </mat-toolbar-row>
        </mat-toolbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
    logout = injectLogoutMutation();
    #rpcClient = injectRpcClient();
    #snackbarService = inject(SnackBarService);
    #router = inject(Router);

    unreadNotificationCountQuery = injectQuery(() => ({
        queryKey: ['notifications', 'count'],
        queryFn: () => this.#rpcClient.getUnreadNotificationsCount(),
        refetchInterval: /* 5 seconds */ 5000,
    }));

    unreadNotificationsCount = computed(() => this.unreadNotificationCountQuery.data()?.count ?? 0);

    constructor() {
        rxEffect(
            toObservable(this.unreadNotificationsCount).pipe(
                filter(() => !this.unreadNotificationCountQuery.isPending()),
                pairwise(),
            ),
            ([prevCount, currCount]) => {
                if (currCount > prevCount) {
                    this.#snackbarService.enqueueSnackBar(
                        `You received ${currCount - prevCount} new notifications`,
                    );
                }
            },
        );
    }

    title = input<string>();

    async openNotificationsSidesheet() {
        await this.#router.navigate([{ outlets: { sidesheet: ['notifications'] } }]);
    }
}
