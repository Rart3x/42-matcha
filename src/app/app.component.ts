import { ChangeDetectionStrategy, Component, inject, isDevMode } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { AngularQueryDevtools } from '@tanstack/angular-query-devtools-experimental';
import { MatAnchor, MatFabAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

const blinkAnimation = () => [
    style({ position: 'relative' }),
    query(':enter, :leave', [
        style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
        }),
    ]),
    query(':enter', [style({ opacity: 0 })]),
    query(':leave', [style({ opacity: 1 })]),
    group([
        query(':leave', [animate('0.1s', style({ opacity: 0 }))]),
        query(':enter', [animate('0.1s', style({ opacity: 1 }))]),
    ]),
    query(':enter', [style({ backgroundColor: 'red' })]),
];

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, AngularQueryDevtools, MatFabAnchor, MatIcon, MatAnchor],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [@routeAnimations]="getRouteAnimationData()">
            <router-outlet></router-outlet>
        </div>

        @defer (when isDevMode()) {
            <angular-query-devtools />
        }

        @if (isDevMode()) {
            <div class="fixed bottom-2 left-2 z-50 h-fit w-fit">
                <a mat-fab extended href="http://localhost:8025/" target="_blank">
                    <mat-icon>email</mat-icon>
                    mailhog
                </a>
            </div>
        }
    `,
    animations: [
        trigger('routeAnimations', [
            // fade in and out
            transition('home <=> auth', blinkAnimation()),
            transition('home <=> browse', blinkAnimation()),
            transition('auth <=> browse', blinkAnimation()),
            transition('home <=> chat', blinkAnimation()),
            transition('auth <=> chat', blinkAnimation()),
            transition('browse <=> chat', blinkAnimation()),
        ]),
    ],
})
export class AppComponent {
    #contexts = inject(ChildrenOutletContexts);

    getRouteAnimationData() {
        const animation =
            this.#contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
        if (animation) {
            return animation;
        }
        return this.#contexts.getContext('primary')?.route?.snapshot?.children?.[0]?.data?.[
            'animation'
        ];
    }

    protected readonly isDevMode = isDevMode;
}
