import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    input,
    Signal,
    signal,
    viewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import {
    MatAutocomplete,
    MatAutocompleteActivatedEvent,
    MatAutocompleteSelectedEvent,
    MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatIcon } from '@angular/material/icon';
import {
    MatChipGrid,
    MatChipInput,
    MatChipInputEvent,
    MatChipRemove,
    MatChipRow,
} from '@angular/material/chips';
import { RxLet } from '@rx-angular/template/let';
import { RestrictedInputDirective } from '@app/shared/directives/restricted-input.directive';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor';
import { derivedFrom } from 'ngxtension/derived-from';
import { map, pipe, startWith, switchMap } from 'rxjs';

@Component({
    selector: 'app-tags-input',
    standalone: true,
    imports: [
        CdkFixedSizeVirtualScroll,
        MatLabel,
        MatHint,
        MatError,
        MatOption,
        MatAutocomplete,
        MatIcon,
        MatChipRow,
        MatChipGrid,
        MatFormField,
        RxLet,
        ReactiveFormsModule,
        FormsModule,
        RestrictedInputDirective,
        MatChipInput,
        MatAutocompleteTrigger,
        CdkVirtualScrollViewport,
        CdkVirtualForOf,
        MatChipRemove,
    ],
    template: `
        <mat-form-field>
            <mat-label>Likes</mat-label>

            <!-- Chips -->
            <mat-chip-grid #chipGrid aria-label="Tag selection" [formControl]="formControl()">
                @for (tag of tags(); track tag) {
                    <mat-chip-row (removed)="tagRemoved(tag)">
                        {{ tag }}
                        <button matChipRemove [attr.aria-label]="'Remove ' + tag + ' tag'">
                            <mat-icon>cancel</mat-icon>
                        </button>
                    </mat-chip-row>
                }
            </mat-chip-grid>

            <!-- Input -->
            <input
                [(ngModel)]="currentSearch"
                [ngModelOptions]="{ standalone: true }"
                appRestrictedInput
                pattern="^[a-zA-Z0-9]-*$"
                [maxLength]="20"
                name="currentTag"
                placeholder="I like ..."
                [matChipInputFor]="chipGrid"
                [matAutocomplete]="auto"
                [matChipInputSeparatorKeyCodes]="tagSeparatorKeysCodes"
                (matChipInputTokenEnd)="tagAdded($event)"
            />

            <!-- Autocomplete -->
            <mat-autocomplete
                #auto="matAutocomplete"
                (optionSelected)="tagSelected($event)"
                (optionActivated)="tagActivated($event)"
                (closed)="panelClosed()"
            >
                <cdk-virtual-scroll-viewport
                    itemSize="25"
                    class="h-[200px]"
                    (scrolledIndexChange)="scrollIndex.set($event)"
                >
                    <mat-option *cdkVirtualFor="let tag of autocompletedTags()" [value]="tag">
                        {{ tag }}
                    </mat-option>
                </cdk-virtual-scroll-viewport>
            </mat-autocomplete>

            <mat-hint>
                @if (!formControl().value?.length) {
                    Add tags to describe your interests.
                }
            </mat-hint>

            <mat-error>
                @if (formControl().hasError('required') || formControl().hasError('minlength')) {
                    Must have at least 3 tags
                } @else if (formControl().hasError('maxlength')) {
                    Must have at most 10 tags
                }
            </mat-error>
        </mat-form-field>
    `,
    host: { class: 'grid place-content-stretch' }, // make form field same size as host
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [NgxControlValueAccessor],
})
export class TagsInputComponent {
    #rpcClient = injectRpcClient();

    autocomplete = viewChild(MatAutocomplete);
    autocompleteTrigger = viewChild(MatAutocompleteTrigger);
    virtualscroll = viewChild(CdkVirtualScrollViewport);

    currentSearch = signal('');
    scrollIndex = signal(0);
    activeIndex = signal<number | null>(null);

    /* data fetching */

    existingTags = injectInfiniteQuery(() => ({
        queryKey: ['tags', this.currentSearch()],
        queryFn: ({ pageParam }) =>
            this.#rpcClient.getExistingTags({
                tag: this.currentSearch(),
                offset: pageParam * 10,
                limit: 10,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.tags.length === 0) {
                return undefined;
            }
            return lastPageParam + 1;
        },
        enabled: this.currentSearch().length >= 3,
    }));

    autocompletedTags = computed(() => {
        const pages = this.existingTags.data()?.pages ?? [];

        if (this.currentSearch().length < 3) {
            return [];
        }

        return pages.flatMap((page) => page.tags);
    });

    autocompletedTagsCount = computed(() => this.autocompletedTags().length);

    #scrollEffect = effect(async () => {
        if (
            this.scrollIndex() > this.autocompletedTagsCount() - 5 &&
            this.autocompleteTrigger()?.panelOpen
        ) {
            await this.fetchNextPage();
        }
    });

    #fetchedEffect = effect(async () => {
        if (
            this.existingTags.isFetched() &&
            this.scrollIndex() > this.autocompletedTagsCount() - 5 &&
            this.autocompleteTrigger()?.panelOpen
        ) {
            await this.fetchNextPage();
        }
    });

    #autocompletedTagsChangedEffect = effect(() => {
        void this.autocompletedTags(); // trigger computation
        const activeIndex = this.activeIndex();

        if (activeIndex !== null) {
            this.autocomplete()?._keyManager?.setActiveItem(activeIndex);
            console.log('autocomplete key manager set active item', activeIndex);
        }
    });

    async fetchNextPage() {
        console.log('fetching next page');
        // Do nothing if already fetching
        // TODO:add more exclusion logic
        if (this.existingTags.isFetching()) return;
        await this.existingTags.fetchNextPage();
    }

    /* interaction */

    formControl = input<FormControl<string[] | null>>(new FormControl([]));

    tags: Signal<string[]> = derivedFrom(
        [this.formControl],
        pipe(
            switchMap(([formControl]) => formControl?.valueChanges ?? []),
            map((tags) => tags ?? []),
            startWith([] as string[]),
        ),
    );

    readonly tagSeparatorKeysCodes: number[] = [ENTER, COMMA];

    tagAdded(event: MatChipInputEvent): void {
        const tags = this.tags();
        const value = (event.value || '').trim();

        if (value && !tags.includes(value)) {
            this.formControl().setValue([...tags, value]);
        }
        event.chipInput?.clear();
        this.autocompleteTrigger()?.closePanel();
    }

    tagRemoved(tag: string): void {
        const tags = this.tags();
        const index = tags.indexOf(tag);

        if (0 <= index) {
            this.formControl().setValue(tags.slice(0, index).concat(tags.slice(index + 1)));
        }
    }

    tagSelected(event: MatAutocompleteSelectedEvent): void {
        const tags = this.tags();

        if (!tags.includes(event.option.viewValue)) {
            this.formControl().setValue([...tags, event.option.viewValue]);
        }
        this.currentSearch.set('');
        event.option.deselect();
    }

    tagActivated(event: MatAutocompleteActivatedEvent) {
        const tag = event.option?.value;
        if (!tag) return;

        const index = this.autocompletedTags().indexOf(tag);
        if (index === -1) return;

        console.log('tagActivated', { index, tag });
        this.activeIndex.set(index);

        this.virtualscroll()?.scrollToIndex(index);
    }

    panelClosed() {
        this.activeIndex.set(null);
    }
}
