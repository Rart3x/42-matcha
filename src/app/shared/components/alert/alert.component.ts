import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-alert',
    standalone: true,
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span class="font-medium">
            <ng-content select="[heading]"></ng-content>
        </span>
        <ng-content />
    `,
    host: { class: 'block bg-error-container text-on-error-container p-4 rounded-md' },
})
export class AlertComponent {}
