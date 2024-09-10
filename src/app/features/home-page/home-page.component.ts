import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatAnchor, MatButton } from '@angular/material/button';
import { AuthService } from '@app/core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { ScoreIndicatorComponent } from '@app/shared/components/score-indicator/score-indicator.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCard } from '@angular/material/card';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';

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

        <div class="relative flex grow">
            <!-- Left pane -->
            <div class="relative flex min-h-full w-[26rem] flex-col pt-10">
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
                    <a mat-flat-button routerLink="/profile" class="btn-secondary">Edit profile</a>
                    <button mat-flat-button class="btn-secondary" (click)="logout()">Logout</button>
                </div>

                <!-- Content -->
                <div class="m-4 grow rounded-t-2xl bg-surface"></div>
            </div>

            <!-- Right pane -->
            <div class="flex min-h-full grow flex-col gap-2 p-4 pt-20">
                <div class="flex items-center justify-end gap-2">
                    <span>sort by:</span>
                    <mat-button-toggle-group name="fontStyle" aria-label="Font Style">
                        <mat-button-toggle value="bold" checked> Age</mat-button-toggle>
                        <mat-button-toggle value="italic"> Location</mat-button-toggle>
                        <mat-button-toggle value="underline"> Fame rating</mat-button-toggle>
                        <mat-button-toggle value="color"> Common tags </mat-button-toggle>
                    </mat-button-toggle-group>
                </div>
                <div class="flex min-h-full grow flex-col gap-4">
                    <mat-card class="h-40" />
                    <mat-card class="h-40" />
                    <mat-card class="h-40" />
                </div>
            </div>
        </div>
    `,
    host: { class: 'flex min-h-full relative flex-col gap-1' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
    #router = inject(Router);
    #authService = inject(AuthService);

    async openViewsHistorySheet() {
        await this.#router.navigate([{ outlets: { sidesheet: 'views' } }]);
    }

    async openLikesHistorySheet() {
        await this.#router.navigate([{ outlets: { sidesheet: 'likes' } }]);
    }

    logout() {
        this.#authService.logout().pipe().subscribe();
    }
}
