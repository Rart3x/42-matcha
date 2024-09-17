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
import { MatButton, MatIconButton } from '@angular/material/button';
import { SnackBarService } from '@app/core/services/snack-bar.service';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Profile } from '@api/procedures/profile.procedure';

type Picture = {
    url: string;
    blob: Blob;
};

@Component({
    selector: 'app-edit-pictures-sheet',
    standalone: true,
    imports: [
        SidesheetComponent,
        MatTooltip,
        MatRipple,
        MatIcon,
        AsyncPipe,
        MatButton,
        CdkDropList,
        CdkDrag,
        MatIconButton,
    ],
    styles: [
        `
            .cdk-drag-preview .item {
                border-radius: 4px;
                box-shadow:
                    0 5px 5px -3px rgba(0, 0, 0, 0.2),
                    0 8px 10px 1px rgba(0, 0, 0, 0.14),
                    0 3px 14px 2px rgba(0, 0, 0, 0.12);
            }
            .cdk-drag-preview {
                overflow: hidden;
            }
            .cdk-drag-preview button {
                visibility: hidden;
            }

            .cdk-drag-placeholder {
                opacity: 0;
            }

            .cdk-drag-animating {
                transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
            }

            .list.cdk-drop-list-dragging .item:not(.cdk-drag-placeholder) {
                transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
            }
        `,
    ],
    template: `
        <app-sidesheet heading="Edit Pictures">
            <p class="mat-body-large">Choose beautiful pictures for your profile</p>

            <div
                class="list mb-4 flex flex-wrap content-evenly"
                cdkDropList
                cdkDropListOrientation="mixed"
                (cdkDropListDropped)="onReorder($event)"
            >
                @for (picture of pictures(); let i = $index; track picture.blob) {
                    <div
                        cdkDrag
                        class="item group rounded-lg border-2 border-t-0 border-transparent first:border-primary-container first:bg-primary-container"
                    >
                        <div
                            class="invisible text-center text-sm text-on-primary-container group-first:visible"
                        >
                            profile
                        </div>
                        <div class="relative size-fit">
                            <button
                                (click)="onRemove(i)"
                                matTooltip="Remove picture"
                                [style.display]="i === 0 ? 'none' : 'block'"
                                class="!absolute right-0 top-0 !z-50 -translate-y-1/2 translate-x-1/2 scale-75"
                                mat-icon-button
                            >
                                <mat-icon>close</mat-icon>
                            </button>
                            <img
                                class="h-20 w-20 cursor-move rounded-lg"
                                [src]="picture.url"
                                [matTooltip]="i === 0 ? 'Profile picture' : null"
                                alt="Picture"
                            />
                        </div>
                    </div>
                }
            </div>

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
                        <p class="mt-1 text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
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
        return lastValueFrom(
            this.#httpClient
                .get<Blob>(`/api/pictures/principal/${index}`, {
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

    onReorder($event: CdkDragDrop<Profile[]>) {
        const pictures = this.pictures();
        moveItemInArray(this.pictures(), $event.previousIndex, $event.currentIndex);
        this.pictures.set(pictures);
    }

    onRemove(index: number) {
        const pictures = this.pictures();
        pictures.splice(index, 1);
        this.pictures.set(pictures);
    }
}
