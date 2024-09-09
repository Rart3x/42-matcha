import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-score-indicator',
    standalone: true,
    imports: [MatIcon],
    template: `
        <mat-icon
            class="bg-tertiary-container text-on-tertiary-container !size-fit rounded-full p-2"
        >
            {{ icon() }}
        </mat-icon>
        <span class="text-on-surface-variant !text-xl"> {{ score() }} </span>
    `,
    styles: ``,
    host: { class: 'flex flex-col items-center justify-center' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreIndicatorComponent {
    icon = input.required<string>();
    score = input.required<number>();
}
