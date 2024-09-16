import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScoreIndicatorComponent } from '@app/shared/components/score-indicator/score-indicator.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatAnchor, MatButton, MatIconButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-home-heading',
    standalone: true,
    imports: [
        ScoreIndicatorComponent,
        MatTooltip,
        MatAnchor,
        RouterLink,
        MatButton,
        MatSuffix,
        MatIconButton,
        MatIcon,
    ],
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

        <div class="flex flex-col justify-center px-8">
            <div class="grid grid-cols-2 place-items-center gap-y-1">
                <button
                    mat-flat-button
                    class="btn-secondary col-span-2"
                    (click)="openEditProfileSheet()"
                >
                    Edit profile
                </button>
                <button
                    mat-icon-button
                    matTooltip="Edit email"
                    class="btn-secondary col-span-1"
                    (click)="openEditEmailSheet()"
                >
                    <mat-icon>email</mat-icon>
                </button>
                <button
                    mat-icon-button
                    matTooltip="Edit password"
                    class="btn-secondary col-span-1"
                    (click)="openEditPasswordSheet()"
                >
                    <mat-icon>lock</mat-icon>
                </button>
            </div>
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

    async openEditEmailSheet() {
        await this.#router.navigate([{ outlets: { sidesheet: 'edit-email' } }]);
    }

    async openEditPasswordSheet() {
        await this.#router.navigate([{ outlets: { sidesheet: 'edit-password' } }]);
    }
}
