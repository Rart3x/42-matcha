import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import { ConversationListComponent } from '@app/features/chat-page/conversation-list/conversation-list.component';
import { NgClass } from '@angular/common';
import { ToolbarComponent } from '@app/shared/components/toolbar/toolbar.component';

@Component({
    selector: 'app-chat-page',
    standalone: true,
    imports: [
        MatIcon,
        MatToolbarRow,
        MatToolbar,
        MatIconButton,
        MatTooltip,
        ConversationListComponent,
        RouterOutlet,
        NgClass,
        ToolbarComponent,
    ],
    host: { class: 'grid grid-rows-[auto_1fr] overflow-hidden absolute inset-0' },
    template: `
        <app-toolbar title="Chat" />

        <div
            class="relative mb-2 flex gap-8 overflow-hidden medium:mr-3 expanded:mr-6 expanded:rounded-tl-2xl"
        >
            <!-- Conversation list -->
            <app-conversation-list class="w-full expanded:w-[20rem] large:w-[26rem]" />

            <!-- Placeholder for when no conversation is selected -->
            @if (!outletActivated()) {
                <div class="grid grow place-content-center max-expanded:hidden">
                    <div class="flex flex-col items-center justify-center gap-4">
                        <mat-icon>chat</mat-icon>
                        <p class="text-center">Select a conversation to start chatting</p>
                    </div>
                </div>
            }

            <!-- Conversation page outlet -->
            <div
                [ngClass]="[
                    'absolute inset-0',
                    'bg-surface-container max-medium:px-2 max-expanded:pt-2',
                    'expanded:static expanded:flex-grow',
                    outletActivated() ? '' : 'hidden',
                ]"
            >
                <router-outlet
                    (activate)="outletActivated.set(true)"
                    (deactivate)="outletActivated.set(false)"
                />
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPageComponent {
    // hack to make isActivated outlet property reactive
    outletActivated = signal(false);
}
