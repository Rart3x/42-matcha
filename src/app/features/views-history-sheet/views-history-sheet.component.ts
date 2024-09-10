import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';

@Component({
    selector: 'app-views-history-sheet',
    standalone: true,
    imports: [SidesheetComponent],
    template: ` <app-sidesheet title="Views History"> Hello, World! </app-sidesheet> `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewsHistorySheetComponent {}
