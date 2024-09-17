import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { ScoreIndicatorComponent } from '@app/shared/components/score-indicator/score-indicator.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatAnchor, MatButton, MatIconButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { catchError, lastValueFrom, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MatRipple } from '@angular/material/core';

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
        MatRipple,
    ],
    host: { class: 'flex gap-4' },
    template: `
        <div class="pb-4">
            @if (profilePicture.data()) {
                <div
                    class="group relative mx-auto size-28 cursor-pointer overflow-hidden rounded-full"
                    matRipple
                >
                    <img
                        [src]="profilePicture.data()"
                        class="size-28 rounded-full object-fill"
                        alt="profile picture"
                    />
                    <button
                        type="button"
                        class="absolute inset-0"
                        matTooltip="Edit profile picture"
                        (click)="openEditPicturesSheet()"
                    >
                        <div
                            class="bg-inverse-surface absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-60"
                        ></div>
                        <div
                            class="text-inverse-on-surface absolute inset-0 flex items-center justify-center bg-transparent opacity-0 group-hover:opacity-100"
                        >
                            <mat-icon class="text-white">edit</mat-icon>
                        </div>
                    </button>
                </div>
            } @else {
                <button
                    matRipple
                    type="button"
                    matTooltip="Add profile picture"
                    class="mx-auto flex size-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full bg-outline-variant text-on-surface hover:bg-outline"
                    (click)="openEditPicturesSheet()"
                >
                    <mat-icon class="text-on-surface">add_photo_alternate</mat-icon>
                    <span class="mat-body-medium">add image</span>
                </button>
            }
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
export class HomeHeadingComponent implements OnDestroy {
    #router = inject(Router);
    #httpClient = inject(HttpClient);

    #urlsToRevoke = new Set<string>();

    profilePicture = injectQuery(() => ({
        queryKey: ['pictures', 'profile'],
        queryFn: () =>
            lastValueFrom(
                this.#httpClient
                    .get<Blob>(`/api/pictures/principal/0`, {
                        responseType: 'blob' as 'json',
                    })
                    .pipe(
                        map((blob) => URL.createObjectURL(blob)),
                        tap((url) => this.#urlsToRevoke.add(url)),
                        catchError(() => of(null)),
                    ),
            ),
    }));

    ngOnDestroy() {
        for (const url of this.#urlsToRevoke) {
            URL.revokeObjectURL(url);
        }
    }

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

    async openEditPicturesSheet() {
        await this.#router.navigate([{ outlets: { sidesheet: 'edit-pictures' } }]);
    }
}
