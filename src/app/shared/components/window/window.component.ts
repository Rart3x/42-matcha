import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-window',
    standalone: true,
    imports: [],
    templateUrl: './window.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'compact:p-24 medium:p-32 large:p-40 xlarge:p-48',
    },
})
export class WindowComponent {}
