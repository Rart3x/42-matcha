import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
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
import {
    injectMutation,
    injectQuery,
    injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { HttpClient } from '@angular/common/http';
import { catchError, lastValueFrom, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { SnackBarService } from '@app/core/services/snack-bar.service';

type Picture = {
    url: string;
    blob: Blob;
};

@Component({
    selector: 'app-edit-pictures-sheet',
    standalone: true,
    imports: [SidesheetComponent, MatTooltip, MatRipple, MatIcon, AsyncPipe, MatButton],
    template: `
        <app-sidesheet heading="Edit Pictures">
            <p class="mat-body-large">Choose beautiful pictures for your profile</p>

            @for (picture of pictures(); track picture) {
                <img class="h-20 w-20 rounded-lg" [src]="picture.url" alt="Picture" />
            }

            @if (pictures().length < 5) {
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
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPicturesSheetComponent implements OnDestroy {
    #httpClient = inject(HttpClient);
    #snackBar = inject(SnackBarService);
    #queryClient = injectQueryClient();

    #urlsToRevoke = new Set<string>();

    ngOnDestroy() {
        this.#urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    }

    #downloadedPicturesQuery = injectQuery(() => ({
        queryKey: ['pictures'],
        queryFn: () => {
            return Promise.all(Array.from({ length: 5 }, (_, index) => this.#fetchPicture(index)));
        },
    }));

    #uploadedPicturesMutation = injectMutation(() => ({
        mutationFn: (pictures: Picture[]) => {
            const formData = new FormData();
            pictures.forEach((picture) => {
                formData.append(
                    'pictures',
                    picture.blob,
                    `picture-${Date.now()}.${picture.blob.type.split('/')[1]}`,
                );
            });
            return lastValueFrom(this.#httpClient.post('/api/pictures', formData));
        },
        onSuccess: async () => {
            this.#snackBar.enqueueSnackBar('Pictures uploaded successfully');
            await this.#queryClient.invalidateQueries({ queryKey: ['pictures'] });
        },
        onError: () => {
            this.#snackBar.enqueueSnackBar('Failed to upload pictures');
        },
    }));

    pictures = signal([] as Picture[]);

    /**
     * Replace the pictures shown in the UI with the downloaded pictures on change
     */
    #downloadedPictures = computed(() => {
        const pictures = this.#downloadedPicturesQuery
            .data()
            ?.filter((picture) => picture !== null)
            ?.map((blob, index) => ({
                url: blob ? URL.createObjectURL(blob) : '',
                blob: blob,
            }));

        if (pictures) {
            for (const { url } of pictures) {
                this.#urlsToRevoke.add(url);
            }
        }
        return pictures ?? [];
    });

    #downloadedPicturesChangeEffect = effect(
        () => {
            this.pictures.set(this.#downloadedPictures());
        },
        {
            allowSignalWrites: true,
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
        if (this.pictures().length >= 5) {
            return;
        }

        const target = event.target as HTMLInputElement;
        const file = target.files?.[0] as File | undefined;

        if (file) {
            const url = URL.createObjectURL(file);
            this.#urlsToRevoke.add(url);

            const blob = new Blob([file], { type: file.type });

            this.pictures.set([...this.pictures(), { url, blob: blob }]);

            const fileInput = this.fileInput()?.nativeElement;
            if (fileInput) {
                fileInput.value = '';
            }
        }
    }

    onSubmit() {
        this.#uploadedPicturesMutation.mutate(this.pictures());
    }

    onReset() {
        this.pictures.set(this.#downloadedPictures());
    }
}
