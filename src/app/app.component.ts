import { ChangeDetectionStrategy, Component, inject, isDevMode } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { AngularQueryDevtools } from '@tanstack/angular-query-devtools-experimental';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, AngularQueryDevtools],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [@routeAnimations]="getRouteAnimationData()">
            <router-outlet></router-outlet>
        </div>

        @defer (when isDevMode()) {
            <angular-query-devtools />
        }
    `,
    animations: [
        trigger('routeAnimations', [
            // fade in and out
            transition('home <=> auth', [
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
            ]),
        ]),
    ],
})
export class AppComponent {
    #contexts = inject(ChildrenOutletContexts);

    getRouteAnimationData() {
        return this.#contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    }

    protected readonly isDevMode = isDevMode;
}
