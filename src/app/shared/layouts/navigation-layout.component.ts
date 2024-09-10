import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationRailLinkComponent } from '@app/shared/components/navigation-rail-link/navigation-rail-link.component';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { CdkPortalOutlet, Portal } from '@angular/cdk/portal';

@Component({
    selector: 'app-navigation-layout',
    standalone: true,
    imports: [
        RouterOutlet,
        NavigationRailLinkComponent,
        MatSidenavContainer,
        MatSidenav,
        MatSidenavContent,
        CdkPortalOutlet,
    ],
    template: `
        <mat-sidenav-container>
            <mat-sidenav opened position="end">
                <ng-template [cdkPortalOutlet]="sidesheetPortal" />
            </mat-sidenav>
            <mat-sidenav-content
                class="min-w-screen relative !flex min-h-screen bg-surface-container"
            >
                <!-- navigation rail -->
                <div class="flex h-screen w-20 flex-col justify-center">
                    <nav class="flex flex-col gap-3">
                        <app-navigation-rail-link
                            icon="home"
                            label="Home"
                            [active]="true"
                        ></app-navigation-rail-link>
                        <app-navigation-rail-link
                            icon="account_circle"
                            label="Profile"
                        ></app-navigation-rail-link>
                        <app-navigation-rail-link
                            icon="person_search"
                            label="Search"
                        ></app-navigation-rail-link>
                        <app-navigation-rail-link
                            icon="chat"
                            label="Chat"
                        ></app-navigation-rail-link>
                    </nav>
                    <!-- navigation rail content -->
                </div>

                <div class="flex min-h-screen grow flex-col overflow-auto">
                    <router-outlet></router-outlet>
                </div>
            </mat-sidenav-content>
        </mat-sidenav-container>
    `,
    host: {},
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationLayoutComponent {
    sidesheetPortal?: Portal<any>;
}
