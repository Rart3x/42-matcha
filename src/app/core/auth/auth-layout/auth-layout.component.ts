import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LogoComponent } from '@app/shared/components/logo/logo.component';

@Component({
    selector: 'app-auth-layout',
    standalone: true,
    imports: [
        CommonModule,
        NgOptimizedImage,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        LogoComponent,
    ],
    templateUrl: './auth-layout.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {}
