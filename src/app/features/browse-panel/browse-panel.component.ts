import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
    TemplateRef,
    viewChild,
} from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { RestrictedInputDirective } from '@app/shared/directives/restricted-input.directive';
import { MatSliderModule } from '@angular/material/slider';

@Component({
    selector: 'app-browse-panel',
    standalone: true,
    imports: [
        MatButtonToggle,
        MatButtonToggleGroup,
        FormsModule,
        MatButton,
        MatIcon,
        MatDialogModule,
        MatFormField,
        MatInput,
        MatFormFieldModule,
        RestrictedInputDirective,
        MatSliderModule,
    ],
    template: `
        <!-- heading -->
        <div class="flex">
            <div class="grow">
                <h2 class="mat-display-small">Recommendations</h2>
                <p class="mat-title-large">Here's some profiles we think you might like</p>
            </div>
            <div class="flex flex-col justify-end gap-1">
                <button mat-stroked-button class="w-fit self-end" (click)="openFiltersDialog()">
                    <mat-icon>filter_list</mat-icon>
                    add filters
                </button>
                <div class="mb-3 flex items-center gap-2">
                    <span class="mat-body-1">Sort by:</span>
                    <mat-button-toggle-group [(ngModel)]="sortBy" aria-label="Sort by">
                        <mat-button-toggle value="age">Age gap</mat-button-toggle>
                        <!--                    <mat-button-toggle value="location">Location</mat-button-toggle>-->
                        <mat-button-toggle value="fame_rating">Fame rating</mat-button-toggle>
                        <mat-button-toggle value="common_tags">Common tags</mat-button-toggle>
                    </mat-button-toggle-group>
                </div>
            </div>
        </div>

        <!-- filters dialog -->
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

        <!-- grid -->
        <div class="grid grid-cols-2 gap-4">
            @for (user of recommendations.data()?.users; track user.id) {
                <div class="rounded-lg bg-surface p-4">
                    <div>{{ user.username }}</div>
                    <div>{{ user.first_name }} {{ user.last_name }}</div>
                    <div>{{ user.age }}</div>
                    <div>{{ user.fame_rating }}</div>
                </div>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowsePanelComponent {
    #rpcClient = injectRpcClient();
    #dialog = inject(MatDialog);

    filtersDialog = viewChild<TemplateRef<any>>('filtersDialog');

    sortBy = signal<'age' | 'fame_rating' | 'common_tags' | 'location'>('fame_rating');
    age = signal<number | null>(null);
    minimumRating = signal<number | null>(null);
    minimumCommonTags = signal<number>(1);

    recommendations = injectQuery(() => ({
        queryKey: [
            'recommendations',
            {
                orderBy: this.sortBy(),
                age: this.age() ?? undefined,
                minimum_rating: this.minimumRating() ?? undefined,
                minimum_common_tags: this.minimumCommonTags() ?? undefined,
            },
        ] as const,
        queryFn: ({ queryKey: [_, params] }) => this.#rpcClient.browseUsers(params),
    }));

    openFiltersDialog() {
        const filtersDialog = this.filtersDialog();
        if (filtersDialog) {
            this.#dialog.open(filtersDialog);
        }
    }
}
