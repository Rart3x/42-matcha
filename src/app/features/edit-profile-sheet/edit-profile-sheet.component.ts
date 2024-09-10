import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOption, MatSelect } from '@angular/material/select';
import { RxLet } from '@rx-angular/template/let';
import { MatTooltipEllipsisDirective } from '@app/shared/directives/mat-tooltip-ellipsis.directive';
import { MatButton } from '@angular/material/button';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { injectRpcClient, RpcError, RpcResponse } from '@app/core/http/rpc-client';
import { lastValueFrom, map } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-edit-profile-sheet',
    standalone: true,
    imports: [
        SidesheetComponent,
        MatFormField,
        MatInput,
        ReactiveFormsModule,
        MatSelect,
        MatOption,
        MatLabel,
        MatHint,
        MatError,
        RxLet,
        MatTooltipEllipsisDirective,
        MatButton,
        MatProgressSpinner,
    ],
    template: `
        <app-sidesheet heading="Edit Profile">
            <p class="mat-body-large">Update your profile information.</p>

            @switch (profileQuery.status()) {
                @case ('pending') {
                    <mat-spinner diameter="30"></mat-spinner>
                }
                @case ('error') {
                    <div class="text-red-500">{{ profileQuery.error }}</div>
                }
                @case ('success') {}
            }

            <ng-container bottom-actions>
                <button type="submit" form="profile-form" mat-flat-button class="btn-primary">
                    Save
                </button>
                <button type="submit" form="profile-form" mat-stroked-button class="btn-primary">
                    Reset
                </button>
            </ng-container>
        </app-sidesheet>
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileSheetComponent {
    #rpc = injectRpcClient();

    profileQuery = injectQuery<Promise<RpcResponse<'getProfile'>>, RpcError<'getProfile'>>(() => ({
        queryKey: ['profile'],
        queryFn: () => {
            return lastValueFrom(
                this.#rpc.getProfile().pipe(
                    map((res) => {
                        if (!res.ok) {
                            throw new Error(res.error);
                        }
                        return res.data;
                    }),
                ),
            );
        },
    }));
}
