import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import {
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollableElement,
    CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { RestrictedInputDirective } from '@app/shared/directives/restricted-input.directive';
import { MatInput } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { injectBreakpoints } from '@app/shared/injectors/breakpoint-observer';
import { MatNavList } from '@angular/material/list';
import {
    MatGridList,
    MatGridTile,
    MatGridTileHeaderCssMatStyler,
} from '@angular/material/grid-list';
import { injectSearchUsersQuery } from '@app/shared/queries/search.queries';
import {
    MatCard,
    MatCardActions,
    MatCardAvatar,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
} from '@angular/material/card';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TagsInputComponent } from '@app/shared/components/tags-input/tags-input.component';
import { Router } from '@angular/router';
import { ToolbarComponent } from '@app/shared/components/toolbar/toolbar.component';

@Component({
    selector: 'app-browse-page',
    standalone: true,
    imports: [
        MatIcon,
        MatIconButton,
        MatTooltip,
        CdkVirtualScrollableElement,
        MatFormField,
        RestrictedInputDirective,
        MatInput,
        FormsModule,
        MatHint,
        MatLabel,
        MatExpansionPanel,
        MatExpansionPanelTitle,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        CdkVirtualScrollViewport,
        CdkFixedSizeVirtualScroll,
        MatNavList,
        MatGridList,
        MatGridTile,
        MatGridTileHeaderCssMatStyler,
        MatButton,
        MatCard,
        MatCardContent,
        MatCardHeader,
        MatCardTitle,
        MatCardAvatar,
        MatCardActions,
        MatCardSubtitle,
        MatButtonToggle,
        MatButtonToggleGroup,
        TagsInputComponent,
        ReactiveFormsModule,
        ToolbarComponent,
    ],
    host: { class: 'grid grid-rows-[auto_1fr] overflow-hidden absolute inset-0' },
    template: `
        <app-toolbar title="Search" />

        <div
            class="relative flex flex-col gap-8 rounded-tl-2xl pr-3 expanded:pr-6 max-medium:px-3"
            cdkVirtualScrollingElement
        >
            <!-- filter -->
            <mat-expansion-panel>
                <mat-expansion-panel-header>
                    <mat-panel-title>Filter</mat-panel-title>
                    <mat-panel-description class="!justify-between">
                        Enter your preferences
                        <mat-icon>filter_alt</mat-icon>
                    </mat-panel-description>
                </mat-expansion-panel-header>

                <div class="flex flex-wrap gap-2">
                    <mat-form-field appearance="outline">
                        <mat-label>Max age difference</mat-label>
                        <input
                            appRestrictedInput
                            pattern="^[0-9]*$"
                            [maxLength]="3"
                            matInput
                            type="number"
                            placeholder="Age"
                            [(ngModel)]="maximum_age_gap"
                        />
                        <mat-hint>Leave empty to ignore</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Max fame rating difference</mat-label>
                        <input
                            appRestrictedInput
                            pattern="^[0-9]*$"
                            [maxLength]="3"
                            matInput
                            type="number"
                            placeholder="Fame rating"
                            [(ngModel)]="maximum_fame_rating_gap"
                        />
                        <mat-hint>Leave empty to ignore</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Max distance</mat-label>
                        <input
                            appRestrictedInput
                            pattern="^[0-9]*$"
                            [maxLength]="3"
                            matInput
                            type="number"
                            placeholder="Distance"
                            [(ngModel)]="maximum_distance"
                        />
                        <mat-hint>Leave empty to ignore</mat-hint>
                    </mat-form-field>

                    <app-tags-input [formControl]="tagsControl" appearance="outline" />
                </div>
            </mat-expansion-panel>

            <!-- sort by -->
            <div class="flex items-center justify-end gap-2">
                <span class="mat-body-1">Sort by:</span>
                <mat-button-toggle-group
                    [(ngModel)]="orderBy"
                    aria-label="Sort by"
                    [hideSingleSelectionIndicator]="breakpoints()?.isCompact"
                >
                    <mat-button-toggle value="age">
                        age
                        <span class="max-expanded:hidden">diff</span>
                    </mat-button-toggle>
                    <mat-button-toggle value="distance">
                        <span class="max-expanded:hidden">max</span>
                        distance
                    </mat-button-toggle>
                    <mat-button-toggle value="fame_rating">
                        <span class="max-expanded:hidden">fame</span>
                        rating
                    </mat-button-toggle>
                    <mat-button-toggle value="common_tags">
                        <span class="max-expanded:hidden">common</span>
                        tags
                    </mat-button-toggle>
                </mat-button-toggle-group>
            </div>

            <!-- results -->
            @let rowHeight = 160;
            <cdk-virtual-scroll-viewport [itemSize]="rowHeight">
                <mat-grid-list [cols]="numColumns()" [rowHeight]="rowHeight">
                    @for (result of search.results(); track result.id) {
                        <mat-grid-tile>
                            <mat-card class="h-full w-full" appearance="outlined">
                                <mat-card-header>
                                    <img
                                        mat-card-avatar
                                        [src]="'/api/pictures/by_id/' + result.id + '/0'"
                                        alt="User avatar"
                                    />
                                    <mat-card-title>{{ result.username }}</mat-card-title>
                                    <mat-card-subtitle>
                                        {{ [result.gender, result.age + ' yo'].join(', ') }}
                                    </mat-card-subtitle>
                                </mat-card-header>
                                <mat-card-content class="grow">{{ result.bio }}</mat-card-content>
                                <mat-card-actions class="justify-end">
                                    <button
                                        mat-stroked-button
                                        (click)="openProfileInSideSheet(result.id)"
                                    >
                                        View profile
                                    </button>
                                </mat-card-actions>
                            </mat-card>
                        </mat-grid-tile>
                    }
                </mat-grid-list>

                @if (search.hasNextPage()) {
                    <div class="flex justify-center p-2">
                        <button
                            mat-button
                            (click)="search.fetchNextPage()"
                            [disabled]="search.isPending()"
                        >
                            Load more
                        </button>
                    </div>
                }
            </cdk-virtual-scroll-viewport>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowsePageComponent {
    #router = inject(Router);

    maximum_age_gap = signal<number | undefined>(undefined);
    maximum_fame_rating_gap = signal<number | undefined>(undefined);
    maximum_distance = signal<number | undefined>(undefined);

    tagsControl = new FormControl([] as string[], { nonNullable: true });

    required_tags = toSignal(
        this.tagsControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
        {
            initialValue: [] as string[],
        },
    );

    orderBy = signal<'age' | 'distance' | 'fame_rating' | 'common_tags'>('age');

    search = injectSearchUsersQuery(() => ({
        maximum_age_gap: this.maximum_age_gap(),
        maximum_fame_rating_gap: this.maximum_fame_rating_gap(),
        maximum_distance: this.maximum_distance(),
        required_tags: this.required_tags(),
        orderBy: this.orderBy(),
    }));

    breakpoints = injectBreakpoints();

    numColumns = computed(() =>
        this.breakpoints()?.isExtraLarge ? 3 : this.breakpoints()?.isMedium ? 2 : 1,
    );

    openProfileInSideSheet(user_id: number) {
        void this.#router.navigate([{ outlets: { sidesheet: ['profile', user_id] } }]);
    }
}
