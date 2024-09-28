import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconAnchor, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { FormsModule } from '@angular/forms';

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
        MatError,
        MatIconButton,
        MatSuffix,
        MatIcon,
        MatTooltip,
        MatIconAnchor,
        RouterLink,
        FormsModule,
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
                <form (ngSubmit)="onMessageSubmit()">
                    <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Message</mat-label>
                        <input
                            name="message"
                            matInput
                            placeholder="Type a message"
                            [(ngModel)]="message"
                            [disabled]="postMessage.isPending()"
                        />
                        <button
                            type="submit"
                            mat-icon-button
                            matSuffix
                            class="mr-2"
                            matTooltip="send"
                            [disabled]="!message() || postMessage.isPending()"
                        >
                            <mat-icon>send</mat-icon>
                        </button>
                        <mat-hint>Press Enter to send</mat-hint>
                    </mat-form-field>
                </form>
            </mat-card-content>
        </mat-card>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationPageComponent {
    #rpcClient = injectRpcClient();
    #queryClient = injectQueryClient();

    other_user_id = input.required<string>();
    receiver_id = computed(() => Number.parseInt(this.other_user_id(), 10));

    message = signal('');

    postMessage = injectMutation(() => ({
        mutationKey: ['postMessage'],
        mutationFn: this.#rpcClient.postMessage,
        onSuccess: async () => {
            await this.#queryClient.invalidateQueries({ queryKey: ['conversations'] });
            this.message.set('');
        },
    }));

    onMessageSubmit() {
        const message = this.message();
        if (message) {
            this.postMessage.mutate({ receiver_id: this.receiver_id(), message });
        }
    }
}
