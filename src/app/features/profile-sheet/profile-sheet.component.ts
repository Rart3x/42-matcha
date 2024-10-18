import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
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
import { MatAnchor, MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SnackBarService } from '@app/core/services/snack-bar.service';

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
        MatAnchor,
        RouterLink,
    ],
    template: `
        <app-sidesheet
            [heading]="heading()"
            [loading]="profileQuery.isPending()"
            [error]="profileQuery.isError()"
        >
            <ng-container error>
                <div class="text-center">
                    <h1 class="mat-title-large">Error loading profile</h1>
                    <p class="mat-body">
                        There was an error loading the profile. Please try again later.
                    </p>
                    <button
                        type="button"
                        mat-button
                        class="btn-primary"
                        (click)="profileQuery.refetch()"
                    >
                        Retry
                    </button>
                </div>
            </ng-container>

            <div class="grid grid-cols-[auto_auto] py-4">
                <!-- profile picture -->
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

                <div class="min-h-32">
                    <!-- username, age and sexual preference -->
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
                        <!-- connection status -->
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

                        <!-- fame rating -->
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
                            alt="User picture"
                        />
                    }
                </div>
            </div>

            <ng-container bottom-actions>
                <!-- like button -->
                @if (data()?.liked_by_principal) {
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
                    <div [matTooltip]="canLike() ? 'like user' : 'add profile picture first'">
                        <button
                            type="button"
                            mat-flat-button
                            class="btn-primary"
                            (click)="likeUserMutation.mutate()"
                            [disabled]="!canLike()"
                        >
                            <mat-icon>favorite</mat-icon>
                            Like
                        </button>
                    </div>
                }

                <!-- chat button -->
                @let connected = connection_status() === 'connected';
                <div [matTooltip]="connected ? 'open chat' : 'connect first'">
                    <a
                        type="button"
                        mat-flat-button
                        class="btn-secondary"
                        [routerLink]="connected ? chatUrlTree() : null"
                        [disabled]="!connected"
                    >
                        <mat-icon>chat</mat-icon>
                        Chat
                    </a>
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
    #router = inject(Router);
    #activatedRoute = inject(ActivatedRoute);
    #snackBar = inject(SnackBarService);

    // user id of the profile to display (from the URL, validated in the guard)
    id = input<number, string>(0, {
        transform: (id: string) => parseInt(id, 10),
    });

    // url for opening the chat with this user
    chatUrlTree = computed(() =>
        this.#router.createUrlTree(
            [{ outlets: { sidesheet: null, primary: ['chat', this.id()] } }],
            { relativeTo: this.#activatedRoute.parent },
        ),
    );

    profilePictureUrl = computed(() => `/api/pictures/by_id/${this.id()}/0`);

    onlineStatusQuery = injectQuery(() => ({
        queryKey: ['online-status', { id: this.id() }],
        queryFn: () => this.#rpcClient.getOnlineStatusById({ user_id: this.id() }),
        refetchInterval: /* 1 minute */ 60_000,
    }));

    online = computed(() => this.onlineStatusQuery.data()?.online);
    lastSeen = computed(() => this.onlineStatusQuery.data()?.last_seen ?? 'more than 3 days ago');

    profileQuery = injectQuery(() => ({
        queryKey: ['profile-by-id', { id: this.id() }],
        queryFn: () => this.#rpcClient.getProfileById({ user_id: this.id() }),
    }));

    data = computed(() => this.profileQuery.data());

    heading = computed(() => this.data()?.username ?? 'Profile');
    fullName = computed(() => `${this.data()?.first_name} ${this.data()?.last_name}`);
    tags = computed(() => this.data()?.tags ?? ([] as string[]));

    canLike = computed(() => this.data()?.can_like);

    connection_status = computed(() =>
        this.data()?.likes_principal
            ? this.data()?.liked_by_principal
                ? 'connected'
                : 'liked'
            : 'none',
    );

    getImageUrl(i: number) {
        return `/api/pictures/by_id/${this.id()}/${i}`;
    }

    onImageError(event: Event) {
        const target = event.target as HTMLImageElement;
        target.style.display = 'none';
    }

    // likes

    likeUserMutation = injectMutation(() => ({
        mutationKey: ['like-user', { id: this.id() }],
        mutationFn: () => this.#rpcClient.createLike({ liked_id: this.id() }),
        onSuccess: () =>
            this.#queryClient.invalidateQueries({ queryKey: ['profile-by-id', { id: this.id() }] }),
    }));

    unlikeUserMutation = injectMutation(() => ({
        mutationKey: ['unlike-user', { id: this.id() }],
        mutationFn: () => this.#rpcClient.deleteLike({ liked_id: this.id() }),
        onSuccess: () =>
            this.#queryClient.invalidateQueries({ queryKey: ['profile-by-id', { id: this.id() }] }),
    }));

    // blocks

    blockUserMutation = injectMutation(() => ({
        mutationKey: ['block-user', { id: this.id() }],
        mutationFn: () => this.#rpcClient.createBlock({ blocked_id: this.id() }),
        onSuccess: async () => {
            await this.#router.navigate([
                {
                    outlets: {
                        sidesheet: null,
                    },
                },
            ]);
            this.#snackBar.enqueueSnackBar('User blocked');
            await this.#queryClient.invalidateQueries({
                queryKey: ['profile-by-id', { id: this.id() }],
            });
        },
    }));

    // reports

    reportUserMutation = injectMutation(() => ({
        mutationKey: ['report-user', { id: this.id() }],
        mutationFn: () => this.#rpcClient.createFakeUserReport({ reported_id: this.id() }),
        onSuccess: async () => {
            await this.#router.navigate([
                {
                    outlets: {
                        sidesheet: null,
                    },
                },
            ]);
            this.#snackBar.enqueueSnackBar('User reported');
            await this.#queryClient.invalidateQueries({
                queryKey: ['profile-by-id', { id: this.id() }],
            });
        },
    }));
}
