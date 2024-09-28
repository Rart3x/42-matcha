import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavigationRailLinkComponent } from '@app/shared/components/navigation-rail-link/navigation-rail-link.component';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { SidesheetLayoutComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet-layout.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-navigation-layout',
    standalone: true,
    imports: [
        RouterOutlet,
        NavigationRailLinkComponent,
        MatSidenavContainer,
        SidesheetLayoutComponent,
        RouterLink,
        RouterLinkActive,
        NgClass,
    ],
    template: `
        <app-sidesheet-layout>
            <div
                [ngClass]="[
                    'overflow-hidden',
                    'h-screen w-full',
                    'bg-surface-container',
                    'grid medium:grid-cols-[auto_1fr] max-medium:grid-rows-[1fr_auto]',
                ]"
            >
                <!-- navigation rail -->
                <div
                    [ngClass]="[
                        'flex items-center justify-center',
                        'flex-row medium:flex-col',
                        'medium:w-20 max-medium:h-20',
                        'max-medium:row-start-2',
                    ]"
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
                </div>

                <!-- page content -->
                <div class="relative">
                    <router-outlet />
                </div>
            </div>
        </app-sidesheet-layout>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationLayoutComponent {}
