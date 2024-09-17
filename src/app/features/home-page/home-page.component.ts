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
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { RestrictedInputDirective } from '@app/shared/directives/restricted-input.directive';
import { MatInput } from '@angular/material/input';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

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
            class="relative flex grow flex-col gap-8 rounded-tl-2xl pr-6"
            cdkVirtualScrollingElement
        >
            <app-home-heading />

            <!-- Recommendations -->
            <div class="">
                <!-- Recommendations heading -->
                <div class="flex">
                    <div class="grow">
                        <h2 class="mat-display-small">Recommendations</h2>
                        <p class="mat-title-large">Here's some profiles we think you might like</p>
                    </div>
                    <div class="flex flex-col justify-end gap-1">
                        <button
                            mat-stroked-button
                            class="w-fit self-end"
                            (click)="openFiltersDialog()"
                        >
                            <mat-icon>filter_list</mat-icon>
                            add filters
                        </button>
                        <div class="mb-3 flex items-center gap-2">
                            <span class="mat-body-1">Sort by:</span>
                            <mat-button-toggle-group [(ngModel)]="sortBy" aria-label="Sort by">
                                <mat-button-toggle value="age">Age gap</mat-button-toggle>
                                <!--                    <mat-button-toggle value="location">Location</mat-button-toggle>-->
                                <mat-button-toggle value="fame_rating"
                                    >Fame rating
                                </mat-button-toggle>
                                <mat-button-toggle value="common_tags"
                                    >Common tags
                                </mat-button-toggle>
                            </mat-button-toggle-group>
                        </div>
                    </div>
                </div>

                <!-- Recommendations grid -->
                <cdk-virtual-scroll-viewport itemSize="200">
                    <div class="flex flex-col gap-2">
                        <div
                            class="grid h-[200px] grid-cols-2 gap-2"
                            *cdkVirtualFor="let row of rows()"
                        >
                            @for (user of row; track user.id) {
                                <div class="flex gap-2 rounded-lg bg-surface p-4">
                                    <div>
                                        <img
                                            [src]="'/api/pictures/by_id/' + user.id + '/0'"
                                            class="aspect-square w-24 rounded-xl"
                                        />
                                    </div>
                                    <div class="grow">
                                        <div>{{ user.username }}</div>
                                        <div>{{ user.first_name }} {{ user.last_name }}</div>
                                        <div>{{ user.age }}</div>
                                        <div>{{ user.fame_rating }}</div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
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
                    <div class="flex items-center gap-3">
                        <mat-slider [min]="0" [max]="15" [discrete]="false" [disabled]="false">
                            <input
                                matSliderThumb
                                placeholder="Minimum common tags"
                                [(ngModel)]="minimumCommonTags"
                            />
                        </mat-slider>
                        <span class="mat-body-1">{{ minimumCommonTags() }}</span>
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

    filtersDialog = viewChild<TemplateRef<any>>('filtersDialog');

    sortBy = signal<'age' | 'fame_rating' | 'common_tags' | 'location'>('fame_rating');
    age = signal<number | null>(null);
    minimumRating = signal<number | null>(null);
    minimumCommonTags = signal<number>(1);

    numColumns = signal(2);

    recommendations = injectInfiniteQuery(() => ({
        queryKey: [
            'recommendations',
            {
                orderBy: this.sortBy(),
                age: this.age() ?? undefined,
                minimum_rating: this.minimumRating() ?? undefined,
                minimum_common_tags: this.minimumCommonTags() ?? undefined,
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
            if (lastPage.users.length === 0) {
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
}
