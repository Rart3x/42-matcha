import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { BackButtonDirective } from '@app/shared/directives/back-button.directive';
import { Router } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-sidesheet',
    standalone: true,
    imports: [MatIconButton, MatIcon, BackButtonDirective, MatTooltip],
    template: `
        <div class="flex items-center gap-3 p-6">
            <!--            <button mat-icon-button aria-label="Navigate back" appBackButton>-->
            <!--                <mat-icon>arrow_back</mat-icon>-->
            <!--            </button>-->
            <span class="mat-title-large grow">
                {{ title() }}
            </span>
            <button
                type="button"
                mat-icon-button
                aria-label="Close sidesheet"
                (click)="closeSideSheet()"
                matTooltip="Close"
                #closeButton
            >
                <mat-icon>close</mat-icon>
            </button>
            <button type="button" mat-icon-button aria-label="Close sidesheet" hidden>
                <mat-icon>close</mat-icon>
            </button>
        </div>
        <div class="grow px-6" #content>
            <ng-content />
        </div>
    `,
    host: { class: 'relative flex flex-col min-h-full w-full max-w-full ' },
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidesheetComponent {
    #router = inject(Router);

    title = input.required<string>();

    async closeSideSheet() {
        await this.#router.navigate([{ outlets: { sidesheet: null } }]);
    }
}
