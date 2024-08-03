import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthLayoutComponent } from '@app/core/auth/auth-layout/auth-layout.component';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        AuthLayoutComponent,
        RouterModule,
        MatTooltipModule,
        ReactiveFormsModule,
    ],
    templateUrl: './login-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
    #fb = inject(FormBuilder);

    loginForm = this.#fb.nonNullable.group({
        username: ['', Validators.required],
        password: [''],
    });

    isPasswordHidden = signal(true);
    isPasswordHiddenToggle() {
        this.isPasswordHidden.set(!this.isPasswordHidden());
    }
}
