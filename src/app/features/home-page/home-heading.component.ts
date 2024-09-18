import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy } from '@angular/core';
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
import { injectRpcClient } from '@app/core/http/rpc-client';

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
    host: { class: 'flex gap-4 max-medium:flex-col max-medium:pl-4' },
    template: `
        <div class="flex items-center gap-4">
            <div class="flex flex-col pb-4">
                <!-- Profile picture -->
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
                                class="absolute inset-0 flex items-center justify-center bg-inverse-surface opacity-0 group-hover:opacity-60"
                            ></div>
                            <div
                                class="absolute inset-0 flex items-center justify-center bg-transparent text-inverse-on-surface opacity-0 group-hover:opacity-100"
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

            <p class="mat-headline-small !m-0 block medium:hidden">Welcome back, John Doe!</p>
        </div>

        <div class="flex gap-4 max-medium:justify-between">
            <div class="flex flex-col justify-center gap-3">
                <p class="mat-headline-small !m-0 block max-medium:hidden">
                    {{ title() }}
                </p>

                <div class="flex gap-6">
                    <app-score-indicator
                        icon="whatshot"
                        [score]="statsQuery.data()?.fame_rating"
                        matTooltip="Fame rating"
                        matTooltipPosition="above"
                    />
                    <app-score-indicator
                        icon="visibility"
                        [score]="statsQuery.data()?.visits"
                        matTooltip="Views"
                        matTooltipPosition="above"
                        (click)="openViewsHistorySheet()"
                        class="cursor-pointer"
                    />
                    <app-score-indicator
                        icon="thumb_up"
                        [score]="statsQuery.data()?.likes"
                        matTooltip="Likes"
                        matTooltipPosition="above"
                        (click)="openLikesHistorySheet()"
                        class="cursor-pointer"
                    />
                </div>
            </div>

            <!-- Edit profile buttons -->
            <div class="flex flex-col justify-center pr-4 medium:px-8">
                <div class="grid grid-cols-2 place-items-center gap-y-1">
                    <button
                        mat-icon-button
                        matTooltip="Edit profile"
                        class="btn-secondary"
                        (click)="openEditProfileSheet()"
                    >
                        <mat-icon>Person</mat-icon>
                    </button>
                    <button
                        mat-icon-button
                        matTooltip="Edit email"
                        class="btn-secondary"
                        (click)="openEditEmailSheet()"
                    >
                        <mat-icon>email</mat-icon>
                    </button>
                    <button
                        mat-icon-button
                        matTooltip="Edit location"
                        class="btn-secondary"
                        (click)="openEditLocationSheet()"
                    >
                        <mat-icon>location_on</mat-icon>
                    </button>
                    <button
                        mat-icon-button
                        matTooltip="Edit password"
                        class="btn-secondary"
                        (click)="openEditPasswordSheet()"
                    >
                        <mat-icon>lock</mat-icon>
                    </button>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeadingComponent implements OnDestroy {
    #router = inject(Router);
    #httpClient = inject(HttpClient);
    #rpcClient = injectRpcClient();

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

    profileQuery = injectQuery(() => ({
        queryKey: ['profile'],
        queryFn: () => this.#rpcClient.getPrincipalProfile(),
    }));

    statsQuery = injectQuery(() => ({
        queryKey: ['stats'],
        queryFn: () => this.#rpcClient.getPrincipalUserStats(),
    }));

    title = computed(() => {
        const firstName = this.profileQuery.data()?.first_name;
        const lastName = this.profileQuery.data()?.last_name;

        if (!firstName) {
            return 'Welcome back!';
        }
        if (!lastName) {
            return `Welcome back, ${firstName}!`;
        }
        return `Welcome back, ${firstName} ${lastName}!`;
    });

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

    async openEditLocationSheet() {
        await this.#router.navigate([{ outlets: { sidesheet: 'edit-geolocation' } }]);
    }
}
