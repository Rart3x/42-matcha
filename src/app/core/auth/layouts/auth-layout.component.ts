import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LogoComponent } from '@app/shared/components/logo/logo.component';
import { animate, style, transition, trigger } from '@angular/animations';

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
                <div class="flex grow justify-end">
                    <ng-content select="[auth-layout-top]" />
                </div>
            </div>

            <!-- Main content -->
            <div class="grid place-content-center">
                <ng-content />
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
export class AuthLayoutComponent {}
