import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LogoComponent } from '@app/shared/components/logo/logo.component';
import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, map } from 'rxjs';

const leftToRightTransition = () => [
    style({
        position: 'relative',
        display: 'block',
        overflow: 'hidden',
    }),
    query(':enter, :leave', [
        style({
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
        }),
    ]),
    query(':enter', [style({ opacity: 0 })]),
    query(':leave', [style({ opacity: 1 })]),
    query(':enter', [style({ transform: 'translateX(-100%) translateY(-50%)' })]),
    group([
        query(':leave', [animate('0.1s', style({ opacity: 0 }))]),
        query(':enter', [animate('0.2s', style({ opacity: 1 }))]),
        query(':leave', [
            animate(
                '0.2s',
                style({
                    transform: 'translateX(0) translateY(-50%)',
                    scale: 0.9,
                }),
            ),
        ]),
        query(':enter', [
            animate(
                '0.2s',
                style({
                    transform: 'translateX(-50%) translateY(-50%)',
                }),
            ),
        ]),
    ]),
];
const rightToLeftTransition = () => [
    // tab-like forward and back animations slide in and out with opacity change
    style({
        position: 'relative',
        display: 'block',
        overflow: 'hidden',
    }),
    query(':enter, :leave', [
        style({
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
        }),
    ]),
    query(':enter', [style({ opacity: 0 })]),
    query(':leave', [style({ opacity: 1 })]),
    query(':enter', [style({ transform: 'translateX(100%) translateY(-50%)' })]),
    group([
        query(':leave', [animate('0.1s', style({ opacity: 0 }))]),
        query(':enter', [animate('0.2s', style({ opacity: 1 }))]),
        query(':leave', [
            animate(
                '0.2s',
                style({
                    transform: 'translateX(-100%) translateY(-50%)',
                }),
            ),
        ]),
        query(':enter', [
            animate(
                '0.2s',
                style({
                    transform: 'translateX(-50%) translateY(-50%)',
                }),
            ),
        ]),
    ]),
];

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
            @slideIn
            class="hidden w-[500px] overflow-x-hidden web-landscape:grid [&>*]:[grid-area:1/1]"
            aria-hidden="true"
        >
            <div class="h-full w-[92%] rounded-xlarge bg-surface"></div>
            <div class="grid h-full grid-rows-[auto_1fr]">
                <app-logo />
                <div class="relative grid place-content-center">
                    <div class="relative w-full">
                        <img
                            id="machine"
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
        <div class="grid flex-grow grid-rows-[auto_1fr] text-on-surface">
            <!-- Top bar -->
            <div class="flex items-center">
                <app-logo class="web-landscape:hidden" />
                <div class="flex grow items-baseline justify-end gap-1">
                    @if (page() === 'login' || page() === 'request-password-reset') {
                        <span class="hidden medium:inline"> Don't have an account? </span>
                        <a mat-button routerLink="/register">Sign up</a>
                    }
                    @if (page() === 'register') {
                        <span class="hidden medium:inline"> Got an account? </span>
                        <a mat-button routerLink="/login">Sign in</a>
                    }
                </div>
            </div>

            <!-- Main content -->
            <div class="flex items-center justify-center" [@routeAnimations]="page()">
                <router-outlet />
            </div>
        </div>
    `,
    host: {
        role: 'main',
        class: 'min-w-screen relative flex min-h-screen gap-6 overflow-auto p-4 medium:p-6 bg-surface-container-low',
    },
    animations: [
        // slide-in-from-left
        trigger('slideIn', [
            transition('void => *', [
                group([
                    query(':self', [style({ transform: 'translateX(-3rem)' }), animate(400)]),
                    query('#machine', [style({ transform: 'translateX(-2rem)' }), animate(400)]),
                ]),
            ]),
        ]),
        trigger('routeAnimations', [
            transition('login => register', rightToLeftTransition()),
            transition('register => login', leftToRightTransition()),
            transition('register => registration-successful', leftToRightTransition()),
            transition('registration-successful => login', leftToRightTransition()),
            transition('login => request-password-reset', rightToLeftTransition()),
            transition('request-password-reset => login', leftToRightTransition()),
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
