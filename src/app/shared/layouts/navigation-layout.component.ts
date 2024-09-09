import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationRailLinkComponent } from '@app/shared/components/navigation-rail-link/navigation-rail-link.component';

@Component({
    selector: 'app-navigation-layout',
    standalone: true,
    imports: [RouterOutlet, NavigationRailLinkComponent],
    template: `
        <!-- navigation rail -->
        <div class="flex h-screen w-20 flex-col justify-center">
            <nav class="flex flex-col gap-3">
                <app-navigation-rail-link icon="home" label="Home"></app-navigation-rail-link>
                <app-navigation-rail-link icon="search" label="Search"></app-navigation-rail-link>
                <app-navigation-rail-link icon="chat" label="Chat"></app-navigation-rail-link>
            </nav>
            <!-- navigation rail content -->
        </div>

        <div class="min-h-screen grow overflow-auto">
            <router-outlet></router-outlet>
        </div>
    `,
    host: { class: 'relative block min-h-screen min-w-screen bg-surface-container flex' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationLayoutComponent {}
