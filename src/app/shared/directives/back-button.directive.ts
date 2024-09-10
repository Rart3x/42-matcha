import { Directive, HostListener, inject } from '@angular/core';
import { Location } from '@angular/common';

@Directive({
    selector: '[appBackButton]',
    standalone: true,
})
export class BackButtonDirective {
    #location = inject(Location);

    @HostListener('click')
    onClick() {
        this.#location.back();
    }
}
