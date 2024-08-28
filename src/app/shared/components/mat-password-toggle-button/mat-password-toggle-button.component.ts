import {
    ChangeDetectionStrategy,
    Component,
    effect,
    input,
    signal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'mat-password-toggle-button',
    standalone: true,
    imports: [MatIcon, MatIconButton, MatTooltip],
    template: `
        <button
            type="button"
            mat-icon-button
            (click)="togglePasswordVisibility($event)"
            class="mr-1"
            [disabled]="disabled() ?? false"
            [matTooltip]="
                isPasswordHidden() ? 'Show password' : 'Hide password'
            "
        >
            <mat-icon>
                @if (isPasswordHidden()) {
                    visibility_off
                } @else {
                    visibility
                }
            </mat-icon>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [MatTooltip],
    host: { class: '[display:contents]' },
})
export class MatPasswordToggleButtonComponent {
    inputElement = input.required<HTMLInputElement>();
    disabled = input<boolean>();

    isPasswordHidden = signal(true);

    togglePasswordVisibility(ev: MouseEvent) {
        ev.stopPropagation();
        this.isPasswordHidden.set(!this.isPasswordHidden());
    }

    constructor() {
        effect(() => {
            this.inputElement().type = this.isPasswordHidden()
                ? 'password'
                : 'text';
        });
    }
}
