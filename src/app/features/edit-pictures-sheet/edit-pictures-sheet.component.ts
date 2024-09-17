import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    signal,
    viewChild,
} from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { HttpClient } from '@angular/common/http';
import { catchError, filter, lastValueFrom, map, of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { rxEffect } from 'ngxtension/rx-effect';

@Component({
    selector: 'app-edit-pictures-sheet',
    standalone: true,
    imports: [SidesheetComponent, MatTooltip, MatRipple, MatIcon, AsyncPipe],
    template: `
        <app-sidesheet heading="Edit Pictures">
            <p class="mat-body-large">Choose beautiful pictures for your profile</p>

            @for (url of urls(); track url) {
                @if (url) {
                    <img class="h-20 w-20 rounded-lg" [src]="url" alt="Picture" />
                }
            }

            @if (urls().length < 5) {
                <div
                    matRipple
                    matTooltip="Upload a picture"
                    class="relative rounded-lg border-2 border-dashed border-gray-300 p-6"
                    id="dropzone"
                >
                    <input
                        type="file"
                        class="absolute inset-0 z-50 h-full w-full opacity-0"
                        (change)="onFileChange($event)"
                        #fileInput
                    />
                    <div class="text-center">
                        <img
                            class="mx-auto h-12 w-12"
                            src="https://www.svgrepo.com/show/357902/image-upload.svg"
                            alt=""
                        />

                        <div class="mt-4 text-sm font-medium text-gray-900">
                            <label for="file-upload" class="relative cursor-pointer">
                                <span>Drag and drop</span>
                                <span class="text-indigo-600"> or browse</span>
                                <span> to upload</span>
                            </label>
                        </div>
                        <p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </div>
            }
        </app-sidesheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPicturesSheetComponent implements OnDestroy {
    #httpClient = inject(HttpClient);

    #urlsToRevoke = new Set<string>();

    ngOnDestroy() {
        this.#urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    }

    #downloadedPictures = injectQuery(() => ({
        queryKey: ['pictures'],
        queryFn: () => {
            return Promise.all(Array.from({ length: 5 }, (_, index) => this.#fetchPicture(index)));
        },
    }));

    /**
     * Urls show in the UI
     */
    urls = signal<string[]>([]);

    /**
     * Replace the pictures shown in the UI with the downloaded pictures on change
     */
    #downloadedPicturesEffect = rxEffect(
        toObservable(this.#downloadedPictures.data).pipe(
            filter((pictures) => pictures !== undefined),
            map((pictures) =>
                pictures.map((picture) => (picture ? URL.createObjectURL(picture) : null)),
            ),
        ),
        (urls) => {
            const nonNullUrls = urls.filter((url) => url !== null);

            for (const url of nonNullUrls) {
                this.#urlsToRevoke.add(url);
            }
            this.urls.set(nonNullUrls);
        },
    );

    #fetchPicture(index: number) {
        // TODO: use principal user id
        return lastValueFrom(
            this.#httpClient
                .get<Blob>(`/api/pictures/1/${index}`, {
                    responseType: 'blob' as 'json',
                })
                .pipe(catchError(() => of(null))),
        );
    }

    fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

    onFileChange(event: Event) {
        console.log('onFileChange');
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0] as File | undefined;

        if (file) {
            const url = URL.createObjectURL(file);
            this.#urlsToRevoke.add(url);
            this.urls.set([...this.urls(), url]);

            const fileInput = this.fileInput()?.nativeElement;
            if (fileInput) {
                fileInput.value = '';
            }
        }
    }
}
