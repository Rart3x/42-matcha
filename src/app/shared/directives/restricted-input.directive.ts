import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

@Directive({
    selector: '[appRestrictedInput]',
    standalone: true,
})
export class RestrictedInputDirective {
    #el = inject(ElementRef);

    pattern = input<string>();
    maxLength = input<number>();

    @HostListener('document:keypress', ['$event'])
    onKeyPress(event: KeyboardEvent) {
        const oldValue = this.#el.nativeElement.value;
        const newKey = event.key;

        const pattern = this.pattern();
        if (pattern) {
            const regex = new RegExp(pattern);
            if (!regex.test(newKey)) {
                event.preventDefault();
            }
        }

        const newLength = oldValue.length + 1;
        const maxLength = this.maxLength();
        if (maxLength && newLength > maxLength) {
            event.preventDefault();
        }
    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent) {
        const oldValue = this.#el.nativeElement.value;
        const newContent = event.clipboardData?.getData('text/plain');

        if (!newContent) {
            event.preventDefault();
            return;
        }

        const pattern = this.pattern();
        if (pattern) {
            const regex = new RegExp(pattern);
            if (!regex.test(newContent)) {
                event.preventDefault();
            }
        }

        const newLength = oldValue.length + newContent.length;
        const maxLength = this.maxLength();
        if (maxLength && newLength > maxLength) {
            event.preventDefault();
        }
    }
}
