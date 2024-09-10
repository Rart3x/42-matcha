import { injectRpcClient } from '@app/core/http/rpc-client';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { map, Observable, switchMap, timer } from 'rxjs';

export function injectUsernameExistsValidator() {
    const rpc = injectRpcClient();

    return (control: AbstractControl): Observable<ValidationErrors | null> =>
        timer(300).pipe(
            switchMap(() => rpc.usernameExists({ username: control.value })),
            map((res) => {
                if (!res.ok) {
                    return { exists: true };
                }
                if (res.data.exists == 'true') {
                    return { exists: true };
                }
                return null;
            }),
        );
}
