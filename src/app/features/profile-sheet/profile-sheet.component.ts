import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import { injectRpcClient } from '@app/core/http/rpc-client';
import {
    injectMutation,
    injectQuery,
    injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatRipple } from '@angular/material/core';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { CdkScrollable } from '@angular/cdk/scrolling';

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
        CdkScrollable,
    ],
    template: `
        <app-sidesheet [heading]="heading()">
            <div class="flex py-4">
                <div class="relative flex w-32 flex-col justify-center">
                    <img
                        [src]="profilePictureUrl()"
                        class="mx-auto rounded-full"
                        alt="Profile picture"
                    />
                    <div
                        [matTooltip]="online() ? 'online' : 'last seen ' + lastSeen()"
                        matTooltipPosition="above"
                        class="absolute right-[10%] top-[12%] aspect-square w-[15%] rounded-full bg-gray-500 outline outline-2 outline-surface data-[online=true]:bg-green-500"
                        [attr.data-online]="online()"
                    ></div>
                </div>

                <div class="h-32">
                    <div class="mb-4 box-border flex grow flex-col px-4">
                        <div class="mat-headline-small !mb-0">
                            {{ fullName() }}
                        </div>
                        <div class="mat-body-medium">
                            <span>{{ data()?.age }} years old</span>
                            @if (data()?.gender !== 'other') {
                                <span> {{ data()?.gender }}</span>
                            }
                            <span>, looking for {{ data()?.sexual_pref }}</span>
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
                                {{ data()?.fame_rating }}
                            </span>
                            <mat-icon>whatshot</mat-icon>
                        </div>
                    </div>
                </div>
            </div>

            <mat-divider />

            <div class="py-4">
                <h3 class="mat-title-large">Biography</h3>

                <div class="mat-body">{{ data()?.biography }}</div>
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
                @if (data()?.likes_principal) {
                    <button
                        type="button"
                        mat-flat-button
                        class="btn-primary"
                        matTooltip="remove like"
                        (click)="unlikeUserMutation.mutate()"
                    >
                        <mat-icon class="material-symbols-filled">favorite</mat-icon>
                        Liked
                    </button>
                } @else {
                    <button
                        type="button"
                        mat-flat-button
                        class="btn-primary"
                        matTooltip="like user"
                        (click)="likeUserMutation.mutate()"
                    >
                        <mat-icon>favorite</mat-icon>
                        Like
                    </button>
                }
                <div
                    [matTooltip]="
                        connection_status() === 'connected' ? 'open chat' : 'connect first'
                    "
                >
                    <button
                        type="button"
                        mat-flat-button
                        class="btn-secondary"
                        [disabled]="connection_status() !== 'connected'"
                    >
                        <mat-icon>chat</mat-icon>
                        Chat
                    </button>
                </div>
                <button
                    type="button"
                    mat-icon-button
                    matTooltip="block user"
                    (click)="blockUserMutation.mutate()"
                >
                    <mat-icon>block</mat-icon>
                </button>
                <button
                    type="button"
                    mat-icon-button
                    matTooltip="report as fake account"
                    (click)="reportUserMutation.mutate()"
                >
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
    #queryClient = injectQueryClient();

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

    profilePictureUrl = computed(() => `/api/pictures/by_id/${this.validatedId()}/0`);

    onlineStatusQuery = injectQuery(() => ({
        queryKey: ['online-status', { id: this.id() }],
        queryFn: () => this.#rpcClient.getOnlineStatusById({ user_id: this.validatedId() }),
        refetchInterval: /* 1 minute */ 60_000,
    }));

    online = computed(() => this.onlineStatusQuery.data()?.online);
    lastSeen = computed(() => this.onlineStatusQuery.data()?.last_seen ?? 'more than 3 days ago');

    profileQuery = injectQuery(() => ({
        queryKey: ['profile-by-id', { id: this.id() }],
        queryFn: () => this.#rpcClient.getProfileById({ user_id: this.validatedId() }),
    }));

    data = computed(() => this.profileQuery.data());

    heading = computed(() => this.data()?.username ?? 'Profile');
    fullName = computed(() => `${this.data()?.first_name} ${this.data()?.last_name}`);
    tags = computed(() => this.data()?.tags ?? ([] as string[]));

    connection_status = computed(() =>
        this.data()?.liked_by_principal
            ? 'liked'
            : this.data()?.likes_principal
              ? 'connected'
              : 'none',
    );

    getImageUrl(i: number) {
        return `/api/pictures/by_id/${this.validatedId()}/${i}`;
    }

    onImageError(event: Event) {
        const target = event.target as HTMLImageElement;
        target.style.display = 'none';
    }

    likeUserMutation = injectMutation(() => ({
        mutationKey: ['like-user', { id: this.validatedId() }],
        mutationFn: () => this.#rpcClient.createLike({ liked_id: this.validatedId() }),
        onSuccess: () =>
            this.#queryClient.invalidateQueries({ queryKey: ['profile-by-id', { id: this.id() }] }),
    }));

    unlikeUserMutation = injectMutation(() => ({
        mutationKey: ['unlike-user', { id: this.validatedId() }],
        mutationFn: () => this.#rpcClient.deleteLike({ liked_id: this.validatedId() }),
        onSuccess: () =>
            this.#queryClient.invalidateQueries({ queryKey: ['profile-by-id', { id: this.id() }] }),
    }));

    // TODO: consider closing the sheet after blocking/reporting
    blockUserMutation = injectMutation(() => ({
        mutationKey: ['block-user', { id: this.validatedId() }],
        mutationFn: () => this.#rpcClient.createBlock({ blocked_id: this.validatedId() }),
    }));

    reportUserMutation = injectMutation(() => ({
        mutationKey: ['report-user', { id: this.validatedId() }],
        mutationFn: () => this.#rpcClient.createFakeUserReport({ reported_id: this.validatedId() }),
    }));
}
