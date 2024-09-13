import { AfterViewInit, Directive, output } from '@angular/core';

@Directive({
    selector: '[appAfterViewInit]',
    standalone: true,
})
export class AfterViewInitDirective implements AfterViewInit {
    appAfterViewInit = output();

    ngAfterViewInit(): void {
        this.appAfterViewInit.emit();
    }
}
