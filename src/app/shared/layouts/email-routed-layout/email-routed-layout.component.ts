import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-email-routed-layout',
    standalone: true,
    imports: [MatIcon, NgClass],
    host: {
        class: 'block min-w-screen min-h-screen h-screen w-screen p-4 pb-0 medium:p-6 medium:pb-0 bg-surface medium:bg-surface-container overflow-x-hidden overflow-y-auto',
    },
    hostDirectives: [CdkScrollable],
    template: `
        <main
            [ngClass]="[
                'relative',
                'min-h-full',
                'rounded-t-xlarge p-4',
                'bg-surface text-on-surface',
                'flex flex-col items-stretch medium:items-center medium:justify-center',
            ]"
        >
            <header class="flex flex-col items-center medium:pb-8">
                <mat-icon class="!h-fit !w-fit text-center text-3xl medium:text-6xl">
                    {{ icon() }}
                </mat-icon>
                <h1 class="text-pretty text-center !text-3xl font-bold medium:text-4xl">
                    {{ title() }}
                </h1>
            </header>
            <div class="flex grow flex-col items-stretch justify-center medium:contents">
                <div class="flex min-h-48 w-full flex-col items-stretch medium:w-96">
                    <ng-content />
                </div>
            </div>
        </main>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailRoutedLayoutComponent {
    title = input.required<string>();
    icon = input.required<string>();
}
