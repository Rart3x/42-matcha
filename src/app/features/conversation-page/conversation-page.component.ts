import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconAnchor, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { BackButtonDirective } from '@app/shared/directives/back-button.directive';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-conversation-page',
    standalone: true,
    imports: [
        MatCard,
        MatCardContent,
        MatFormField,
        MatInput,
        MatHint,
        MatLabel,
        MatIconButton,
        MatSuffix,
        MatIcon,
        MatTooltip,
        BackButtonDirective,
        MatIconAnchor,
        RouterLink,
    ],
    host: { class: 'flex min-h-full relative flex-col gap-1' },
    template: `
        <mat-card appearance="outlined">
            <mat-card-content>
                <div class="flex gap-2">
                    <a mat-icon-button matTooltip="back" routerLink="/chat">
                        <mat-icon>arrow_back</mat-icon>
                    </a>
                    <h2 class="mat-display-small !mb-0">Conversation</h2>
                </div>
            </mat-card-content>
        </mat-card>

        <div class="grow"></div>

        <mat-card appearance="outlined">
            <mat-card-content>
                <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Message</mat-label>
                    <input matInput placeholder="Type a message" />
                    <mat-hint>Press Enter to send</mat-hint>
                    <button mat-icon-button matSuffix class="mr-2" matTooltip="send">
                        <mat-icon>send</mat-icon>
                    </button>
                </mat-form-field>
            </mat-card-content>
        </mat-card>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationPageComponent {}
