import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';

@Component({
    selector: 'app-sidesheet-layout',
    standalone: true,
    imports: [MatSidenavContainer, MatSidenav, MatSidenavContent, RouterOutlet],
    template: `
        <mat-sidenav-container>
            <mat-sidenav
                [mode]="isLarge() ? 'side' : 'over'"
                [opened]="sidesheetOutlet.isActivated"
                (closed)="onClose()"
                position="end"
                class="relative !w-[min(25rem,calc(100vw-1rem))] large:!rounded-none large:!border-l large:!border-outline"
            >
                <router-outlet name="sidesheet" #sidesheetOutlet="outlet" />
            </mat-sidenav>
            <mat-sidenav-content class="relative">
                <ng-content />
            </mat-sidenav-content>
        </mat-sidenav-container>
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidesheetLayoutComponent {
    #router = inject(Router);
    #breakpointObserver = inject(BreakpointObserver);

    isLarge = toSignal(
        this.#breakpointObserver
            .observe('(min-width: 1200px)')
            .pipe(map((breakpoint) => breakpoint.matches)),
    );

    async onClose() {
        await this.#router.navigate([{ outlets: { sidesheet: null } }]);
    }
}
