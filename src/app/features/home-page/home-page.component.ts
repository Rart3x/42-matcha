import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
    TemplateRef,
    viewChild,
} from '@angular/core';
import { MatAnchor, MatButton, MatIconButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { ScoreIndicatorComponent } from '@app/shared/components/score-indicator/score-indicator.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCard } from '@angular/material/card';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { HomeHeadingComponent } from '@app/features/home-page/home-heading.component';
import {
    injectInfiniteQuery,
    injectMutation,
    injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { SnackBarService } from '@app/core/services/snack-bar.service';
import {
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
} from '@angular/material/dialog';
import {
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollableElement,
    CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { RestrictedInputDirective } from '@app/shared/directives/restricted-input.directive';
import { MatInput } from '@angular/material/input';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
    MatListItem,
    MatListItemAvatar,
    MatListItemLine,
    MatListItemMeta,
    MatListItemTitle,
    MatNavList,
} from '@angular/material/list';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NgClass } from '@angular/common';

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
        HomeHeadingComponent,
        MatIconButton,
        CdkVirtualScrollableElement,
        FormsModule,
        CdkVirtualScrollViewport,
        CdkFixedSizeVirtualScroll,
        CdkVirtualForOf,
        MatDialogActions,
        MatLabel,
        MatHint,
        RestrictedInputDirective,
        MatInput,
        MatFormField,
        MatDialogContent,
        MatDialogTitle,
        MatSlider,
        MatDialogClose,
        MatSliderThumb,
        MatProgressSpinner,
        MatNavList,
        MatListItem,
        MatListItemTitle,
        MatListItemAvatar,
        MatListItemLine,
        MatListItemMeta,
        NgClass,
        MatSuffix,
    ],
    host: { class: 'flex min-h-full relative flex-col gap-1' },
    template: `
        <mat-toolbar class="!bg-transparent">
            <mat-toolbar-row class="!pt-2">
                <span class="grow"></span>
                <button mat-icon-button matTooltip="notifications">
                    <mat-icon>notifications</mat-icon>
                </button>

                <button mat-icon-button matTooltip="logout" (click)="logout.mutate()">
                    <mat-icon>logout</mat-icon>
                </button>
            </mat-toolbar-row>
        </mat-toolbar>

        <div
            class="relative flex grow flex-col gap-8 rounded-tl-2xl pr-3 expanded:pr-6"
            cdkVirtualScrollingElement
        >
            <app-home-heading />

            <!-- Recommendations -->
            <div class="">
                <!-- Recommendations heading -->
                <div class="flex max-expanded:justify-between max-expanded:pl-3">
                    <div class="expanded:grow max-expanded:flex max-expanded:items-center">
                        <h2
                            [ngClass]="[
                                isCompactScreen()
                                    ? 'mat-headline-small'
                                    : isMediumScreen()
                                      ? 'mat-headline-large'
                                      : 'mat-display-small',
                            ]"
                            class="max-expanded:!mb-0 max-expanded:block"
                        >
                            Recommendations
                        </h2>
                        <p class="mat-title-large max-expanded:hidden">
                            Here's some profiles we think you might like
                        </p>
                    </div>
                    <div class="flex justify-end gap-1 expanded:flex-col max-expanded:items-center">
                        <button mat-stroked-button class="w-fit" (click)="openFiltersDialog()">
                            <mat-icon>filter_list</mat-icon>
                            add filters
                        </button>
                    </div>
                </div>

                <!-- Recommendations grid -->
                <cdk-virtual-scroll-viewport itemSize="80">
                    <mat-nav-list class="flex flex-col max-medium:!pl-2">
                        <div
                            class="grid h-[80px] gap-2 expanded:grid-cols-2"
                            *cdkVirtualFor="let row of rows()"
                        >
                            @for (user of row; track user.id) {
                                <a
                                    mat-list-item
                                    class="h-[80px] !rounded-xl !bg-surface"
                                    (click)="openProfileInSideSheet(user.id)"
                                >
                                    <img
                                        matListItemAvatar
                                        [src]="'/api/pictures/by_id/' + user.id + '/0'"
                                        alt="Avatar"
                                    />
                                    <span matListItemTitle>{{ user.first_name }}</span>
                                    <span matListItemLine class="max-w-60 text-ellipsis">
                                        {{ user.biography }}
                                    </span>
                                    <span matListItemMeta> {{ user.age }} yo </span>
                                </a>
                            }
                        </div>
                    </mat-nav-list>
                    <div class="m-4 flex justify-center">
                        @if (recommendations.isFetchingNextPage()) {
                            <mat-progress-spinner diameter="32" mode="indeterminate" />
                        } @else if (!recommendations.hasNextPage()) {
                            <span class="mat-body-1">No more recommendations</span>
                        } @else {
                            <button mat-button (click)="recommendations.fetchNextPage()">
                                Load more
                            </button>
                        }
                    </div>
                </cdk-virtual-scroll-viewport>
            </div>
        </div>

        <!-- Recommendations filters dialog -->
        <ng-template #filtersDialog>
            <h2 mat-dialog-title>Filters</h2>
            <mat-dialog-content>
                <div class="grid gap-2">
                    <mat-form-field>
                        <mat-label>Age</mat-label>
                        <input
                            appRestrictedInput
                            pattern="^[0-9]*$"
                            [maxLength]="3"
                            matInput
                            type="number"
                            placeholder="Age"
                            [(ngModel)]="age"
                        />
                        <mat-hint>Leave empty to ignore</mat-hint>
                    </mat-form-field>
                    <mat-form-field>
                        <mat-label>Minimum rating</mat-label>
                        <input
                            appRestrictedInput
                            pattern="^[0-9]*$"
                            [maxLength]="3"
                            matInput
                            type="number"
                            placeholder="Minimum rating"
                            [(ngModel)]="minimumRating"
                        />
                        <mat-hint>Leave empty to ignore</mat-hint>
                    </mat-form-field>

                    <mat-form-field>
                        <mat-label>Maximum Distance</mat-label>
                        <input
                            appRestrictedInput
                            pattern="^[0-9]*$"
                            [maxLength]="6"
                            matInput
                            type="number"
                            placeholder="Maximum Distance"
                            [(ngModel)]="maximumDistance"
                        />
                        <span matSuffix class="px-2">km</span>
                        <mat-hint>Leave empty to ignore</mat-hint>
                    </mat-form-field>
                    <div class="flex items-center gap-3">
                        <span class="mat-body-1">Minimum common tags:</span>
                        <mat-slider [min]="0" [max]="15" [discrete]="false" [disabled]="false">
                            <input
                                matSliderThumb
                                placeholder="Minimum common tags"
                                [(ngModel)]="minimumCommonTags"
                            />
                        </mat-slider>
                        <span class="mat-body-1">{{ minimumCommonTags() }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="mat-body-1">Sort by:</span>
                        <mat-button-toggle-group
                            [(ngModel)]="sortBy"
                            aria-label="Sort by"
                            [hideSingleSelectionIndicator]="isMediumScreen()"
                        >
                            <mat-button-toggle value="age">
                                age
                                <span class="max-expanded:hidden"> gap </span>
                            </mat-button-toggle>
                            <mat-button-toggle value="distance">Distance</mat-button-toggle>
                            <mat-button-toggle value="fame_rating">
                                <span class="max-expanded:hidden">fame </span>rating
                            </mat-button-toggle>
                            <mat-button-toggle value="common_tags">
                                <span class="max-expanded:hidden"> common </span>tags
                            </mat-button-toggle>
                        </mat-button-toggle-group>
                    </div>
                </div>
            </mat-dialog-content>
            <mat-dialog-actions>
                <button mat-button mat-dialog-close>Apply</button>
            </mat-dialog-actions>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
    PAGE_SIZE = 20;

    #rpcClient = injectRpcClient();
    #queryClient = injectQueryClient();
    #snackBar = inject(SnackBarService);
    #router = inject(Router);
    #dialog = inject(MatDialog);

    #breakpointObserver = inject(BreakpointObserver);

    isMediumScreen = toSignal(
        this.#breakpointObserver
            .observe('(max-width: 840px)')
            .pipe(map((result) => result.matches)),
    );

    isCompactScreen = toSignal(
        this.#breakpointObserver
            .observe('(max-width: 600px)')
            .pipe(map((result) => result.matches)),
    );

    filtersDialog = viewChild<TemplateRef<any>>('filtersDialog');

    sortBy = signal<'age' | 'fame_rating' | 'common_tags' | 'distance'>('fame_rating');
    age = signal<number | null>(null);
    minimumRating = signal<number | null>(null);
    minimumCommonTags = signal<number>(1);
    maximumDistance = signal<number>(100);

    numColumns = computed(() => (this.isMediumScreen() ? 1 : 2));

    recommendations = injectInfiniteQuery(() => ({
        queryKey: [
            'recommendations',
            {
                orderBy: this.sortBy(),
                age: this.age() ?? undefined,
                minimum_rating: this.minimumRating() ?? undefined,
                minimum_common_tags: this.minimumCommonTags() ?? undefined,
                maximum_distance: this.maximumDistance() ?? undefined,
            },
        ] as const,
        queryFn: ({ queryKey: [_, params], pageParam }) =>
            this.#rpcClient.browseUsers({
                ...params,
                offset: pageParam * this.PAGE_SIZE,
                limit: this.PAGE_SIZE,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.users.length < this.PAGE_SIZE) {
                return undefined;
            }
            return lastPageParam + 1;
        },
    }));

    rows = computed(() => {
        const pages = this.recommendations.data()?.pages ?? [];

        const users = pages.flatMap((page) => page.users);
        const rows = [] as (typeof users)[];
        for (let i = 0; i < users.length; i += this.numColumns()) {
            rows.push(users.slice(i, i + this.numColumns()));
        }
        return rows;
    });

    openFiltersDialog() {
        const filtersDialog = this.filtersDialog();
        if (filtersDialog) {
            this.#dialog.open(filtersDialog);
        }
    }

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

    openProfileInSideSheet(user_id: string) {
        void this.#router.navigate([{ outlets: { sidesheet: ['profile', user_id] } }]);
    }
}
