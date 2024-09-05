import { Directive, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { injectResize } from 'ngxtension/resize';
import { CdkObserveContent } from '@angular/cdk/observers';
import { isPlatformBrowser } from '@angular/common';
import { rxEffect } from 'ngxtension/rx-effect';
import { fromEvent, merge } from 'rxjs';

@Directive({
    selector: '[matTooltipEllipsis]',
    standalone: true,
    hostDirectives: [MatTooltip, CdkObserveContent],
    host: { class: '!line-clamp-1' },
})
export class MatTooltipEllipsisDirective {
    #PLATFORM_ID = inject(PLATFORM_ID);
    #matTooltip = inject(MatTooltip);
    #elementRef = inject(ElementRef<HTMLElement>);

    #resize$ = injectResize();
    #contentChanged$ = inject(CdkObserveContent).event.asObservable();

    constructor() {
        if (isPlatformBrowser(this.#PLATFORM_ID)) {
            rxEffect(
                merge(
                    this.#resize$,
                    this.#contentChanged$,
                    fromEvent(this.#elementRef.nativeElement, 'mouseenter'),
                ),
                () => {
                    const element = this.#elementRef.nativeElement;

                    if (element.clientHeight < element.scrollHeight) {
                        this.#matTooltip.message = element.textContent?.trim();
                        this.#matTooltip.disabled = false;
                    } else {
                        this.#matTooltip.disabled = true;
                    }
                },
            );
        }
    }
}
