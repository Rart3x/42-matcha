import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScoreIndicatorComponent } from '@app/shared/components/score-indicator/score-indicator.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatAnchor, MatButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatSuffix } from '@angular/material/form-field';

@Component({
    selector: 'app-home-heading',
    standalone: true,
    imports: [ScoreIndicatorComponent, MatTooltip, MatAnchor, RouterLink, MatButton, MatSuffix],
    host: { class: 'flex gap-4' },
    template: `
        <div class="pb-4">
            <div class="mx-auto size-28 rounded-full bg-slate-400"></div>
        </div>

        <div class="flex flex-col justify-center gap-3">
            <p class="mat-headline-small !m-0 block">Welcome back, John Doe!</p>
            <div class="flex gap-6">
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
            </div>
        </div>

        <div class="flex flex-col justify-center gap-2 px-8">
            <a
                mat-flat-button
                routerLink="/profile"
                class="btn-secondary !text-sm"
                (click)="openEditProfileSheet()"
            >
                Edit profile
            </a>
            <button mat-flat-button class="btn-secondary">Settings</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeadingComponent {
    #router = inject(Router);

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
