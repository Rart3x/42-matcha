import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
    ActivatedRoute,
    ChildrenOutletContexts,
    Router,
    RouterOutlet,
} from '@angular/router';
import {
    animate,
    group,
    query,
    style,
    transition,
    trigger,
} from '@angular/animations';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div [@routeAnimations]="getRouteAnimationData()">
            <router-outlet></router-outlet>
        </div>
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
    #router = inject(Router);
    #activatedRoute = inject(ActivatedRoute);

    getRouteAnimationData() {
        return this.#contexts.getContext('primary')?.route?.snapshot?.data?.[
            'animation'
        ];
        this.#contexts.getContext('secondary')?.route?.snapshot?.data?.[
            'animation'
        ];
    }
}
