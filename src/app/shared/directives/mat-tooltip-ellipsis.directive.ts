import { Directive, ElementRef, inject } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { injectResize } from 'ngxtension/resize';
import { rxEffect } from 'ngxtension/rx-effect';
import { CdkObserveContent } from '@angular/cdk/observers';

@Directive({
    selector: '[matTooltipEllipsis]',
    standalone: true,
    hostDirectives: [MatTooltip, CdkObserveContent],
})
export class MatTooltipEllipsisDirective {
    #matTooltip = inject(MatTooltip);
    #elementRef = inject(ElementRef<HTMLElement>);
    #cdkObserveContent = inject(CdkObserveContent);
    #resize$ = injectResize();

    constructor() {
        rxEffect(this.#resize$, () => this.#updateTooltip());
        rxEffect(this.#cdkObserveContent.event.asObservable(), () =>
            this.#updateTooltip(),
        );
    }

    #updateTooltip(): void {
        const element = this.#elementRef.nativeElement;
        const text = element.textContent?.trim();

        if (!text || element.offsetWidth <= element.scrollWidth) {
            this.#matTooltip.disabled = true;
            return;
        }

        this.#matTooltip.message = text;
        this.#matTooltip.disabled = false;
    }
}
