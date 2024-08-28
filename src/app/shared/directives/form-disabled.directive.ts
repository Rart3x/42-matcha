import { Directive, effect, input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Directive({
    selector: '[appFormDisabled]',
    standalone: true,
})
export class FormDisabledDirective {
    formGroup = input.required<FormGroup>();
    appFormDisabled = input.required<boolean>();

    constructor() {
        effect(() => {
            if (this.appFormDisabled()) {
                this.formGroup().disable();
            } else {
                this.formGroup().enable();
            }
        });
    }
}
