import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-edit-pictures-sheet',
    standalone: true,
    imports: [SidesheetComponent, MatTooltip, MatRipple, MatIcon],
    template: `
        <app-sidesheet heading="Edit Pictures">
            <p class="mat-body-large">Choose beautiful pictures for your profile</p>

            <div
                matRipple
                matTooltip="Upload a picture"
                class="relative rounded-lg border-2 border-dashed border-gray-300 p-6"
                id="dropzone"
            >
                <input type="file" class="absolute inset-0 z-50 h-full w-full opacity-0" />
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
                            <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                class="sr-only"
                            />
                        </label>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>

                <img src="" class="mx-auto mt-4 hidden max-h-40" id="preview" />
            </div>
        </app-sidesheet>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPicturesSheetComponent {}
