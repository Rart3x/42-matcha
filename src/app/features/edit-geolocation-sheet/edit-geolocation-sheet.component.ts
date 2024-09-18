import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    effect,
    inject,
    signal,
} from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import { MatButton } from '@angular/material/button';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { icon, Icon, latLng, Marker, marker, tileLayer } from 'leaflet';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import {
    injectMutation,
    injectQuery,
    injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { SnackBarService } from '@app/core/services/snack-bar.service';

@Component({
    selector: 'app-edit-geolocation-sheet',
    standalone: true,
    imports: [SidesheetComponent, MatButton, LeafletModule, MatSlideToggle, FormsModule],
    template: `
        <app-sidesheet heading="Edit Position">
            <p class="mat-body-large">Match with people near you</p>

            <mat-slide-toggle class="mb-4" [(ngModel)]="positionShared">
                Share my position
            </mat-slide-toggle>

            @if (positionShared()) {
                <div style="height: 300px;" leaflet [leafletOptions]="options"></div>
            }

            <ng-container bottom-actions>
                <button type="button" (click)="onSubmit()" mat-flat-button class="btn-primary">
                    Save
                </button>
                <button type="button" (click)="onReset()" mat-stroked-button class="btn-primary">
                    Reset
                </button>
            </ng-container>
        </app-sidesheet>
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditGeolocationSheetComponent {
    #rpcClient = injectRpcClient();
    #changeDetection = inject(ChangeDetectorRef);
    #snackBarService = inject(SnackBarService);
    #queryClient = injectQueryClient();

    positionShared = signal(false);

    currentLocationQuery = injectQuery(() => ({
        queryKey: ['currentLocation'],
        queryFn: () => this.#rpcClient.getPrincipalUserLocation(),
    }));

    currentLocationMutation = injectMutation(() => ({
        mutationKey: ['currentLocationMutation'],
        mutationFn: this.#rpcClient.upsertLocation,
        onSuccess: async () => {
            this.#snackBarService.enqueueSnackBar('Location updated');
            await this.#queryClient.invalidateQueries({ queryKey: ['currentLocation'] });
        },
        onError: async () => {
            this.#snackBarService.enqueueSnackBar('Failed to update location');
        },
    }));

    #currentLocationFetchedEffect = effect(
        () => {
            const location = this.currentLocationQuery.data()?.location;

            if (location) {
                const marker = this.options.layers[1] as Marker;
                marker.setLatLng(latLng(location.latitude, location.longitude)); // reposition marker
                this.options.center = latLng(location.latitude, location.longitude); // recenter map
                this.#changeDetection.markForCheck();

                this.positionShared.set(true);
            }
        },
        {
            allowSignalWrites: true,
        },
    );

    options = {
        layers: [
            tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
            }),
            marker([45.65535637267172, 0.15913728259653068], {
                draggable: true,
                icon: icon({
                    ...Icon.Default.prototype.options,
                    iconUrl: 'assets/marker-icon.png',
                    iconRetinaUrl: 'assets/marker-icon-2x.png',
                    shadowUrl: 'assets/marker-shadow.png',
                }),
            }),
        ],
        zoom: 14,
        center: latLng(45.65535637267172, 0.15913728259653068),
    };

    onSubmit() {
        const positionShared = this.positionShared();

        if (positionShared) {
            const marker = this.options.layers[1] as Marker;

            const latitude = marker.getLatLng().lat;
            const longitude = marker.getLatLng().lng;

            this.currentLocationMutation.mutate({ location: { latitude, longitude } });
        } else {
            this.currentLocationMutation.mutate({ location: undefined });
        }
    }

    onReset() {
        const location = this.currentLocationQuery.data()?.location;

        const lat = location?.latitude ?? 45.65535637267172;
        const lng = location?.longitude ?? 0.15913728259653068;

        const marker = this.options.layers[1] as Marker;
        marker.setLatLng(latLng(lat, lng));
        this.#changeDetection.markForCheck();

        this.positionShared.set(!!location);
    }
}
