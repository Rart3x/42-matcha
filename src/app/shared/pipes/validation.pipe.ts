import {
    ChangeDetectorRef,
    DestroyRef,
    inject,
    OnDestroy,
    Pipe,
    PipeTransform,
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ApiValidationError } from '@api/validators/ApiValidator';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, merge, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Pipe({
    name: 'validation',
    standalone: true,
})
export class ValidationPipe<T> implements PipeTransform, OnDestroy {
    #destroyRef = inject(DestroyRef);
    #changeDetectorRef = inject(ChangeDetectorRef);

    #asyncPipe = new AsyncPipe(this.#changeDetectorRef);

    transform<T extends Record<string, AbstractControl>>(
        group: FormGroup<T>,
        controlName: keyof T,
    ) {
        const control = group.get(controlName as string);

        if (!control) {
            throw new Error('Control not found');
        }

        return this.#asyncPipe.transform(
            merge([group.statusChanges, control.statusChanges]).pipe(
                takeUntilDestroyed(this.#destroyRef),
                map(() => {
                    if (control.hasError('required')) {
                        return 'This field is required';
                    }

                    if (control.hasError('fromApi')) {
                        const errors = control.getError('fromApi') as
                            | Partial<ApiValidationError>[]
                            | null;

                        if (
                            errors instanceof Array &&
                            errors.length > 0 &&
                            errors[0].message
                        ) {
                            return errors[0].message;
                        }
                    }
                    return null;
                }),
            ),
        );
    }

    ngOnDestroy() {
        this.#asyncPipe.ngOnDestroy();
    }
}
