import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
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
import { injectQuery } from '@tanstack/angular-query-experimental';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor';
import { derivedFrom } from 'ngxtension/derived-from';
import { map, pipe, startWith, switchMap } from 'rxjs';
import { AfterViewInitDirective } from '@app/shared/directives/after-view-init.directive';

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
        AfterViewInitDirective,
    ],
    template: `
        <mat-form-field [appearance]="appearance()">
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
                #input
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
                @for (tag of autoCompletedTags.data()?.tags; track tag) {
                    <mat-option [value]="tag">
                        {{ tag }}
                    </mat-option>
                }
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
    PAGE_SIZE = 5;

    #rpcClient = injectRpcClient();

    appearance = input<'fill' | 'outline'>('fill');

    autocompleteTrigger = viewChild(MatAutocompleteTrigger);

    currentSearch = signal('');
    activatedOption = signal<MatOption | null>(null);

    input = viewChild<ElementRef<HTMLInputElement>>('input');

    autoCompletedTags = injectQuery(() => ({
        queryKey: ['tags', this.currentSearch()],
        queryFn: ({ queryKey: [_, currentSearch] }) =>
            this.#rpcClient.getExistingTags({
                tag: currentSearch,
                offset: 0,
                limit: this.PAGE_SIZE,
            }),
        enabled: () => this.currentSearch().length > 0,
    }));

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

        const activatedOption = this.activatedOption();
        if (activatedOption) {
            activatedOption.select();
        } else if (value && !tags.includes(value)) {
            this.formControl().setValue([...tags, value]);
        }
        this.autocompleteTrigger()?.closePanel();

        this.#clearSearch();
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
        event.option.deselect();

        this.#clearSearch();
    }

    tagActivated(event: MatAutocompleteActivatedEvent): void {
        this.activatedOption.set(event.option);
    }

    panelClosed(): void {
        this.activatedOption.set(null);
    }

    #clearSearch(): void {
        this.currentSearch.set('');
        const input = this.input()?.nativeElement;
        if (input) {
            input.value = '';
        }
    }
}
