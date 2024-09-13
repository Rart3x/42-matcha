import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatAnchor, MatButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { ScoreIndicatorComponent } from '@app/shared/components/score-indicator/score-indicator.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCard } from '@angular/material/card';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { SnackBarService } from '@app/core/services/snack-bar.service';

@Component({
    selector: 'app-home-page',
    standalone: true,
    imports: [
        MatButton,
        MatAnchor,
        RouterLink,
        MatToolbar,
        MatToolbarRow,
        MatIcon,
        ScoreIndicatorComponent,
        MatTooltip,
        MatCard,
        MatButtonToggleGroup,
        MatButtonToggle,
    ],
    template: `
        <mat-toolbar class="!bg-transparent">
            <mat-toolbar-row></mat-toolbar-row>
            <mat-toolbar-row>
                <h1 class="!text-6xl">Home</h1>
            </mat-toolbar-row>
        </mat-toolbar>

        <div class="max-medium:flex-col relative flex grow">
            <!-- Left pane -->
            <div class="relative flex flex-col pt-10 medium:w-[26rem]">
                <div class="pb-4">
                    <div class="mx-auto size-40 rounded-full bg-slate-400"></div>
                </div>
                <p class="!m-0 text-center">Welcome back, John Doe!</p>

                <div class="grid grid-cols-4 gap-4 px-8 py-5">
                    <app-score-indicator
                        icon="whatshot"
                        [score]="5"
                        matTooltip="Fame rating"
                        matTooltipPosition="above"
                    />
                    <app-score-indicator
                        icon="visibility"
                        [score]="13"
                        matTooltip="Views"
                        matTooltipPosition="above"
                        (click)="openViewsHistorySheet()"
                        class="cursor-pointer"
                    />
                    <app-score-indicator
                        icon="thumb_up"
                        [score]="6"
                        matTooltip="Likes"
                        matTooltipPosition="above"
                        (click)="openLikesHistorySheet()"
                        class="cursor-pointer"
                    />
                    <app-score-indicator
                        icon="block"
                        [score]="0"
                        matTooltip="Blocks"
                        matTooltipPosition="above"
                    />
                </div>

                <div class="grid grid-cols-2 gap-4 px-8">
                    <a
                        mat-flat-button
                        routerLink="/profile"
                        class="btn-secondary"
                        (click)="openEditProfileSheet()"
                        >Edit profile</a
                    >
                    <button mat-flat-button class="btn-secondary" (click)="logout.mutate()">
                        Logout
                    </button>
                </div>

                <!-- Content -->
                <div class="m-4 grow rounded-t-2xl bg-surface"></div>
            </div>

            <!-- Right pane -->
            <div class="flex grow flex-col gap-2 p-4 pt-20"></div>
        </div>
    `,
    host: { class: 'flex min-h-full relative flex-col gap-1' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
    #router = inject(Router);
    #rpcClient = injectRpcClient();
    #queryClient = injectQueryClient();
    #snackBar = inject(SnackBarService);

    logout = injectMutation(() => ({
        mutationFn: this.#rpcClient.logout,
        onSuccess: async () => {
            this.#snackBar.enqueueSnackBar('You have been logged out');
            await this.#queryClient.invalidateQueries({ queryKey: ['verifySession'] });
            await this.#router.navigate(['/login']);
        },
        onError: () => {
            this.#snackBar.enqueueSnackBar('Failed to logout');
        },
    }));

    async openViewsHistorySheet() {
        await this.#router.navigate([{ outlets: { sidesheet: 'views' } }]);
    }

    async openLikesHistorySheet() {
        await this.#router.navigate([{ outlets: { sidesheet: 'likes' } }]);
    }

    async openEditProfileSheet() {
        await this.#router.navigate([{ outlets: { sidesheet: 'edit-profile' } }]);
    }
}
