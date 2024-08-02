import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WindowComponent } from '@app/shared/components/window/window.component';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [WindowComponent],
    templateUrl: './login-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {}
