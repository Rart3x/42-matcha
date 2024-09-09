import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';

// [ngClass]="[
// '',
//     'h-fit min-h-fit w-fit min-w-fit',
//     'inline-flex items-center justify-center',
//     '',
//     'rounded-4xl box-content',
//     '!text-8xl font-normal',
// ]"
@Component({
    selector: 'app-navigation-rail-link',
    standalone: true,
    imports: [MatIcon, NgClass],
    template: `
        <mat-icon
            class="group-hover:bg-secondary-container group-hover:text-on-secondary-container rounded-4xl m-0 box-content inline-flex !size-fit items-center justify-center text-3xl leading-8 group-hover:px-4 group-hover:transition-[padding]"
        >
            {{ icon() }}
        </mat-icon>
        <span class="leading-5">{{ label() }}</span>
    `,
    host: {
        role: 'link',
        class: 'group flex flex-col -gap-1 cursor-pointer justify-center items-center',
    },
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationRailLinkComponent {
    icon = input.required<string>();
    label = input.required<string>();
}

// align-self: center;
// display: flex;
// flex-direction: column;
// gap: .25rem;
// line-height: normal;
