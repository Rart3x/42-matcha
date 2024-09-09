import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-registration-successful-page',
    standalone: true,
    imports: [MatAnchor, RouterLink],
    template: `
        <h1>Registration successful</h1>
        <p class="text-pretty pb-6">
            Your registration was successful. We have sent you an email with a link to verify your
            email address.
        </p>
        <a mat-stroked-button routerLink="login">go to login</a>
    `,
    host: {
        class: 'h-fit grid w-full medium:w-96 large:w-[28rem] xlarge:w-[32rem]',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationSuccessfulPageComponent {}
