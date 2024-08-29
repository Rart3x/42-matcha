import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { AuthService } from '@app/core/auth/auth.service';

@Component({
    selector: 'app-home-page',
    standalone: true,
    imports: [MatButton],
    template: `
        <p>home-page works!</p>
        <button mat-button (click)="onClick()">log out</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
    #authService = inject(AuthService);

    onClick() {
        this.#authService.logout().pipe().subscribe();
    }
}
