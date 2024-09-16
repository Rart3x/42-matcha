import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavigationRailLinkComponent } from '@app/shared/components/navigation-rail-link/navigation-rail-link.component';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { SidesheetLayoutComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet-layout.component';

@Component({
    selector: 'app-navigation-layout',
    standalone: true,
    imports: [
        RouterOutlet,
        NavigationRailLinkComponent,
        MatSidenavContainer,
        CdkPortalOutlet,
        SidesheetLayoutComponent,
        RouterLink,
        RouterLinkActive,
    ],
    template: `
        <app-sidesheet-layout>
            <div
                class="min-w-screen flex min-h-screen bg-surface-container-low max-medium:h-screen max-medium:flex-col-reverse"
            >
                <!-- navigation rail -->
                <div
                    class="flex justify-center medium:h-screen medium:w-20 medium:flex-col max-medium:min-h-20"
                >
                    <nav class="flex gap-3 medium:flex-col">
                        <app-navigation-rail-link
                            icon="home"
                            label="Home"
                            routerLink="/home"
                            routerLinkActive="active"
                        />
                        <app-navigation-rail-link
                            icon="person_search"
                            label="Browse"
                            routerLink="/browse"
                            routerLinkActive="active"
                        />
                        <app-navigation-rail-link
                            icon="chat"
                            label="Chat"
                            routerLink="/chat"
                            routerLinkActive="active"
                        />
                    </nav>
                    <!-- navigation rail content -->
                </div>

                <div
                    class="max-medium:min-w-screen relative grow overflow-auto medium:min-h-screen"
                >
                    <router-outlet></router-outlet>
                </div>
            </div>
        </app-sidesheet-layout>
    `,
    host: {},
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationLayoutComponent {}
