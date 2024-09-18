import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-score-indicator',
    standalone: true,
    imports: [MatIcon],
    template: `
        <mat-icon
            class="!size-fit rounded-full bg-tertiary-container p-2 text-[1.30rem] text-on-tertiary-container"
        >
            {{ icon() }}
        </mat-icon>
        <span class="text-on-surface-variant"> {{ score() ?? '??' }} </span>
    `,
    styles: ``,
    host: { class: 'flex flex-col items-center justify-center' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreIndicatorComponent {
    icon = input.required<string>();
    score = input.required<number | undefined>();
}
