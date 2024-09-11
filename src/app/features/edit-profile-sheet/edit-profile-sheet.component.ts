import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import { MatButton } from '@angular/material/button';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EditProfileFormComponent } from '@app/shared/components/edit-profile-form/edit-profile-form.component';

@Component({
    selector: 'app-edit-profile-sheet',
    standalone: true,
    imports: [SidesheetComponent, MatButton, MatProgressSpinner, EditProfileFormComponent],
    template: `
        <app-sidesheet heading="Edit Profile">
            <p class="mat-body-large">Update your profile information.</p>

            <!--            @if (profileQuery.isPending()) {-->
            <!--                <mat-spinner diameter="30"></mat-spinner>-->
            <!--            }-->
            <!--            @if (profileQuery.isError()) {-->
            <!--                <div class="text-red-500">{{ profileQuery.error() }}</div>-->
            <!--            }-->
            <!--            @if (profileQuery.data(); as form) {-->
            <app-edit-profile-form [initialValues]="{}" />
            <!--            }-->

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

    // profileQuery = injectQuery<RpcResponse<'getProfile'>, RpcError<'getProfile'>>(() => ({
    //     queryKey: ['profile'],
    //     queryFn: () => {
    //         return lastValueFrom(
    //             this.#rpc.getProfile().pipe(
    //                 map((res) => {
    //                     if (res.ok) {
    //                         return res.data;
    //                     }
    //                     throw new Error(res.error);
    //                 }),
    //             ),
    //         );
    //     },
    // }));
}
