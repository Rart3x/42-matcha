import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatRipple } from '@angular/material/core';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';

// TODO: online status (badge on profile picture with tooltip for last online)

@Component({
    selector: 'app-profile-sheet',
    standalone: true,
    imports: [
        SidesheetComponent,
        MatChipSet,
        MatChip,
        MatDivider,
        MatIcon,
        MatTooltip,
        MatRipple,
        MatButton,
        MatFabButton,
        MatIconButton,
    ],
    template: `
        <app-sidesheet [heading]="heading()">
            <div class="flex py-4">
                <div class="relative flex w-32 flex-col justify-center">
                    <img [src]="profilePictureUrl()" class="mx-auto rounded-full" />
                </div>

                <div class="h-32">
                    <div class="mb-4 box-border flex grow flex-col px-4">
                        <div class="mat-headline-small !mb-0">
                            {{ profile.data()?.first_name }} {{ profile.data()?.last_name }}
                        </div>
                        <div class="mat-body-medium">
                            <span>{{ profile.data()?.age }} years old</span>
                            @if (profile.data()?.gender !== 'other') {
                                <span> {{ profile.data()?.gender }}</span>
                            }
                            <span>, looking for {{ profile.data()?.sexual_pref }}</span>
                        </div>
                    </div>

                    <div class="mat-body-medium flex gap-2 px-4">
                        @if (connection_status() === 'none') {
                            <div
                                matRipple
                                matTooltip="doesn't like you yet"
                                class="mat-elevation-z1 flex w-fit items-center gap-0.5 rounded-xl bg-tertiary-container p-2 text-on-tertiary-container"
                            >
                                <mat-icon>mood_bad</mat-icon>
                            </div>
                        }

                        @if (connection_status() === 'liked') {
                            <div
                                matRipple
                                matTooltip="likes you"
                                class="mat-elevation-z1 flex w-fit items-center gap-0.5 rounded-xl bg-secondary-container p-2 text-on-secondary-container"
                            >
                                <mat-icon>favorite</mat-icon>
                            </div>
                        }

                        @if (connection_status() === 'connected') {
                            <div
                                matRipple
                                matTooltip="you two are connected"
                                class="mat-elevation-z1 flex w-fit items-center gap-0.5 rounded-xl bg-primary-container p-2 text-on-primary-container"
                            >
                                <mat-icon class="material-symbols-filled">favorite</mat-icon>
                            </div>
                        }

                        <div
                            matTooltip="Fame rating"
                            matRipple
                            class="mat-elevation-z1 flex w-fit items-center gap-0.5 rounded-xl bg-primary-container p-2 text-on-primary-container"
                        >
                            <span class="translate-y-[0.075rem] leading-none">
                                {{ profile.data()?.fame_rating }}
                            </span>
                            <mat-icon>whatshot</mat-icon>
                        </div>
                    </div>
                </div>
            </div>

            <mat-divider />

            <div class="py-4">
                <h3 class="mat-title-large">Biography</h3>

                <div class="mat-body">{{ profile.data()?.biography }}</div>
            </div>

            <mat-divider />

            <div class="py-4">
                <h3 class="mat-title-large">Interests</h3>
                <mat-chip-set>
                    @for (tag of tags(); track tag) {
                        <mat-chip>{{ tag }}</mat-chip>
                    }
                </mat-chip-set>
            </div>

            <mat-divider />

            <div class="py-4">
                <h3 class="mat-title-large">Pictures</h3>

                <div class="flex flex-wrap gap-2">
                    @for (i of [0, 1, 2, 3, 4]; track i) {
                        <img
                            [src]="getImageUrl(i)"
                            class="size-28 rounded-lg"
                            (error)="onImageError($event)"
                        />
                    }
                </div>
            </div>

            <ng-container bottom-actions>
                <button type="button" mat-flat-button class="btn-primary">
                    <mat-icon>favorite</mat-icon>
                    Like
                </button>
                <button type="button" mat-flat-button class="btn-secondary">
                    <mat-icon>chat</mat-icon>
                    Chat
                </button>
                <button type="button" mat-icon-button matTooltip="block user">
                    <mat-icon>block</mat-icon>
                </button>
                <button type="button" mat-icon-button matTooltip="report as fake account">
                    <mat-icon>report</mat-icon>
                </button>
            </ng-container>
        </app-sidesheet>
    `,
    styles: `
        .material-symbols-filled {
            font-variation-settings:
                'FILL' 1,
                'wght' 400,
                'GRAD' 1,
                'opsz' 24;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSheetComponent {
    #rpcClient = injectRpcClient();

    id = input.required<string>();

    validatedId = computed(() => {
        const id = this.id();

        if (!id) {
            throw new Error('id is required');
        }

        if (!/^\d+$/.test(id)) {
            throw new Error('id must be a number');
        }

        if (isNaN(+id)) {
            throw new Error('id must be a number');
        }

        return +id;
    });

    profilePictureUrl = computed(() => {
        return `/api/pictures/by_id/${this.validatedId()}/0`;
    });

    profile = injectQuery(() => ({
        queryKey: ['profile-by-id', { id: this.id() }],
        queryFn: () => this.#rpcClient.getProfileById({ user_id: this.validatedId() }),
    }));

    tags = computed(() => this.profile.data()?.tags ?? ([] as string[]));

    heading = computed(() => {
        const data = this.profile.data();

        if (data) {
            return data.username;
        }

        return 'Profile';
    });

    connection_status = computed(() => {
        const data = this.profile.data();

        if (data) {
            return data.liked_by_principal ? 'liked' : data.likes_principal ? 'connected' : 'none';
        }

        return 'none';
    });

    getImageUrl(i: number) {
        return `/api/pictures/by_id/${this.validatedId()}/${i}`;
    }

    onImageError(event: Event) {
        const target = event.target as HTMLImageElement;
        target.style.display = 'none';
    }
}
