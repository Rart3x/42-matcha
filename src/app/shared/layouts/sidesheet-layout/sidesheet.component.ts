import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { BackButtonDirective } from '@app/shared/directives/back-button.directive';
import { Router } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-sidesheet',
    standalone: true,
    imports: [MatIconButton, MatIcon, BackButtonDirective, MatTooltip, MatProgressBar, NgClass],
    template: `
        <div class="flex items-center gap-3 p-6">
            <!--            <button mat-icon-button aria-label="Navigate back" appBackButton>-->
            <!--                <mat-icon>arrow_back</mat-icon>-->
            <!--            </button>-->
            <span class="mat-title-large grow">
                {{ heading() }}
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
        @if (loading() && !error()) {
            <mat-progress-bar mode="indeterminate" />
        }
        <div class="relative grow overflow-y-auto px-6">
            <div [ngClass]="[loading() || error() ? 'hidden' : '']">
                <ng-content />
            </div>
            <div [ngClass]="[!error() ? 'hidden' : 'grid h-full place-content-center']">
                <ng-content select="[error]" />
            </div>
        </div>
        <div
            class="flex h-[72px] items-center gap-2 border-t border-t-outline-variant p-6 empty:hidden"
        >
            <ng-content select="[bottom-actions]" />
        </div>
    `,
    host: { class: 'absolute inset-0 flex flex-col  max-w-full ' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidesheetComponent {
    #router = inject(Router);

    heading = input.required<string>();

    loading = input(false);

    error = input(false);

    async closeSideSheet() {
        await this.#router.navigate([{ outlets: { sidesheet: null } }]);
    }
}
