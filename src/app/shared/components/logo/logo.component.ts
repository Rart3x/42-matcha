import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-logo',
    standalone: true,
    imports: [NgOptimizedImage],
    templateUrl: './logo.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {}
