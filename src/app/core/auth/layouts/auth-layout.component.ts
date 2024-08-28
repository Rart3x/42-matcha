import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LogoComponent } from '@app/shared/components/logo/logo.component';
import { animate, style, transition, trigger } from '@angular/animations';
import {
    NavigationEnd,
    Router,
    RouterLink,
    RouterOutlet,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, map } from 'rxjs';

@Component({
    selector: 'app-auth-layout',
    standalone: true,
    imports: [
        CommonModule,
        NgOptimizedImage,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        LogoComponent,
        RouterLink,
        RouterOutlet,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <!-- Left panel (visible on web landscape screens) -->
        <div
            class="hidden w-[500px] overflow-x-hidden web-landscape:grid [&>*]:[grid-area:1/1]"
            aria-hidden="true"
        >
            <div
                class="bg-surface-container h-full w-[92%] rounded-xlarge"
            ></div>
            <div class="grid h-full grid-rows-[auto_1fr]">
                <app-logo />
                <div class="relative grid place-content-center">
                    <div class="relative w-full">
                        <img
                            [@slideIn]
                            priority
                            ngSrc="/landscape.png"
                            width="1024"
                            height="1024"
                            alt="Landscape"
                            class="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Right panel (main content) -->
        <div class="grid flex-grow grid-rows-[auto_1fr]">
            <!-- Top bar -->
            <div class="flex items-center">
                <app-logo class="web-landscape:hidden" />
                <div class="flex grow items-baseline justify-end gap-1">
                    @if (page() === 'login') {
                        <span class="text-outline hidden medium:inline">
                            Don't have an account?
                        </span>
                        <a mat-button routerLink="/register">Sign up</a>
                    }
                    @if (page() === 'register') {
                        <span class="text-outline hidden medium:inline">
                            Got an account?
                        </span>
                        <a mat-button routerLink="/login">Sign in</a>
                    }
                </div>
            </div>

            <!-- Main content -->
            <div class="grid place-content-center">
                <router-outlet />
            </div>
        </div>
    `,
    host: {
        role: 'main',
        class: 'min-w-screen relative flex min-h-screen gap-6 overflow-auto p-4 medium:p-6',
    },
    animations: [
        // slide-in-from-left
        trigger('slideIn', [
            transition('void => *', [
                style({ transform: 'translateX(-10%)' }),
                animate(300),
            ]),
        ]),
    ],
})
export class AuthLayoutComponent {
    readonly page = toSignal(
        inject(Router).events.pipe(
            filter((event) => event instanceof NavigationEnd),
            map(({ url }) => url.split('/').pop()),
            distinctUntilChanged(),
        ),
    );
}
