import { inject, Injector } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

export function injectBreakpoints(injector?: Injector) {
    return assertInjector(injectBreakpoints, injector, () => {
        const breakpointObserver = inject(BreakpointObserver);

        return toSignal(
            breakpointObserver
                .observe([
                    '(min-width: 600px)',
                    '(min-width: 840px)',
                    '(min-width: 1200px)',
                    '(min-width: 1600px)',
                ])
                .pipe(
                    map((state) => {
                        const isMedium = state.breakpoints['(min-width: 600px)'];
                        const isExpanded = state.breakpoints['(min-width: 840px)'];
                        const isLarge = state.breakpoints['(min-width: 1200px)'];
                        const isExtraLarge = state.breakpoints['(min-width: 1600px)'];

                        const isCompact = !isMedium;

                        return {
                            /** Whether the screen is compact size (max-width: 600px). */
                            isCompact,
                            /** Whether the screen is medium size (min-width: 600px). */
                            isMedium,
                            /** Whether the screen is large size (min-width: 840px). */
                            isExpanded,
                            /** Whether the screen is expanded size (min-width: 1200px). */
                            isLarge,
                            /** Whether the screen is extra-large size (min-width: 1600px). */
                            isExtraLarge,
                        };
                    }),
                ),
        );
    });
}
