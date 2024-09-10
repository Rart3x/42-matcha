import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-sidesheet-layout',
    standalone: true,
    imports: [MatSidenavContainer, MatSidenav, MatSidenavContent, RouterOutlet],
    template: `
        <mat-sidenav-container>
            <mat-sidenav
                [opened]="sidesheetOutlet.isActivated"
                (closed)="onClose()"
                position="end"
                class="!w-[min(25rem,calc(100vw-1rem))]"
            >
                <div class="relative min-h-full !w-[min(25rem,calc(100vw-1rem))] overflow-x-hidden">
                    <router-outlet name="sidesheet" #sidesheetOutlet="outlet" />
                </div>
            </mat-sidenav>
            <mat-sidenav-content class="min-w-screen relative min-h-screen">
                <ng-content />
            </mat-sidenav-content>
        </mat-sidenav-container>
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidesheetLayoutComponent {
    #router = inject(Router);

    async onClose() {
        await this.#router.navigate([{ outlets: { sidesheet: null } }]);
    }
}
