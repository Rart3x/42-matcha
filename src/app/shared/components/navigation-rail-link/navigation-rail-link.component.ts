import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { MatBadge } from '@angular/material/badge';

@Component({
    selector: 'app-navigation-rail-link',
    standalone: true,
    imports: [MatIcon, NgClass, MatBadge],
    template: `
        <div
            [ngClass]="[
                'group-[.active]:bg-secondary-container group-[.active]:px-4 group-[.active]:text-on-secondary-container group-[.active]:transition-[padding]',
                'group-hover:bg-secondary-container group-hover:px-4 group-hover:text-on-secondary-container group-hover:transition-[padding]',
                'flex items-center justify-center',
                'easing-linear duration-1000',
                'rounded-4xl px-1',
            ]"
        >
            <mat-icon [matBadge]="badge()" class="!size-fit text-3xl leading-8">
                {{ icon() }}
            </mat-icon>
        </div>
        <span class="leading-5">{{ label() }}</span>
    `,
    host: {
        role: 'link',
        class: 'group flex flex-col -gap-1 cursor-pointer justify-center items-center min-w-16',
        '[class.active]': 'active()',
    },
    styles: `
        :host:hover mat-icon,
        :host:focus mat-icon,
        :host.active mat-icon {
            font-variation-settings:
                'FILL' 1,
                'wght' 400,
                'GRAD' 1,
                'opsz' 24;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationRailLinkComponent {
    icon = input.required<string>();
    label = input.required<string>();

    active = input<boolean>(false);

    badge = input<number>();
}
