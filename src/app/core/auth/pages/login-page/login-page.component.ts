import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    effect,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthLayoutComponent } from '@app/core/auth/auth-layout/auth-layout.component';
import { Router, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@app/core/auth/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, tap, timer } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
        MatProgressSpinnerModule,
    ],
    templateUrl: './login-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
    #fb = inject(FormBuilder);
    #router = inject(Router);
    #destroyRef = inject(DestroyRef);
    #authService = inject(AuthService);

    loginForm = this.#fb.nonNullable.group({
        username: ['', Validators.required],
        password: [''],
    });

    invalidCredentials = signal(false);

    isPasswordHidden = signal(true);
    isPasswordHiddenToggle() {
        this.isPasswordHidden.set(!this.isPasswordHidden());
    }

    isSubmitting = signal(false);

    #formDisabledEffect = effect(() => {
        if (this.isSubmitting()) {
            this.loginForm.disable();
        } else {
            this.loginForm.enable();
        }
    });

    login() {
        const { username, password } = this.loginForm.value;

        if (!this.loginForm.valid || !username || !password) {
            return;
        }

        this.isSubmitting.set(true);

        forkJoin({
            result: this.#authService.login(username, password),
            minimumDelay: timer(1000),
        })
            .pipe(
                takeUntilDestroyed(this.#destroyRef),

                tap(({ result }) => {
                    this.isSubmitting.set(false);

                    if (result) {
                        void this.#router.navigate(['/']);
                    } else {
                        this.invalidCredentials.set(true);
                    }
                }),
            )
            .subscribe();
    }
}
