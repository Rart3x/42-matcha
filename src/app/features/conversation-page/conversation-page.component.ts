import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-conversation-page',
  standalone: true,
  imports: [],
  template: `
    <p>
      conversation-page works!
    </p>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationPageComponent {

}
